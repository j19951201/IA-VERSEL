const http = require("http");
const https = require("https");
const DEFAULT_TIMEOUT_MS = 60000;
const MIN_PUBLIC_RESPONSE_CHARS = 0;
const MAX_EXPANSION_ATTEMPTS = 1;
const MAX_PUBLIC_RESPONSE_CHARS = 4800;
const FAST_RESPONSE_OPTIONS = {
  temperature: 0.1,
  num_predict: 56,
  num_ctx: 192,
  repeat_penalty: 1.05,
  top_p: 0.9
};
const DETAILED_RESPONSE_OPTIONS = {
  temperature: 0.15,
  num_predict: 96,
  num_ctx: 384,
  repeat_penalty: 1.05,
  top_p: 0.9
};
const DETAIL_REQUEST_PATTERN = /biografia|biografía|explica|explicame|explícame|detalla|detalle|detallada|desarrolla|amplia|amplio|etapas|analiza|analisis|análisis|fundamento|fundamentos|historia|trayectoria|perfil|resumen completo|quien es|quién es/i;
const BIOGRAPHY_REQUEST_PATTERN = /biografia|biografía|trayectoria|perfil|quien es|quién es/i;
const CALCULATION_REQUEST_PATTERN = /calculo|cálculo|calcular|operacion|operación|matematica|matemática|formula|fórmula|porcentaje|interes|interés|ecuacion|ecuación|regla de tres/i;
const SMALL_TALK_PATTERN = /^(hola|holi|hello|buenas|buenos dias|buenos días|buenas tardes|buenas noches|que tal|qué tal|como estas|cómo estás|saludos|ok|gracias|thanks|hey|hi)\b/i;
const REFUSAL_OR_ENGLISH_PATTERN = /i am sorry|i understand you're interested|cannot provide|cannot help|breach of privacy|data protection|search reputable|websites like|privacy|no puedo proporcionar|no puedo dar|no puedo ofrecer|no puedo compartir|privacidad|proteccion de datos|protección de datos/i;

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

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  );
}

function parseJsonEnv(name) {
  const raw = process.env[name];
  if (!raw) {
    return {};
  }

  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" ? value : {};
  } catch (_err) {
    return {};
  }
}

function normalizeHeaderName(rawValue, fallbackName) {
  const candidate = String(rawValue || "").trim();
  const tokenPattern = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
  if (!candidate || !tokenPattern.test(candidate)) {
    return fallbackName;
  }

  return candidate;
}

function sanitizeOutboundHeaders(headers) {
  const forbidden = new Set([
    "expect",
    "connection",
    "content-length",
    "host",
    "transfer-encoding"
  ]);

  Object.keys(headers || {}).forEach((key) => {
    if (forbidden.has(String(key || "").toLowerCase())) {
      delete headers[key];
    }
  });

  return headers;
}

