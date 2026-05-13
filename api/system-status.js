const http = require("http");
const https = require("https");

const DEFAULT_TIMEOUT_MS = 12000;

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.end(body);
}

function normalizeHeaderName(rawValue, fallbackName) {
  const candidate = String(rawValue || "").trim();
  const tokenPattern = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
  if (!candidate || !tokenPattern.test(candidate)) {
    return fallbackName;
  }

  return candidate;
}

function requestUpstream(urlText, options = {}) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(urlText);
    const transport = targetUrl.protocol === "https:" ? https : http;
    const body = typeof options.body === "string" ? options.body : "";
    const headers = { ...(options.headers || {}) };

    if (body) {
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    const startedAt = Date.now();
    const req = transport.request(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method: options.method || "GET",
        headers
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode || 500,
            text,
            latencyMs: Date.now() - startedAt
          });
        });
      }
    );

    req.setTimeout(options.timeoutMs || DEFAULT_TIMEOUT_MS, () => {
      req.destroy(Object.assign(new Error("timeout"), { name: "AbortError" }));
    });

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

function buildHostBase(req) {
  const protoRaw = req.headers["x-forwarded-proto"] || "http";
  const hostRaw = req.headers["x-forwarded-host"] || req.headers.host || "127.0.0.1:3000";
  const proto = String(protoRaw).split(",")[0].trim();
  const host = String(hostRaw).split(",")[0].trim();
  return `${proto}://${host}`;
}

function parseJsonSafe(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch (_err) {
    return {};
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    json(res, 405, { error: "Metodo no permitido" });
    return;
  }

  const upstreamGenerateUrl = process.env.INTERNAL_AI_API_URL || "http://127.0.0.1:11436/api/generate";
  const authHeaderName = normalizeHeaderName(process.env.INTERNAL_AI_AUTH_HEADER, "Authorization");
  const authScheme = String(process.env.INTERNAL_AI_AUTH_SCHEME || "Bearer").trim();
  const apiKey = String(process.env.INTERNAL_AI_API_KEY || "").trim();
  const model = String(process.env.INTERNAL_AI_DEFAULT_MODEL || "corvinus-unico:latest").trim();

  const services = [];

  let proxyHealthUrl = "";
  try {
    const parsedGenerate = new URL(upstreamGenerateUrl);
    proxyHealthUrl = new URL("/health", `${parsedGenerate.protocol}//${parsedGenerate.host}`).toString();
  } catch (_err) {
    proxyHealthUrl = "http://127.0.0.1:11436/health";
  }

  try {
    const healthResult = await requestUpstream(proxyHealthUrl, {
      method: "GET",
      timeoutMs: 8000
    });
    const healthPayload = parseJsonSafe(healthResult.text);
    const connected = healthResult.status >= 200 && healthResult.status < 300 && healthPayload.ok === true;

    services.push({
      id: "proxy",
      name: "Proxy Cerebro GGUF",
      connected,
      detail: connected
        ? "Proxy y upstream en linea"
        : `HTTP ${healthResult.status}`,
      latencyMs: healthResult.latencyMs
    });
  } catch (error) {
    services.push({
      id: "proxy",
      name: "Proxy Cerebro GGUF",
      connected: false,
      detail: error && error.message ? error.message : "sin detalle",
      latencyMs: null
    });
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) {
      headers[authHeaderName] = authScheme ? `${authScheme} ${apiKey}` : apiKey;
    }

    const generateBody = JSON.stringify({
      model,
      prompt: "Responde solo MONITOR_OK",
      stream: false
    });

    const generateResult = await requestUpstream(upstreamGenerateUrl, {
      method: "POST",
      headers,
      body: generateBody,
      timeoutMs: 30000
    });

    const payload = parseJsonSafe(generateResult.text);
    const text = String(payload.response || payload.text || "").trim();
    const statusOk = generateResult.status >= 200 && generateResult.status < 300;
    const includesMonitorToken = text.toUpperCase().includes("MONITOR_OK");
    // Algunos modelos afinados ignoran la instruccion literal y aun asi responden correctamente.
    const connected = statusOk && (includesMonitorToken || text.length > 0);

    services.push({
      id: "apikey",
      name: "API Key principal",
      connected,
      detail: connected
        ? (includesMonitorToken ? "Token valido y modelo responde" : "Token valido y modelo responde (texto libre)")
        : `HTTP ${generateResult.status}`,
      latencyMs: generateResult.latencyMs
    });
  } catch (error) {
    services.push({
      id: "apikey",
      name: "API Key principal",
      connected: false,
      detail: error && error.message ? error.message : "sin detalle",
      latencyMs: null
    });
  }

  const hostBase = buildHostBase(req);
  const chatUrl = `${hostBase}/api/chat`;

  try {
    const chatResult = await requestUpstream(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Confirma conectividad con una frase corta" }),
      timeoutMs: 30000
    });

    const payload = parseJsonSafe(chatResult.text);
    const connected = chatResult.status >= 200 && chatResult.status < 300 && typeof payload.response === "string";

    services.push({
      id: "appchat",
      name: "Aplicacion IA Juris /api/chat",
      connected,
      detail: connected ? "Aplicacion enlazada al cerebro" : `HTTP ${chatResult.status}`,
      latencyMs: chatResult.latencyMs
    });
  } catch (error) {
    services.push({
      id: "appchat",
      name: "Aplicacion IA Juris /api/chat",
      connected: false,
      detail: error && error.message ? error.message : "sin detalle",
      latencyMs: null
    });
  }

  const globalConnected = services.every((item) => item.connected);

  json(res, 200, {
    generatedAt: new Date().toISOString(),
    globalConnected,
    services
  });
};
