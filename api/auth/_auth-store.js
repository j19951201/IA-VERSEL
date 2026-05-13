const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { put, list, head } = require("@vercel/blob");

const FALLBACK_STORE_PATH = path.resolve(__dirname, "../../runtime-logs/auth-users-fallback.json");

function ensureFallbackStoreDir() {
  const dir = path.dirname(FALLBACK_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readFallbackUsers() {
  try {
    if (!fs.existsSync(FALLBACK_STORE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(FALLBACK_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function writeFallbackUsers(users) {
  try {
    ensureFallbackStoreDir();
    fs.writeFileSync(FALLBACK_STORE_PATH, JSON.stringify(users || [], null, 2), "utf8");
  } catch (_err) {
    // Ignorar errores de fallback de archivo para no romper auth.
  }
}

function getGlobalMemoryStore() {
  const key = "__IAJURIS_AUTH_MEMORY_STORE__";
  if (!global[key]) {
    global[key] = {
      usersByEmail: new Map(),
      usersById: new Map(),
      verifyTokens: new Map(),
      resetTokens: new Map()
    };
  }
  return global[key];
}

function hasKvConfig() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function hasBlobConfig() {
  return !!String(process.env.BLOB_READ_WRITE_TOKEN || "").trim();
}

function blobUserPath(email) {
  const normalized = String(email || "").toLowerCase();
  return `auth/users/${normalized}.json`;
}

function blobUserPathLegacy(email) {
  const normalized = String(email || "").toLowerCase();
  return `auth/users/${encodeURIComponent(normalized)}.json`;
}

function blobUserIdPath(id) {
  const normalized = String(id || "").trim();
  return `auth/userids/${normalized}.txt`;
}

async function blobReadText(pathnameOrUrl) {
  try {
    let targetUrl = String(pathnameOrUrl || "");

    // Si es un pathname (no URL completa), buscar la URL real del blob
    if (!targetUrl.startsWith("http")) {
      const page = await list({ prefix: targetUrl, limit: 10 });
      const blobs = Array.isArray(page && page.blobs) ? page.blobs : [];
      const found = blobs.find((b) => b.pathname === targetUrl);
      if (!found || !found.url) return "";
      targetUrl = found.url;
    }

    const response = await fetch(targetUrl);
    if (!response.ok) return "";
    return await response.text();
  } catch (_err) {
    return "";
  }
}

async function blobGetUserByEmail(email) {
  try {
    const raw = await blobReadText(blobUserPath(email));
    if (raw) return safeJsonParse(raw, null);

    // Compatibilidad con versiones previas que guardaron pathname encodeado.
    const legacy = await blobReadText(blobUserPathLegacy(email));
    return legacy ? safeJsonParse(legacy, null) : null;
  } catch (_err) {
    return null;
  }
}

async function blobGetUserById(id) {
  try {
    const rawEmail = await blobReadText(blobUserIdPath(id));
    const email = String(rawEmail || "").trim();
    if (!email) return null;
    return await blobGetUserByEmail(email);
  } catch (_err) {
    return null;
  }
}

async function blobSaveUser(user) {
  const email = String(user.email || "").toLowerCase();
  await put(blobUserPath(email), JSON.stringify(user), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });

  await put(blobUserIdPath(user.id), email, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "text/plain"
  });
}

async function blobListUsers() {
  const users = [];
  let cursor;

  do {
    const page = await list({ prefix: "auth/users/", limit: 1000, cursor });
    const blobs = Array.isArray(page.blobs) ? page.blobs : [];

    for (const blob of blobs) {
      try {
        const raw = await blobReadText(blob.url || blob.pathname);
        if (!raw) continue;
        const parsed = safeJsonParse(raw, null);
        if (parsed && parsed.email) users.push(parsed);
      } catch (_err) {
      }
    }

    cursor = page && page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return users;
}

async function kvCommand(command) {
  const baseUrl = String(process.env.KV_REST_API_URL || "").trim();
  const token = String(process.env.KV_REST_API_TOKEN || "").trim();
  if (!baseUrl || !token) {
    throw new Error("KV no configurado");
  }

  const response = await fetch(`${baseUrl}/pipeline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ commands: [command] })
  });

  if (!response.ok) {
    throw new Error(`KV HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || !payload.length) {
    return null;
  }

  if (payload[0] && payload[0].error) {
    throw new Error(String(payload[0].error));
  }

  return payload[0] ? payload[0].result : null;
}

function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (_err) {
    return fallback;
  }
}

function keyUser(email) {
  return `iajuris:user:${String(email || "").toLowerCase()}`;
}

function keyUserId(id) {
  return `iajuris:userid:${id}`;
}

function keyVerifyToken(token) {
  return `iajuris:verify:${token}`;
}

function keyResetToken(token) {
  return `iajuris:reset:${token}`;
}

async function getUserByEmail(email) {
  const normalized = String(email || "").toLowerCase();
  if (!normalized) return null;

  if (hasKvConfig()) {
    const raw = await kvCommand(["GET", keyUser(normalized)]);
    return raw ? safeJsonParse(raw, null) : null;
  }

  if (hasBlobConfig()) {
    const fromBlob = await blobGetUserByEmail(normalized);
    if (fromBlob) return fromBlob;
  }

  const store = getGlobalMemoryStore();
  const inMemory = store.usersByEmail.get(normalized) || null;
  if (inMemory) return inMemory;

  const fallback = readFallbackUsers();
  return fallback.find((u) => String(u.email || "").toLowerCase() === normalized) || null;
}

async function getUserById(id) {
  const normalized = String(id || "").trim();
  if (!normalized) return null;

  if (hasKvConfig()) {
    const raw = await kvCommand(["GET", keyUserId(normalized)]);
    const email = raw ? String(raw) : "";
    if (!email) return null;
    return getUserByEmail(email);
  }

  if (hasBlobConfig()) {
    const fromBlob = await blobGetUserById(normalized);
    if (fromBlob) return fromBlob;
  }

  const store = getGlobalMemoryStore();
  const inMemory = store.usersById.get(normalized) || null;
  if (inMemory) return inMemory;

  const fallback = readFallbackUsers();
  return fallback.find((u) => String(u.id || "") === normalized) || null;
}

async function saveUser(user) {
  if (!user || !user.email || !user.id) {
    throw new Error("Usuario invalido");
  }

  const email = String(user.email).toLowerCase();

  if (hasKvConfig()) {
    await kvCommand(["SET", keyUser(email), JSON.stringify(user)]);
    await kvCommand(["SET", keyUserId(user.id), email]);
    return;
  }

  if (hasBlobConfig()) {
    try {
      await blobSaveUser(user);
      return;
    } catch (_blobErr) {
      // Si Blob falla (por ejemplo store suspendido), continuar con fallback local
    }
  }

  const store = getGlobalMemoryStore();
  store.usersByEmail.set(email, user);
  store.usersById.set(user.id, user);

  const fallbackUsers = readFallbackUsers();
  const nextUsers = fallbackUsers.filter((u) => String(u.email || "").toLowerCase() !== email);
  nextUsers.push(user);
  writeFallbackUsers(nextUsers);
}

async function createUser({ fullName, email, passwordHash, photoUrl }) {
  const normalized = String(email || "").toLowerCase();
  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    fullName,
    email: normalized,
    passwordHash,
    photoUrl: String(photoUrl || ""),
    avatarUrl: String(photoUrl || ""),
    emailVerified: false,
    createdAt: now,
    updatedAt: now
  };

  await saveUser(user);
  return user;
}

async function updateUser(user) {
  if (!user || !user.id || !user.email) {
    throw new Error("Usuario invalido");
  }

  const next = {
    ...user,
    updatedAt: new Date().toISOString()
  };

  await saveUser(next);
  return next;
}

async function createVerifyToken(email, ttlSeconds) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + (Math.max(60, Number(ttlSeconds) || 900) * 1000);
  const payload = { email: String(email || "").toLowerCase(), expiresAt };

  if (hasKvConfig()) {
    await kvCommand(["SET", keyVerifyToken(token), JSON.stringify(payload), "EX", Math.max(60, Number(ttlSeconds) || 900)]);
    return token;
  }

  const store = getGlobalMemoryStore();
  store.verifyTokens.set(token, payload);
  return token;
}

async function consumeVerifyToken(token) {
  const value = String(token || "").trim();
  if (!value) return null;

  if (hasKvConfig()) {
    const raw = await kvCommand(["GET", keyVerifyToken(value)]);
    if (!raw) return null;
    await kvCommand(["DEL", keyVerifyToken(value)]);
    const parsed = safeJsonParse(raw, null);
    if (!parsed || Number(parsed.expiresAt) < Date.now()) return null;
    return parsed;
  }

  const store = getGlobalMemoryStore();
  const parsed = store.verifyTokens.get(value) || null;
  store.verifyTokens.delete(value);
  if (!parsed || Number(parsed.expiresAt) < Date.now()) return null;
  return parsed;
}

async function createResetToken(email, ttlSeconds) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + (Math.max(60, Number(ttlSeconds) || 900) * 1000);
  const payload = { email: String(email || "").toLowerCase(), expiresAt };

  if (hasKvConfig()) {
    await kvCommand(["SET", keyResetToken(token), JSON.stringify(payload), "EX", Math.max(60, Number(ttlSeconds) || 900)]);
    return token;
  }

  const store = getGlobalMemoryStore();
  store.resetTokens.set(token, payload);
  return token;
}

async function consumeResetToken(token) {
  const value = String(token || "").trim();
  if (!value) return null;

  if (hasKvConfig()) {
    const raw = await kvCommand(["GET", keyResetToken(value)]);
    if (!raw) return null;
    await kvCommand(["DEL", keyResetToken(value)]);
    const parsed = safeJsonParse(raw, null);
    if (!parsed || Number(parsed.expiresAt) < Date.now()) return null;
    return parsed;
  }

  const store = getGlobalMemoryStore();
  const parsed = store.resetTokens.get(value) || null;
  store.resetTokens.delete(value);
  if (!parsed || Number(parsed.expiresAt) < Date.now()) return null;
  return parsed;
}

async function listUsers() {
  if (hasKvConfig()) {
    const keys = await kvCommand(["KEYS", "iajuris:user:*"]);
    if (!Array.isArray(keys) || !keys.length) {
      return [];
    }

    const command = ["MGET", ...keys];
    const rawUsers = await kvCommand(command);
    if (!Array.isArray(rawUsers)) {
      return [];
    }

    const users = [];
    for (const raw of rawUsers) {
      if (!raw) continue;
      const parsed = safeJsonParse(raw, null);
      if (parsed && parsed.email) users.push(parsed);
    }
    return users;
  }

  const mergedUsers = new Map();
  const addUsers = (items) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (!item || !item.email) continue;
      const email = String(item.email || "").toLowerCase();
      if (!email) continue;
      mergedUsers.set(email, item);
    }
  };

  if (hasBlobConfig()) {
    try {
      addUsers(await blobListUsers());
    } catch (_err) {
    }
  }

  const store = getGlobalMemoryStore();
  addUsers(Array.from(store.usersByEmail.values()));
  addUsers(readFallbackUsers());

  return Array.from(mergedUsers.values());
}

module.exports = {
  hasKvConfig,
  hasBlobConfig,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  listUsers,
  createVerifyToken,
  consumeVerifyToken,
  createResetToken,
  consumeResetToken
};
