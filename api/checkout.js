const { json, readJsonBody, getSessionFromRequest, buildHostBase } = require("./auth/_auth");
const { getUserById } = require("./auth/_auth-store");

const STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions";

const PLAN_CONFIG = {
  monthly: {
    label: "Mensual",
    mode: "subscription",
    amount: 700,
    recurring: { interval: "month", interval_count: 1 },
    successPath: "/?checkout=success&plan=monthly",
    cancelPath: "/?checkout=cancel&plan=monthly"
  },
  semiannual: {
    label: "6 Meses",
    mode: "payment",
    amount: 1000,
    successPath: "/?checkout=success&plan=semiannual",
    cancelPath: "/?checkout=cancel&plan=semiannual"
  },
  annual: {
    label: "Anual",
    mode: "subscription",
    amount: 1500,
    recurring: { interval: "year", interval_count: 1 },
    successPath: "/?checkout=success&plan=annual",
    cancelPath: "/?checkout=cancel&plan=annual"
  }
};

function getStripeKey() {
  return String(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || "").trim();
}

function getUserEmailFromSession(req) {
  const session = getSessionFromRequest(req);
  if (!session || !session.sub) {
    return { session: null, email: "", fullName: "", userId: "" };
  }

  return {
    session,
    userId: String(session.sub || "").trim(),
    email: String(session.email || "").trim(),
    fullName: String(session.fullName || "").trim()
  };
}

function getCustomerFromBody(body) {
  const customer = body && typeof body.customer === "object" ? body.customer : {};
  return {
    userId: String(customer.id || customer.userId || "").trim(),
    email: String(customer.email || "").trim(),
    fullName: String(customer.fullName || customer.name || "").trim()
  };
}

async function resolveCustomerData(req, body) {
  const sessionInfo = getUserEmailFromSession(req);
  const bodyCustomer = getCustomerFromBody(body);

  if (!sessionInfo.session && !bodyCustomer.userId && !bodyCustomer.email) {
    return {
      session: null,
      userId: "",
      email: "",
      fullName: ""
    };
  }

  const sessionOrBodyUserId = String(sessionInfo.userId || bodyCustomer.userId || "").trim();

  try {
    const user = sessionOrBodyUserId ? await getUserById(sessionOrBodyUserId) : null;
    if (user) {
      return {
        session: sessionInfo.session,
        email: String(user.email || sessionInfo.email || bodyCustomer.email || "").trim(),
        fullName: String(user.fullName || sessionInfo.fullName || bodyCustomer.fullName || "").trim(),
        userId: String(user.id || sessionOrBodyUserId || "").trim()
      };
    }
  } catch (_err) {
  }

  return {
    session: sessionInfo.session,
    email: String(sessionInfo.email || bodyCustomer.email || "").trim(),
    fullName: String(sessionInfo.fullName || bodyCustomer.fullName || "").trim(),
    userId: sessionOrBodyUserId
  };
}

function buildStripeForm(planKey, customerData, origin) {
  const plan = PLAN_CONFIG[planKey];
  const params = new URLSearchParams();

  params.set("mode", plan.mode);
  params.set("success_url", `${origin}${plan.successPath}`);
  params.set("cancel_url", `${origin}${plan.cancelPath}`);
  params.set("allow_promotion_codes", "true");
  params.set("payment_method_types[]", "card");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(plan.amount));
  params.set("line_items[0][price_data][product_data][name]", `IA Juris - Plan ${plan.label}`);
  params.set("line_items[0][price_data][product_data][description]", `Acceso al plan ${plan.label} de IA Juris`);

  if (plan.recurring) {
    params.set("line_items[0][price_data][recurring][interval]", plan.recurring.interval);
    params.set("line_items[0][price_data][recurring][interval_count]", String(plan.recurring.interval_count || 1));
  }

  if (customerData.email) {
    params.set("customer_email", customerData.email);
  }

  if (customerData.userId) {
    params.set("client_reference_id", customerData.userId);
    params.set("metadata[userId]", customerData.userId);
  }

  if (customerData.fullName) {
    params.set("metadata[fullName]", customerData.fullName);
  }

  params.set("metadata[planId]", planKey);
  params.set("metadata[planLabel]", plan.label);
  params.set("metadata[billingMode]", plan.mode);

  return params;
}

async function createCheckoutSession(secretKey, planKey, customerData, origin) {
  const plan = PLAN_CONFIG[planKey];
  const response = await fetch(STRIPE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: buildStripeForm(planKey, customerData, origin).toString()
  });

  const payloadText = await response.text();
  let payload = {};
  try {
    payload = payloadText ? JSON.parse(payloadText) : {};
  } catch (_err) {
    payload = { raw: payloadText };
  }

  if (!response.ok) {
    const message = payload && payload.error && payload.error.message
      ? payload.error.message
      : `Stripe HTTP ${response.status}`;
    throw new Error(message);
  }

  if (!payload.url) {
    throw new Error("Stripe no devolvió url de checkout");
  }

  return payload;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Metodo no permitido" });
    return;
  }

  const secretKey = getStripeKey();
  if (!secretKey) {
    json(res, 503, { error: "STRIPE_SECRET_KEY no configurada" });
    return;
  }

  const sessionInfo = getUserEmailFromSession(req);
  const body = readJsonBody(req);
  const bodyCustomer = getCustomerFromBody(body);

  if (!sessionInfo.session && !bodyCustomer.userId && !bodyCustomer.email) {
    json(res, 401, { error: "Debes iniciar sesion para suscribirte" });
    return;
  }

  const planKey = String(body.planId || body.plan || "").trim().toLowerCase();
  const plan = PLAN_CONFIG[planKey];
  if (!plan) {
    json(res, 400, { error: "Plan invalido" });
    return;
  }

  try {
    const origin = buildHostBase(req);
    const customerData = await resolveCustomerData(req, body);
    if (!customerData.userId && !customerData.email) {
      json(res, 401, { error: "Debes iniciar sesion para suscribirte" });
      return;
    }
    const session = await createCheckoutSession(secretKey, planKey, customerData, origin);

    json(res, 200, {
      ok: true,
      url: session.url,
      sessionId: session.id,
      planId: planKey,
      planLabel: plan.label,
      mode: plan.mode
    });
  } catch (error) {
    json(res, 500, {
      error: "No se pudo crear la sesion de pago",
      detail: error && error.message ? error.message : "sin detalle"
    });
  }
};