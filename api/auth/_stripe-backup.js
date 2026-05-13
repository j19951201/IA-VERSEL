const STRIPE_API_BASE = "https://api.stripe.com/v1";

function getStripeSecretKey() {
  return String(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || "").trim();
}

function hasStripeBackupConfig() {
  return !!getStripeSecretKey();
}

async function stripeRequest(path, options = {}) {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY no configurada");
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": options.contentType || "application/x-www-form-urlencoded"
    },
    body: options.body
  });

  const payloadText = await response.text();
  const payload = safeJsonParse(payloadText, {});
  if (!response.ok) {
    const detail = payload && payload.error && payload.error.message
      ? payload.error.message
      : `Stripe HTTP ${response.status}`;
    throw new Error(detail);
  }

  return payload;
}

function safeJsonParse(text, fallback) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch (_err) {
    return fallback;
  }
}

function normalizeStripeUser(customer, includePrivate) {
  if (!customer || !customer.email) return null;
  const metadata = customer.metadata && typeof customer.metadata === "object" ? customer.metadata : {};
  const createdSeconds = Number(customer.created || 0);
  const createdAt = metadata.createdAt
    || (createdSeconds > 0 ? new Date(createdSeconds * 1000).toISOString() : "");

  const base = {
    id: String(metadata.userId || customer.id || ""),
    fullName: String(metadata.fullName || customer.name || ""),
    email: String(customer.email || "").trim().toLowerCase(),
    emailVerified: String(metadata.emailVerified || "").trim() === "true",
    createdAt: String(createdAt || "")
  };

  if (includePrivate && metadata.passwordHash) {
    base.passwordHash = String(metadata.passwordHash || "");
  }

  return base;
}

async function findStripeCustomerByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;

  const payload = await stripeRequest(`/customers?email=${encodeURIComponent(normalized)}&limit=100`);
  const rows = Array.isArray(payload.data) ? payload.data : [];
  return rows.find((item) => String(item.email || "").trim().toLowerCase() === normalized) || null;
}

async function upsertStripeCustomer({ fullName, email, userId, createdAt, emailVerified, passwordHash }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !hasStripeBackupConfig()) {
    return { ok: false, skipped: true };
  }

  const params = new URLSearchParams();
  if (fullName) params.set("name", String(fullName || "").trim());
  params.set("email", normalizedEmail);
  params.set("metadata[iajurisBackup]", "true");
  if (userId) params.set("metadata[userId]", String(userId || "").trim());
  if (fullName) params.set("metadata[fullName]", String(fullName || "").trim());
  if (createdAt) params.set("metadata[createdAt]", String(createdAt || "").trim());
  params.set("metadata[emailVerified]", emailVerified ? "true" : "false");
  if (passwordHash) params.set("metadata[passwordHash]", String(passwordHash || "").trim());

  const existing = await findStripeCustomerByEmail(normalizedEmail);
  if (existing && existing.id) {
    const updated = await stripeRequest(`/customers/${encodeURIComponent(existing.id)}`, {
      method: "POST",
      body: params.toString()
    });
    return { ok: true, customer: normalizeStripeUser(updated) };
  }

  const created = await stripeRequest("/customers", {
    method: "POST",
    body: params.toString()
  });
  return { ok: true, customer: normalizeStripeUser(created) };
}

async function listStripeBackupUsers() {
  if (!hasStripeBackupConfig()) return [];

  const users = [];
  let startingAfter = "";

  do {
    const query = new URLSearchParams();
    query.set("limit", "100");
    if (startingAfter) query.set("starting_after", startingAfter);

    const payload = await stripeRequest(`/customers?${query.toString()}`);
    const rows = Array.isArray(payload.data) ? payload.data : [];
    for (const row of rows) {
      const user = normalizeStripeUser(row);
      if (user) users.push(user);
    }

    startingAfter = payload.has_more && rows.length ? String(rows[rows.length - 1].id || "") : "";
  } while (startingAfter);

  return users;
}

async function getFullUserByEmail(email) {
  if (!hasStripeBackupConfig()) return null;
  try {
    const customer = await findStripeCustomerByEmail(email);
    if (!customer) return null;
    return normalizeStripeUser(customer, true);
  } catch (_err) {
    return null;
  }
}

module.exports = {
  hasStripeBackupConfig,
  upsertStripeCustomer,
  listStripeBackupUsers,
  getFullUserByEmail
};