const crypto = require("crypto");
const { json } = require("./auth/_auth");
const { getUserByEmail, getUserById, updateUser } = require("./auth/_auth-store");

const PLAN_LABELS = {
  monthly: "Mensual",
  semiannual: "6 Meses",
  annual: "Anual"
};

function getWebhookSecret() {
  return String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
}

function getHeader(req, name) {
  const target = String(name || "").toLowerCase();
  const headers = req && req.headers ? req.headers : {};
  for (const key of Object.keys(headers)) {
    if (String(key || "").toLowerCase() === target) {
      return String(headers[key] || "");
    }
  }
  return "";
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    if (typeof req.body === "string") {
      resolve(req.body);
      return;
    }

    if (Buffer.isBuffer(req.body)) {
      resolve(req.body.toString("utf8"));
      return;
    }

    if (req.body && typeof req.body === "object") {
      resolve(JSON.stringify(req.body));
      return;
    }

    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseStripeSignature(header) {
  const parts = String(header || "").split(",");
  const out = { t: null, v1: [] };

  for (const part of parts) {
    const [key, value] = String(part || "").split("=");
    if (!key || !value) continue;
    if (key === "t") out.t = value;
    if (key === "v1") out.v1.push(value);
  }

  return out;
}

function verifyStripeSignature(rawBody, header, secret) {
  if (!secret) {
    return false;
  }

  const parsed = parseStripeSignature(header);
  if (!parsed.t || !parsed.v1.length) {
    return false;
  }

  const signedPayload = `${parsed.t}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  return parsed.v1.some((signature) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
    } catch (_err) {
      return false;
    }
  });
}

function normalizePlanLabel(planId, planLabel) {
  if (planLabel) return String(planLabel).trim();
  return PLAN_LABELS[String(planId || "").toLowerCase()] || String(planId || "").trim() || "Plan activo";
}

async function findUserFromEvent(event) {
  const session = event && event.data && event.data.object ? event.data.object : {};
  const customerEmail = String(session.customer_email || session.customer_details && session.customer_details.email || session.metadata && session.metadata.customerEmail || "").trim().toLowerCase();
  const userId = String(session.client_reference_id || session.metadata && session.metadata.userId || "").trim();

  if (userId) {
    const byId = await getUserById(userId);
    if (byId) return byId;
  }

  if (customerEmail) {
    const byEmail = await getUserByEmail(customerEmail);
    if (byEmail) return byEmail;
  }

  return null;
}

async function applyCheckoutCompleted(event) {
  const session = event.data.object || {};
  const user = await findUserFromEvent(event);
  if (!user) {
    return { ok: false, reason: "user_not_found" };
  }

  const planId = String(session.metadata && session.metadata.planId || "").trim().toLowerCase();
  const planLabel = normalizePlanLabel(planId, session.metadata && session.metadata.planLabel);
  const mode = String(session.mode || session.metadata && session.metadata.billingMode || "").trim();
  const status = String(session.payment_status || session.status || "active").trim();
  const now = new Date().toISOString();

  const next = {
    ...user,
    paidPlanName: planLabel,
    currentPlanName: planLabel,
    planName: planLabel,
    plan: planLabel,
    subscriptionPlan: planLabel,
    billing: {
      ...(user.billing && typeof user.billing === "object" ? user.billing : {}),
      provider: "stripe",
      planId,
      planName: planLabel,
      mode,
      status,
      active: true,
      customerEmail: String(session.customer_email || session.customer_details && session.customer_details.email || user.email || "").trim(),
      customerId: String(session.customer || "").trim(),
      subscriptionId: String(session.subscription || "").trim(),
      checkoutSessionId: String(session.id || "").trim(),
      updatedAt: now,
      activatedAt: now
    }
  };

  await updateUser(next);
  return { ok: true, userId: user.id, planLabel };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Metodo no permitido" });
    return;
  }

  const secret = getWebhookSecret();
  if (!secret) {
    json(res, 503, { error: "STRIPE_WEBHOOK_SECRET no configurada" });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = getHeader(req, "stripe-signature");
    if (!verifyStripeSignature(rawBody, signature, secret)) {
      json(res, 400, { error: "Firma de Stripe invalida" });
      return;
    }

    const event = JSON.parse(rawBody || "{}");
    const eventType = String(event.type || "").trim();

    if (eventType === "checkout.session.completed") {
      const result = await applyCheckoutCompleted(event);
      if (!result.ok) {
        json(res, 200, { received: true, ignored: true, reason: result.reason });
        return;
      }
    }

    json(res, 200, { received: true });
  } catch (error) {
    json(res, 500, {
      error: "No se pudo procesar el webhook de Stripe",
      detail: error && error.message ? error.message : "sin detalle"
    });
  }
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};