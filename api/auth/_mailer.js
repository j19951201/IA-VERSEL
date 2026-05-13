const http = require("http");
const https = require("https");

function requestJson(urlText, options = {}) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(urlText);
    const transport = targetUrl.protocol === "https:" ? https : http;
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
        method: options.method || "POST",
        headers
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let payload = {};
          try {
            payload = text ? JSON.parse(text) : {};
          } catch (_err) {
            payload = { text };
          }

          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode || 500,
            payload
          });
        });
      }
    );

    req.setTimeout(12000, () => {
      req.destroy(new Error("mail_timeout"));
    });

    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function sendTransactionalEmail({ to, subject, html }) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.RESEND_FROM_EMAIL || "").trim();

  if (!apiKey || !from) {
    const missing = [];
    if (!apiKey) missing.push("RESEND_API_KEY");
    if (!from) missing.push("RESEND_FROM_EMAIL");
    return { sent: false, reason: `RESEND no configurado: falta ${missing.join(" y ")}` };
  }

  let result;
  try {
    result = await requestJson("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html
      })
    });
  } catch (error) {
    const reason = error && error.message ? String(error.message) : "error_desconocido";
    return { sent: false, reason: `RESEND request error: ${reason}` };
  }

  if (!result.ok) {
    const apiMessage = result && result.payload && result.payload.message
      ? String(result.payload.message)
      : "";
    const apiName = result && result.payload && result.payload.name
      ? String(result.payload.name)
      : "";
    const detail = [apiName, apiMessage].filter(Boolean).join(" - ");
    return {
      sent: false,
      reason: detail ? `RESEND HTTP ${result.status}: ${detail}` : `RESEND HTTP ${result.status}`
    };
  }

  return { sent: true };
}

function buildWelcomeEmailHtml(fullName) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenida a IA Juris</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 24px;
      color: #1f2937;
    }
    .greeting strong {
      color: #667eea;
    }
    .message {
      color: #4b5563;
      margin-bottom: 24px;
      line-height: 1.8;
    }
    .message p {
      margin: 12px 0;
    }
    .features {
      background-color: #f3f4f6;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .features h3 {
      margin: 0 0 12px 0;
      color: #1f2937;
      font-size: 16px;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
      color: #4b5563;
    }
    .features li {
      margin: 8px 0;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 6px;
      margin: 24px 0;
      font-weight: 600;
      font-size: 15px;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .footer p {
      margin: 8px 0;
    }
    .copyright {
      color: #9ca3af;
      font-size: 11px;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚖️ IA Juris</h1>
      <p>Tu Asistente Legal Inteligente</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        ¡Hola <strong>${fullName}</strong>!
      </div>
      
      <div class="message">
        <p>Bienvenida a <strong>IA Juris</strong>, tu asistente legal impulsado por inteligencia artificial.</p>
        <p>Estamos emocionados de tener en nuestra comunidad. Ahora puedes acceder a consultas legales inteligentes, análisis de documentos y gestión eficiente de tus asuntos legales.</p>
      </div>
      
      <div class="features">
        <h3>¿Qué puedes hacer ahora?</h3>
        <ul>
          <li><strong>Consulta Legal Instantánea:</strong> Obtén respuestas a tus preguntas legales en segundos</li>
          <li><strong>Análisis de Documentos:</strong> Carga y analiza contratos, documentos legales y más</li>
          <li><strong>Historial de Consultas:</strong> Guarda y revisa todas tus conversaciones</li>
          <li><strong>Asesoramiento Continuo:</strong> Acceso 24/7 a tu asistente legal de IA</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="https://ia-juris-app.vercel.app" class="cta-button">Comenzar a Usar IA Juris</a>
      </div>
      
      <div class="message" style="margin-top: 32px; font-size: 13px; color: #6b7280;">
        <p>Si tienes preguntas o necesitas ayuda, no dudes en contactarnos respondiendo a este correo.</p>
        <p>¡Esperamos que disfrutes tu experiencia con <strong>IA Juris</strong>!</p>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 <strong>B-Labs</strong>. Todos los derechos reservados.</p>
      <p>Este correo fue enviado porque creaste una cuenta en IA Juris.</p>
      <div class="copyright">
        IA Juris es un servicio de consultoría legal asistida por inteligencia artificial. No reemplaza asesoramiento legal profesional.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function sendWelcomeEmail({ to, fullName }) {
  return sendTransactionalEmail({
    to,
    subject: "¡Bienvenida a IA Juris! Comienza tu consulta legal ahora",
    html: buildWelcomeEmailHtml(fullName)
  });
}

module.exports = {
  sendTransactionalEmail,
  sendWelcomeEmail
};
