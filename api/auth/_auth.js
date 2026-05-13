const crypto = require("crypto");

const SESSION_COOKIE_NAME = "iajuris_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const USER_RECORD_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 365;

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload || {});
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.end(body);
}

function readJsonBody(req) {
  if (!req || req.body == null) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_err) {
      return {};
    }
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  return {};
}

function parseCookies(req) {
  const header = String((req && req.headers && req.headers.cookie) || "");
  const out = {};
  header.split(";").forEach((chunk) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  });
  return out;
}

function base64UrlEncode(input) {
  const raw = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return raw
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input) {
  const text = String(input || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = text + "=".repeat((4 - (text.length % 4 || 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function getSessionSecret() {
  return String(process.env.AUTH_SESSION_SECRET || process.env.INTERNAL_AI_API_KEY || "iajuris-dev-secret").trim();
}

function signSessionToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_TTL_SECONDS
  };

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(unsigned)
    .digest();

  return `${unsigned}.${base64UrlEncode(signature)}`;
}

function verifySessionToken(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSig] = parts;
    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = crypto
      .createHmac("sha256", getSessionSecret())
      .update(unsigned)
      .digest();

    const providedSig = Buffer.from(base64UrlDecodeToBytes(encodedSig));
    if (providedSig.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(providedSig, expectedSig)) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload || typeof payload !== "object") return null;
    if (!payload.exp || Number(payload.exp) < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch (_err) {
    return null;
  }
}

function base64UrlDecodeToBytes(input) {
  const text = String(input || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = text + "=".repeat((4 - (text.length % 4 || 4)) % 4);
  return Buffer.from(padded, "base64");
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

function setSessionCookie(res, sessionPayload) {
  const token = signSessionToken(sessionPayload);
  const secure = process.env.NODE_ENV === "production";
  const cookie = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    secure ? "Secure" : ""
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  const cookie = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    secure ? "Secure" : ""
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", cookie);
}

/**
 * Genera un token de larga duración con los datos completos del usuario.
 * Permite autenticar sin necesidad de almacenamiento persistente en el servidor.
 */
function signUserRecordToken(userData) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...userData,
    _type: "user_record",
    iat: now,
    exp: now + USER_RECORD_TOKEN_TTL_SECONDS
  };
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(unsigned)
    .digest();
  return `${unsigned}.${base64UrlEncode(signature)}`;
}

/**
 * Verifica y decodifica un userRecordToken. Retorna null si es inválido o expirado.
 */
function verifyUserRecordToken(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSig] = parts;
    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = crypto
      .createHmac("sha256", getSessionSecret())
      .update(unsigned)
      .digest();

    const providedSig = Buffer.from(base64UrlDecodeToBytes(encodedSig));
    if (providedSig.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(providedSig, expectedSig)) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload || typeof payload !== "object") return null;
    if (payload._type !== "user_record") return null;
    if (!payload.exp || Number(payload.exp) < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch (_err) {
    return null;
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function randomToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password || ""), salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2$sha256$120000$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
  const parts = String(storedHash || "").split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2") return false;

  const algo = parts[1];
  const iterations = Number(parts[2]);
  const salt = parts[3];
  const digest = parts[4];
  if (algo !== "sha256" || !Number.isFinite(iterations) || iterations <= 0) return false;

  const computed = crypto.pbkdf2Sync(String(password || ""), salt, iterations, 32, "sha256").toString("hex");
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(String(digest), "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function createPublicUser(user) {
  if (!user) return null;
  const resolvedPhoto = String(
    user.photoUrl
    || user.avatarUrl
    || user.profilePhoto
    || user.profileImage
    || user.picture
    || user.image
    || user.photo
    || ""
  );

  const resolvedPlanName = String(
    user.paidPlanName
    || user.currentPlanName
    || user.planName
    || user.subscriptionPlan
    || user.membershipPlan
    || user.plan
    || (user.subscription && (user.subscription.planName || user.subscription.name))
    || (user.billing && (user.billing.planName || user.billing.name))
    || ""
  ).trim();

  return {
    id: user.id,
    fullName: user.fullName,
    name: user.fullName,
    email: user.email,
    photoUrl: resolvedPhoto,
    avatarUrl: resolvedPhoto,
    profilePhoto: resolvedPhoto,
    profileImage: resolvedPhoto,
    picture: resolvedPhoto,
    image: resolvedPhoto,
    role: "Usuario registrado",
    roleLabel: "Miembro",
    userType: "member",
    paidPlanName: resolvedPlanName,
    currentPlanName: resolvedPlanName,
    planName: resolvedPlanName,
    plan: resolvedPlanName,
    isGuest: false,
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt
  };
}

function buildHostBase(req) {
  const protoRaw = req.headers["x-forwarded-proto"] || "http";
  const hostRaw = req.headers["x-forwarded-host"] || req.headers.host || "127.0.0.1:3000";
  const proto = String(protoRaw).split(",")[0].trim();
  const host = String(hostRaw).split(",")[0].trim();
  return `${proto}://${host}`;
}

module.exports = {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  json,
  readJsonBody,
  parseCookies,
  signSessionToken,
  verifySessionToken,
  getSessionFromRequest,
  setSessionCookie,
  clearSessionCookie,
  signUserRecordToken,
  verifyUserRecordToken,
  normalizeEmail,
  normalizeName,
  randomToken,
  hashPassword,
  verifyPassword,
  createPublicUser,
  buildHostBase
};
