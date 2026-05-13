const http = require("http");
const https = require("https");
const { URL } = require("url");

const listenHost = process.env.SECURE_PROXY_HOST || "0.0.0.0";
const listenPort = Number(process.env.SECURE_PROXY_PORT || 11435);
const upstreamBaseUrl = process.env.OLLAMA_UPSTREAM || "http://127.0.0.1:11434";
const sharedToken = process.env.SECURE_PROXY_TOKEN || "";
const previousToken = process.env.SECURE_PROXY_PREVIOUS_TOKEN || "";
const exposeTags = String(process.env.SECURE_PROXY_EXPOSE_TAGS || "false").trim().toLowerCase() === "true";
const allowedPaths = new Set(exposeTags ? ["/api/generate", "/api/tags", "/health"] : ["/api/generate", "/health"]);
const healthcheckUpstream = String(process.env.SECURE_PROXY_HEALTHCHECK_UPSTREAM || "true").trim().toLowerCase() === "true";
const rateLimitEnabled = String(process.env.SECURE_PROXY_RATE_LIMIT_ENABLED || "true").trim().toLowerCase() === "true";
const rateLimitWindowMs = Number(process.env.SECURE_PROXY_RATE_LIMIT_WINDOW_MS || 60000);
const rateLimitMaxRequests = Number(process.env.SECURE_PROXY_RATE_LIMIT_MAX_REQUESTS || 60);
const rateLimitStore = new Map();
const allowedIpRules = String(
  process.env.SECURE_PROXY_ALLOWED_IPS || "127.0.0.1,::1,192.168.0.0/16,10.0.0.0/8,172.16.0.0/12"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (!sharedToken) {
  console.error("Falta SECURE_PROXY_TOKEN. Define un token antes de iniciar el proxy.");
  process.exit(1);
}

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function requestUpstream(urlText, options = {}) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(urlText);
    const transport = targetUrl.protocol === "https:" ? https : http;
    const method = options.method || "GET";
    const body = typeof options.body === "string" ? options.body : "";
    const headers = { ...(options.headers || {}) };

    if (body) {
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = transport.request(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method,
        headers
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode || 500,
            headers: res.headers,
            text
          });
        });
      }
    );

    req.setTimeout(options.timeoutMs || 60000, () => {
      req.destroy(new Error("Request timeout"));
    });

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

function normalizeIp(rawIp) {
  const ip = String(rawIp || "").trim();
  if (!ip) {
    return "";
  }

  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }

  return ip;
}

function ipv4ToInt(ip) {
  const parts = ip.split(".").map((value) => Number(value));
  if (parts.length !== 4 || parts.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
    return null;
  }

  return (((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0)) >>> 0;
}

function ipMatchesRule(ip, rule) {
  if (!rule) {
    return false;
  }

  if (!rule.includes("/")) {
    return ip === normalizeIp(rule);
  }

  const [network, prefixText] = rule.split("/");
  const prefix = Number(prefixText);
  const ipInt = ipv4ToInt(ip);
  const networkInt = ipv4ToInt(normalizeIp(network));

  if (ipInt == null || networkInt == null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return false;
  }

  const mask = prefix === 0 ? 0 : ((0xffffffff << (32 - prefix)) >>> 0);
  return (ipInt & mask) === (networkInt & mask);
}

function getClientIp(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0];
  return normalizeIp(forwardedFor || req.socket.remoteAddress || "");
}

function isIpAllowed(req) {
  const clientIp = getClientIp(req);
  if (!clientIp) {
    return false;
  }

  return allowedIpRules.some((rule) => ipMatchesRule(clientIp, rule));
}

function isAuthorized(req) {
  const authHeader = String(req.headers.authorization || "");
  const headerToken = String(req.headers["x-internal-token"] || "");
  const validBearerValues = [`Bearer ${sharedToken}`];

  if (previousToken) {
    validBearerValues.push(`Bearer ${previousToken}`);
  }

  if (validBearerValues.includes(authHeader)) {
    return true;
  }

  if (headerToken === sharedToken || (previousToken && headerToken === previousToken)) {
    return true;
  }

  return false;
}