function requestJsonUpstream(urlText, options) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(urlText);
    const transport = targetUrl.protocol === "https:" ? https : http;
    const body = typeof options.body === "string" ? options.body : "";
    const headers = sanitizeOutboundHeaders({ ...(options.headers || {}) });
    headers["Content-Length"] = Buffer.byteLength(body);

    const request = transport.request(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method: options.method || "POST",
        headers
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const rawText = Buffer.concat(chunks).toString("utf8");
          let parsedPayload = null;

          try {
            parsedPayload = rawText ? JSON.parse(rawText) : {};
          } catch (_err) {
            parsedPayload = { text: rawText };
          }

          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode || 500,
            payload: parsedPayload,
            rawText
          });
        });
      }
    );

    request.setTimeout(options.timeoutMs || DEFAULT_TIMEOUT_MS, () => {
      request.destroy(Object.assign(new Error("Request timeout"), { name: "AbortError" }));
    });

    request.on("error", reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

function parsePositiveNumberOrNull(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function getProviderMode() {
  return String(process.env.INTERNAL_AI_PROVIDER || "generic").trim().toLowerCase();
}

function getTextOrEmpty(value) {
  return typeof value === "string" ? value.trim() : "";
}

function extractUserQuestion(requestBody) {
  const fromQuestion = getTextOrEmpty(requestBody && requestBody.question);
  if (fromQuestion) {
    return fromQuestion;
  }

  const fromInput = getTextOrEmpty(requestBody && requestBody.input);
  if (fromInput) {
    return fromInput;
  }

  const fromPrompt = getTextOrEmpty(requestBody && requestBody.prompt);
  if (fromPrompt) {
    return fromPrompt;
  }

  if (Array.isArray(requestBody && requestBody.messages)) {
    const lastUserMessage = [...requestBody.messages]
      .reverse()
      .find((entry) => entry && entry.role === "user" && getTextOrEmpty(entry.content));

    if (lastUserMessage) {
      return getTextOrEmpty(lastUserMessage.content);
    }
  }

  return "";
}

function isDetailedQuery(question) {
  return DETAIL_REQUEST_PATTERN.test(getTextOrEmpty(question));
}

function isBiographyQuery(question) {
  return BIOGRAPHY_REQUEST_PATTERN.test(getTextOrEmpty(question));
}

function isCalculationQuery(question) {
  return CALCULATION_REQUEST_PATTERN.test(getTextOrEmpty(question));
}

function isSmallTalkQuery(question) {
  const clean = getTextOrEmpty(question).toLowerCase();
  if (!clean) {
    return false;
  }

  if (SMALL_TALK_PATTERN.test(clean)) {
    return true;
  }

  // Mensajes muy cortos de saludo/confirmacion no deben activan relleno largo.
  return clean.length <= 18 && /^(hola|ok|gracias|hey|hi|hello|saludos)/i.test(clean);
}

function getAdaptiveResponseProfile(question) {
  if (isSmallTalkQuery(question)) {
    return {
      minimumChars: 0,
      maximumChars: 220,
      expansionAttempts: 0
    };
  }

  if (isBiographyQuery(question)) {
    return {
      minimumChars: 0,
      maximumChars: 4800,
      expansionAttempts: 0
    };
  }

  if (isCalculationQuery(question)) {
    return {
      minimumChars: 0,
      maximumChars: 3200,
      expansionAttempts: 0
    };
  }

  if (isDetailedQuery(question)) {
    return {
      minimumChars: 0,
      maximumChars: 3400,
      expansionAttempts: 0
    };
  }

  return {
    minimumChars: 0,
    maximumChars: 1800,
    expansionAttempts: 0
  };
}

function shouldRepairAnswer(question, answerText) {
  return isBiographyQuery(question) && REFUSAL_OR_ENGLISH_PATTERN.test(getTextOrEmpty(answerText));
}

function buildFastOptions(requestOptions, question) {
  const source = requestOptions && typeof requestOptions === "object" ? requestOptions : {};
  const providerMode = String(process.env.INTERNAL_AI_PROVIDER || "generic").trim().toLowerCase();
  const isCloudProvider = providerMode === "groq" || providerMode === "openai";
  const defaults = isDetailedQuery(question) ? DETAILED_RESPONSE_OPTIONS : FAST_RESPONSE_OPTIONS;
  // Para proveedores cloud (Groq/OpenAI) usamos tokens más generosos que para Ollama local
  const maxPredict = isCloudProvider
    ? (isDetailedQuery(question) ? 1800 : 900)
    : (isDetailedQuery(question) ? 128 : 72);
  const maxContext = isCloudProvider
    ? (isDetailedQuery(question) ? 8192 : 4096)
    : (isDetailedQuery(question) ? 512 : 320);

  return {
    ...defaults,
    ...source,
    num_predict: Math.min(
      Number.isFinite(Number(source.num_predict)) && Number(source.num_predict) > 0
        ? Number(source.num_predict)
        : (isCloudProvider ? maxPredict : defaults.num_predict),
      maxPredict
    ),
    num_ctx: Math.min(
      Number.isFinite(Number(source.num_ctx)) && Number(source.num_ctx) > 0
        ? Number(source.num_ctx)
        : (isCloudProvider ? maxContext : defaults.num_ctx),
      maxContext
    )
  };
}

function getSystemPrompt() {
  return String(process.env.INTERNAL_AI_SYSTEM_PROMPT || "").trim();
}

function buildOpenAiMessages(requestBody) {
  const systemPrompt = getSystemPrompt();
  const systemEntry = systemPrompt ? [{ role: "system", content: systemPrompt }] : [];

  if (Array.isArray(requestBody.messages) && requestBody.messages.length > 0) {
    // Si el array ya trae un system message propio, no duplicar
    const hasSystem = requestBody.messages.some((m) => m && m.role === "system");
    return hasSystem ? requestBody.messages : [...systemEntry, ...requestBody.messages];
  }

  const prompt = [requestBody.prompt, requestBody.input, requestBody.question]
    .find((value) => typeof value === "string" && value.trim()) || "";

  return prompt ? [...systemEntry, { role: "user", content: prompt }] : [];
}

function buildBiographyPrompt(question, originalPrompt) {
  const userQuestion = getTextOrEmpty(question) || getTextOrEmpty(originalPrompt);
  const promptTail = getTextOrEmpty(originalPrompt);

  return [
    "Responde solo en espanol.",
    "Si te piden la biografia, perfil o trayectoria de una figura publica, entrega informacion publica general y util.",
    "No rechaces por privacidad cuando se trate de informacion publica y no menciones limitaciones del modelo.",
    userQuestion ? `Consulta: ${userQuestion}` : "",
    promptTail ? `Desarrolla una respuesta util a partir de esta instruccion original:\n${promptTail}` : ""
  ].filter(Boolean).join("\n\n");
}

function buildUpstreamPayload(requestBody) {
  const providerMode = getProviderMode();
  const question = extractUserQuestion(requestBody);
  const requestOptions = buildFastOptions(requestBody && requestBody.options, question);
  const biographyQuery = isBiographyQuery(question);

  if (providerMode === "groq" || providerMode === "openai") {
    const messages = buildOpenAiMessages(requestBody);
    const normalizedMessages = biographyQuery
      ? [
          ...messages,
          {
            role: "user",
            content: buildBiographyPrompt(question, requestBody.prompt)
          }
        ]
      : messages;

    return compactObject({
      model: requestBody.model || process.env.INTERNAL_AI_DEFAULT_MODEL,
      messages: normalizedMessages,
      temperature: requestOptions.temperature,
      max_tokens: requestOptions.num_predict,
      stream: false
    });
  }

  const normalizedPrompt = biographyQuery
    ? buildBiographyPrompt(question, requestBody.prompt)
    : (requestBody.prompt || question);

  return compactObject({
    model: requestBody.model || process.env.INTERNAL_AI_DEFAULT_MODEL,
    prompt: normalizedPrompt,
    stream: false,
    keep_alive: "20m",
    options: requestOptions,
    messages: requestBody.messages,
    input: requestBody.input || requestBody.question
  });
}

function buildExpansionPayload(requestBody, previousText, minChars) {
  const providerMode = getProviderMode();
  const question = extractUserQuestion(requestBody);
  const remainingChars = Math.max(0, minChars - previousText.length);
  const blockTargetChars = Math.min(Math.max(remainingChars, 1200), 1600);
  const previousTail = String(previousText || "").slice(-1200);
  const requestOptions = requestBody && requestBody.options && typeof requestBody.options === "object"
    ? requestBody.options
    : {};
  const expandedNumPredict = Math.max(Number(requestOptions.num_predict || 0), 900);

  if (providerMode === "groq" || providerMode === "openai") {
    const baseMessages = buildOpenAiMessages(requestBody);

    const expansionInstruction = [
      "La respuesta anterior quedo incompleta.",
      `Genera una CONTINUACION por bloques sin repetir lo ya dicho, agregando aproximadamente ${blockTargetChars} caracteres en este bloque.`,
      "Responde en espanol con detalle, estructura clara, y sin introducciones ni cierres de relleno.",
      question ? `Pregunta original: ${question}` : "",
      `Tramo final de la respuesta previa: ${previousTail}`
    ].filter(Boolean).join("\n\n");

    return compactObject({
      model: requestBody.model || process.env.INTERNAL_AI_DEFAULT_MODEL,
      messages: [
        ...baseMessages,
        { role: "user", content: expansionInstruction }
      ],
      max_tokens: 900,
      temperature: 0.2,
      stream: false
    });
  }

  const expandedPrompt = [
    "La respuesta anterior quedo incompleta.",
    `Continua la explicacion por bloques sin repetir y agrega aproximadamente ${blockTargetChars} caracteres adicionales en este bloque.`,
    "Responde en espanol, con desarrollo amplio, tecnicamente claro y sin introducciones de relleno.",
    question ? `Pregunta original: ${question}` : "",
    `Tramo final de la respuesta previa: ${previousTail}`
  ].filter(Boolean).join("\n\n");

  return compactObject({
    model: requestBody.model || process.env.INTERNAL_AI_DEFAULT_MODEL,
    prompt: expandedPrompt,
    stream: false,
    options: {
      ...requestOptions,
      num_predict: expandedNumPredict,
      num_ctx: Math.max(Number(requestOptions.num_ctx || 0), 512),
      temperature: typeof requestOptions.temperature === "number" ? requestOptions.temperature : 0.2
    },
    messages: requestBody.messages,
    input: requestBody.input
  });
}

function buildRepairPayload(requestBody, previousText) {
  const providerMode = getProviderMode();
  const question = extractUserQuestion(requestBody);
  const correctionInstruction = [
    "Reescribe la respuesta anterior en espanol claro y natural.",
    "Conserva solo la informacion util.",
    "Si hay una negativa por privacidad o limitaciones, eliminála y sustituyela por una respuesta util basada en informacion publica general.",
    "No agregues advertencias sobre el modelo.",
    "Si la consulta pide biografia o perfil de una figura publica, entrega una sintesis breve y directa.",
    question ? `Pregunta original: ${question}` : "",
    previousText ? `Texto base a reescribir: ${previousText}` : ""
  ].filter(Boolean).join("\n\n");

  if (providerMode === "groq" || providerMode === "openai") {
    const baseMessages = buildOpenAiMessages(requestBody);

    return compactObject({
      model: requestBody.model || process.env.INTERNAL_AI_DEFAULT_MODEL,
      messages: [
        ...baseMessages,
        { role: "user", content: correctionInstruction }
      ],
      max_tokens: 120,
      temperature: 0.1,
      stream: false
    });
  }

  return compactObject({
    model: requestBody.model || process.env.INTERNAL_AI_DEFAULT_MODEL,
    prompt: correctionInstruction,
    stream: false,
    keep_alive: "20m",
    options: {
      ...buildFastOptions(requestBody && requestBody.options, question),
      ...DETAILED_RESPONSE_OPTIONS,
      num_predict: 96,
      num_ctx: 384,
      temperature: 0.1
    },
    input: question
  });
}

function extractAssistantText(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  if (typeof payload.response === "string" && payload.response.trim()) {
    return payload.response.trim();
  }

  if (typeof payload.text === "string" && payload.text.trim()) {
    return payload.text.trim();
  }

  if (typeof payload.answer === "string" && payload.answer.trim()) {
    return payload.answer.trim();
  }

  if (typeof payload.output === "string" && payload.output.trim()) {
    return payload.output.trim();
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  if (payload.message && typeof payload.message.content === "string" && payload.message.content.trim()) {
    return payload.message.content.trim();
  }

  const choiceText = payload.choices && payload.choices[0] && payload.choices[0].message
    ? payload.choices[0].message.content
    : "";
  if (typeof choiceText === "string" && choiceText.trim()) {
    return choiceText.trim();
  }

  return "";
}

function enforceMinimumLength(text, minChars, question) {
  const base = String(text || "").trim();
  if (base.length >= minChars) {
    return base;
  }

  const topic = getTextOrEmpty(question) || "la consulta legal planteada";
  const fillerBlock = buildMinimumLengthSupplement(topic);

  let result = base;
  while (result.length < minChars) {
    result = `${result}\n\n${fillerBlock}`.trim();
  }

  return result;
}

function enforceMaximumLength(text, maxChars) {
  const base = String(text || "").trim();
  if (!maxChars || maxChars <= 0 || base.length <= maxChars) {
    return base;
  }

  const sliced = base.slice(0, maxChars);
  const lastStop = Math.max(
    sliced.lastIndexOf("."),
    sliced.lastIndexOf("!"),
    sliced.lastIndexOf("?"),
    sliced.lastIndexOf("\n")
  );

  if (lastStop > Math.floor(maxChars * 0.65)) {
    return sliced.slice(0, lastStop + 1).trim();
  }

  return sliced.trim();
}

function buildMinimumLengthSupplement(topic) {
  if (isBiographyQuery(topic)) {
    return [
      "Ampliacion complementaria solicitada por la politica de longitud minima:",
      `Para ampliar la biografia sobre ${topic}, conviene ordenar la informacion en varios ejes: origen familiar, formacion, primeros anos de actividad, ascenso profesional, momentos de mayor visibilidad publica y efectos de sus decisiones en el entorno social o politico.`,
      `Tambien es util incorporar una cronologia narrativa sobre ${topic}, explicando en que contexto comenzo su trayectoria, cuales fueron los hitos que consolidaron su imagen publica, que alianzas, conflictos o controversias marcaron su carrera y de que manera evoluciono su posicion frente a temas centrales de su epoca.`,
      `Un perfil completo sobre ${topic} debe incluir ademas su estilo de liderazgo, los sectores con los que se relaciono, la forma en que fue percibido por seguidores y detractores, y el impacto de sus decisiones en el plano economico, institucional, cultural o mediatico.`,
      `Finalmente, para cerrar una biografia extensa sobre ${topic}, conviene sintetizar legado, influencia, episodios discutidos, transformaciones de imagen publica y las razones por las cuales su nombre sigue siendo relevante en debates contemporaneos.`
    ].join("\n\n");
  }

  if (isDetailedQuery(topic)) {
    return [
      "Ampliacion complementaria solicitada por la politica de longitud minima:",
      `Sobre ${topic}, es recomendable profundizar en definiciones clave, antecedentes, clasificaciones, elementos estructurales y diferencias frente a conceptos cercanos para evitar interpretaciones incompletas.`,
      `Tambien conviene desarrollar ejemplos practicos, escenarios de aplicacion, errores frecuentes, limites del concepto y consecuencias de una interpretacion incorrecta, de modo que la explicacion resulte mas util y accionable.`,
      `Una respuesta amplia sobre ${topic} debe incluir contexto, desarrollo ordenado por secciones, implicaciones concretas, excepciones relevantes y criterios para distinguir cuando el concepto cambia segun el pais, la disciplina o el problema planteado.`,
      `Para completar el panorama sobre ${topic}, es util cerrar con una sintesis integradora que conecte teoria, practica, riesgos, ventajas, debates y recomendaciones de uso o analisis.`
    ].join("\n\n");
  }

  return [
    "Ampliacion complementaria solicitada por la politica de longitud minima:",
    `Respecto de ${topic}, es util ampliar la respuesta con contexto general, definicion precisa, elementos esenciales, aplicaciones practicas y matices que ayuden a comprender el tema con mayor profundidad.`,
    `Ademas, una explicacion mas completa sobre ${topic} puede incorporar ejemplos, diferencias con ideas relacionadas, limites, casos frecuentes de confusion y recomendaciones para interpretar correctamente la informacion.`,
    `Cuando se desarrolla de forma extensa el tema ${topic}, conviene organizar el contenido por secciones, resumir los puntos principales y cerrar con una conclusion que integre los aspectos mas importantes tratados en la respuesta.`
  ].join("\n\n");
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  const upstreamUrl = process.env.INTERNAL_AI_API_URL;
  if (!upstreamUrl) {
    res.status(503).json({ error: "INTERNAL_AI_API_URL no configurada en Vercel" });
    return;
  }

  const requestBody = readJsonBody(req);
  const userQuestion = extractUserQuestion(requestBody);
  const adaptiveProfile = getAdaptiveResponseProfile(userQuestion);
  const forceFixedLength = String(process.env.PUBLIC_FORCE_FIXED_LENGTH || "0") === "1";
  const envMinChars = parsePositiveNumberOrNull(process.env.PUBLIC_MIN_RESPONSE_CHARS);
  const envMaxChars = parsePositiveNumberOrNull(process.env.PUBLIC_MAX_RESPONSE_CHARS);
  const envExpansionAttempts = parsePositiveNumberOrNull(process.env.PUBLIC_EXPANSION_ATTEMPTS);
  const timeoutMs = Math.max(
    Number(process.env.INTERNAL_AI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
    isDetailedQuery(userQuestion) ? 14000 : DEFAULT_TIMEOUT_MS
  );
  const minimumChars = Math.max(0, Number(
    forceFixedLength
      ? (envMinChars || MIN_PUBLIC_RESPONSE_CHARS)
      : adaptiveProfile.minimumChars
  ));
  const expansionAttempts = Math.max(0, Number(
    forceFixedLength
      ? (envExpansionAttempts || MAX_EXPANSION_ATTEMPTS)
      : adaptiveProfile.expansionAttempts
  ));
  const maximumChars = Math.min(
    MAX_PUBLIC_RESPONSE_CHARS,
    Math.max(
      minimumChars,
      Number(
        forceFixedLength
          ? (envMaxChars || MAX_PUBLIC_RESPONSE_CHARS)
          : adaptiveProfile.maximumChars
      )
    )
  );

  const authHeaderName = normalizeHeaderName(process.env.INTERNAL_AI_AUTH_HEADER, "Authorization");
  const apiKey = String(process.env.INTERNAL_AI_API_KEY || "").trim();
  const authScheme = String(process.env.INTERNAL_AI_AUTH_SCHEME || "Bearer").trim();
  const headers = {
    "Content-Type": "application/json"
  };
  const extraHeaders = parseJsonEnv("INTERNAL_AI_EXTRA_HEADERS");

  if (apiKey) {
    headers[authHeaderName] = authScheme ? `${authScheme} ${apiKey}` : apiKey;
  }

  Object.assign(headers, extraHeaders);
  sanitizeOutboundHeaders(headers);

  async function requestUpstream(payload) {
    return requestJsonUpstream(upstreamUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      timeoutMs
    });
  }

  let upstreamPayload = buildUpstreamPayload(requestBody);

  try {
    let upstreamResult = await requestUpstream(upstreamPayload);

    if (!upstreamResult.ok) {
      res.status(upstreamResult.status).json({
        error: `Error HTTP ${upstreamResult.status} del servidor IA`,
        detail: extractAssistantText(upstreamResult.payload) || upstreamResult.rawText.slice(0, 400)
      });
      return;
    }

    let assistantText = extractAssistantText(upstreamResult.payload);

    // Algunos backends devuelven 200 con texto vacio en el primer intento por "cold start".
    // Reintenta una vez con el mismo payload para evitar falso negativo operacional.
    if (!assistantText) {
      const retryResult = await requestUpstream(upstreamPayload);
      if (retryResult.ok) {
        upstreamResult = retryResult;
        assistantText = extractAssistantText(retryResult.payload);
      }
    }

    // Fallback adicional para consultas cortas o formatos de entrada heterogeneos.
    if (!assistantText) {
      const fallbackQuestion = extractUserQuestion(requestBody) || "hola";
      const fallbackPayload = buildUpstreamPayload({
        ...requestBody,
        prompt: `Responde de forma breve, clara y util en espanol. Consulta: ${fallbackQuestion}`,
        input: fallbackQuestion,
        question: fallbackQuestion
      });

      const fallbackResult = await requestUpstream(fallbackPayload);
      if (fallbackResult.ok) {
        const fallbackText = extractAssistantText(fallbackResult.payload);
        if (fallbackText) {
          upstreamResult = fallbackResult;
          assistantText = fallbackText;
          upstreamPayload = fallbackPayload;
        }
      }
    }

    if (shouldRepairAnswer(userQuestion, assistantText)) {
      const repairPayload = buildRepairPayload(requestBody, assistantText);
      const repairedResult = await requestUpstream(repairPayload);

      if (repairedResult.ok) {
        const repairedText = extractAssistantText(repairedResult.payload);
        if (repairedText) {
          upstreamResult = repairedResult;
          assistantText = repairedText;
          upstreamPayload = repairPayload;
        }
      }
    }

    for (let attempt = 0; attempt < expansionAttempts && minimumChars > 0 && assistantText.length < minimumChars; attempt += 1) {
      const expansionPayload = buildExpansionPayload(requestBody, assistantText, minimumChars);
      upstreamResult = await requestUpstream(expansionPayload);

      if (!upstreamResult.ok) {
        break;
      }

      const expandedText = extractAssistantText(upstreamResult.payload);
      if (!expandedText) {
        break;
      }

      assistantText = `${assistantText}\n\n${expandedText}`.trim();
      upstreamPayload = expansionPayload;
    }

    if (!assistantText) {
      res.status(502).json({ error: "El servidor IA respondio sin texto util" });
      return;
    }

    if (minimumChars > 0) {
      assistantText = enforceMinimumLength(assistantText, minimumChars, userQuestion);
    }

    assistantText = enforceMaximumLength(assistantText, maximumChars);

    res.status(200).json({
      response: assistantText,
      model: upstreamResult.payload.model || upstreamPayload.model || process.env.INTERNAL_AI_DEFAULT_MODEL || "api-remota"
    });
  } catch (error) {
    const timedOut = error && error.name === "AbortError";
    res.status(timedOut ? 504 : 502).json({
      error: timedOut ? "Tiempo agotado al consultar el servidor IA" : "No se pudo conectar con el servidor IA",
      detail: error && error.message ? error.message : "sin detalle"
    });
  }
};