function getRateLimitEntry(ip) {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || now > current.resetAt) {
    const nextEntry = {
      count: 0,
      resetAt: now + rateLimitWindowMs
    };
    rateLimitStore.set(ip, nextEntry);
    return nextEntry;
  }

  return current;
}

function getRetryAfterSeconds(resetAt) {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

function applyRateLimit(req, res) {
  if (!rateLimitEnabled) {
    return true;
  }

  const path = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  if (path === "/health") {
    return true;
  }

  const clientIp = getClientIp(req);
  if (!clientIp) {
    json(res, 400, { error: "No se pudo determinar IP cliente" });
    return false;
  }

  const entry = getRateLimitEntry(clientIp);
  entry.count += 1;

  if (entry.count > rateLimitMaxRequests) {
    const retryAfter = getRetryAfterSeconds(entry.resetAt);
    res.setHeader("Retry-After", String(retryAfter));
    json(res, 429, {
      error: "Rate limit excedido",
      detail: `Maximo ${rateLimitMaxRequests} solicitudes por ${Math.round(rateLimitWindowMs / 1000)}s`,
      retryAfterSeconds: retryAfter
    });
    return false;
  }

  return true;
}

async function getUpstreamHealth() {
  const upstreamUrl = new URL("/api/tags", upstreamBaseUrl).toString();

  try {
    const upstreamResponse = await requestUpstream(upstreamUrl, {
      method: "GET",
      timeoutMs: 5000
    });

    if (upstreamResponse.status < 200 || upstreamResponse.status >= 300) {
      return {
        ok: false,
        status: upstreamResponse.status
      };
    }

    return {
      ok: true,
      status: upstreamResponse.status
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      detail: error && error.message ? error.message : "sin detalle"
    };
  }
}

async function forwardRequest(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (!["GET", "POST"].includes(req.method)) {
    json(res, 405, { error: "Metodo no permitido" });
    return;
  }

  if (!isIpAllowed(req)) {
    json(res, 403, { error: "IP no permitida" });
    return;
  }

  if (!applyRateLimit(req, res)) {
    return;
  }

  if (!allowedPaths.has(requestUrl.pathname)) {
    json(res, 404, { error: "Ruta no permitida" });
    return;
  }

  if (requestUrl.pathname === "/health") {
    if (!healthcheckUpstream) {
      json(res, 200, { ok: true, upstream: "skip" });
      return;
    }

    const upstreamHealth = await getUpstreamHealth();
    json(res, upstreamHealth.ok ? 200 : 503, {
      ok: upstreamHealth.ok,
      upstream: upstreamHealth
    });
    return;
  }

  if (!isAuthorized(req)) {
    json(res, 401, { error: "No autorizado" });
    return;
  }

  const bodyText = req.method === "POST" ? await readBody(req) : undefined;
  const upstreamUrl = new URL(requestUrl.pathname, upstreamBaseUrl).toString();
  const upstreamHeaders = {
    "Content-Type": req.headers["content-type"] || "application/json"
  };

  try {
    const upstreamResponse = await requestUpstream(upstreamUrl, {
      method: req.method,
      headers: upstreamHeaders,
      body: bodyText,
      timeoutMs: 60000
    });

    res.writeHead(upstreamResponse.status, {
      "Content-Type": upstreamResponse.headers["content-type"] || "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(upstreamResponse.text);
  } catch (error) {
    json(res, 502, {
      error: "No se pudo contactar a Ollama",
      detail: error && error.message ? error.message : "sin detalle"
    });
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Internal-Token",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    res.end();
    return;
  }

  forwardRequest(req, res);
});

server.listen(listenPort, listenHost, () => {
  console.log(`Secure Ollama proxy escuchando en http://${listenHost}:${listenPort}`);
  console.log(`Rutas expuestas: ${Array.from(allowedPaths).join(", ")}`);
  console.log(`Reglas IP: ${allowedIpRules.join(", ")}`);
  console.log(`Rate limit: ${rateLimitEnabled ? `${rateLimitMaxRequests}/${Math.round(rateLimitWindowMs / 1000)}s` : "desactivado"}`);
});