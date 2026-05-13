const { json, readJsonBody, normalizeEmail } = require("./_auth");
const { listUsers, hasKvConfig, hasBlobConfig } = require("./_auth-store");
const { listStripeBackupUsers, hasStripeBackupConfig } = require("./_stripe-backup");
const { upsertStripeCustomer } = require("./_stripe-backup");
const { getOverrideByEmail, upsertOverride } = require("./_users-report-overrides");
const { sendTransactionalEmail } = require("./_mailer");

const EMAIL_SUBJECT = "IA Juris Notificaciones";

function isGmailAddress(value) {
  return /@gmail\.com$/i.test(String(value || "").trim());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function asIsoDate(value) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function buildTasksHtml(tasks) {
  if (!tasks.length) {
    return "<li>No hay tareas guardadas.</li>";
  }

  return tasks
    .map((task) => {
      const state = task.completed ? "Completada" : "Pendiente";
      const createdAtText = task.createdAt ? asIsoDate(task.createdAt) : "Sin fecha";
      return `<li><strong>${escapeHtml(task.text || "Tarea sin descripcion")}</strong> · Estado: ${escapeHtml(state)} · Prioridad: ${escapeHtml(task.priority || "normal")} · Creada: ${escapeHtml(createdAtText)}</li>`;
    })
    .join("");
}

function buildEventsHtml(events) {
  if (!events.length) {
    return "<li>No hay eventos guardados.</li>";
  }

  return events
    .map((eventItem) => {
      const datePart = String(eventItem.date || "Sin fecha");
      const timePart = String(eventItem.time || "--:--");
      const owner = String(eventItem.owner || "Sin responsable");
      const noteText = eventItem.note ? ` · Nota: ${escapeHtml(eventItem.note)}` : "";
      return `<li><strong>${escapeHtml(eventItem.title || "Evento")}</strong> · Fecha: ${escapeHtml(datePart)} ${escapeHtml(timePart)} · Responsable: ${escapeHtml(owner)}${noteText}</li>`;
    })
    .join("");
}

function buildNotificationHtml({ tasks, events, generatedAt, source }) {
  const generatedAtText = asIsoDate(generatedAt || new Date().toISOString());
  const sourceText = source ? escapeHtml(source) : "panel_tareas";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#1f2937;max-width:720px;margin:0 auto;padding:18px;">
      <h2 style="margin:0 0 10px 0;color:#111827;">IA Juris Notificaciones</h2>
      <p style="margin:0 0 14px 0;">Resumen de actividades guardadas en IA Juris.</p>
      <p style="margin:0 0 14px 0;"><strong>Origen:</strong> ${sourceText}<br/><strong>Generado:</strong> ${escapeHtml(generatedAtText)}</p>

      <h3 style="margin:18px 0 8px 0;color:#111827;">Tareas del dia (${tasks.length})</h3>
      <ul style="margin:0 0 14px 18px;padding:0;">
        ${buildTasksHtml(tasks)}
      </ul>

      <h3 style="margin:18px 0 8px 0;color:#111827;">Eventos guardados (${events.length})</h3>
      <ul style="margin:0 0 14px 18px;padding:0;">
        ${buildEventsHtml(events)}
      </ul>

      <p style="margin-top:16px;color:#6b7280;font-size:12px;">Este correo fue generado automaticamente por IA Juris.</p>
    </div>
  `.trim();
}

async function handleSendActivitiesNotification(req, res) {
  const body = readJsonBody(req);
  const to = normalizeEmail(body.to || body.email || "");

  if (!to) {
    json(res, 400, { error: "Debes indicar un correo de destino" });
    return;
  }

  if (!isGmailAddress(to)) {
    json(res, 400, { error: "Solo se permiten correos @gmail.com" });
    return;
  }

  const activities = body && typeof body.activities === "object" ? body.activities : {};
  const tasks = Array.isArray(activities.tasks) ? activities.tasks.slice(0, 80) : [];
  const events = Array.isArray(activities.events) ? activities.events.slice(0, 80) : [];

  if (!tasks.length && !events.length) {
    json(res, 400, { error: "No hay actividades guardadas para notificar" });
    return;
  }

  const html = buildNotificationHtml({
    tasks,
    events,
    generatedAt: String(body.generatedAt || "").trim(),
    source: String(body.source || "").trim()
  });

  try {
    const mailResult = await sendTransactionalEmail({ to, subject: EMAIL_SUBJECT, html });
    if (!mailResult || !mailResult.sent) {
      json(res, 503, {
        error: "Servicio de correo no disponible",
        detail: mailResult && mailResult.reason ? mailResult.reason : "Sin detalle"
      });
      return;
    }

    json(res, 200, {
      ok: true,
      subject: EMAIL_SUBJECT,
      message: `Notificacion enviada a ${to}`,
      tasks: tasks.length,
      events: events.length
    });
  } catch (error) {
    json(res, 500, {
      error: "No se pudo enviar la notificacion",
      detail: error && error.message ? error.message : "sin detalle"
    });
  }
}

async function handleCorrectUser(req, res, body) {
  if (!isAuthorized(req)) {
    json(res, 401, { error: "No autorizado" });
    return;
  }

  const currentEmail = normalizeEmail(body.currentEmail || "");
  const email = normalizeEmail(body.email || "");
  const fullName = String(body.fullName || "").trim().replace(/\s+/g, " ");

  if (!currentEmail || !currentEmail.includes("@")) {
    json(res, 400, { error: "currentEmail invalido" });
    return;
  }

  if (email && !email.includes("@")) {
    json(res, 400, { error: "email invalido" });
    return;
  }

  if (fullName && fullName.length < 3) {
    json(res, 400, { error: "fullName invalido" });
    return;
  }

  try {
    const saved = upsertOverride({ currentEmail, fullName, email });

    if (hasStripeBackupConfig()) {
      const emailToPersist = email || currentEmail;
      try {
        await upsertStripeCustomer({
          fullName,
          email: emailToPersist,
          userId: "",
          createdAt: new Date().toISOString(),
          emailVerified: true
        });
      } catch (_stripeCorrectionErr) {
      }
    }

    json(res, 200, {
      ok: true,
      message: "Correccion guardada",
      override: saved
    });
  } catch (error) {
    json(res, 500, {
      error: "No se pudo guardar la correccion",
      detail: error && error.message ? error.message : "sin detalle"
    });
  }
}

function isAuthorized(req) {
  const expected = String(process.env.AUTH_ADMIN_REPORT_TOKEN || process.env.INTERNAL_AI_API_KEY || "").trim();
  if (!expected) return true;

  const header = String(req.headers.authorization || "").trim();
  if (!header) return false;

  const bearer = /^Bearer\s+(.+)$/i.exec(header);
  const token = bearer ? String(bearer[1] || "").trim() : header;
  return token === expected;
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: String(user.id || ""),
    fullName: String(user.fullName || ""),
    email: String(user.email || ""),
    emailVerified: !!user.emailVerified,
    createdAt: String(user.createdAt || "")
  };
}

function isGenericFullName(name) {
  const normalized = String(name || "").trim().toLowerCase();
  if (!normalized) return true;
  return (
    normalized === "usuario" ||
    normalized === "usuario sin plan" ||
    normalized === "usuario ia juris" ||
    /^sinplan\s+\d+$/i.test(normalized) ||
    normalized === "(sin nombre)" ||
    normalized === "sin nombre"
  );
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function fullNameFromEmail(email) {
  const localPart = String(email || "").split("@")[0] || "";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "";
  return titleCase(cleaned);
}

function resolveDisplayName(primaryName, secondaryName, email) {
  const first = String(primaryName || "").trim();
  const second = String(secondaryName || "").trim();

  if (first && !isGenericFullName(first)) return first;
  if (second && !isGenericFullName(second)) return second;

  const derived = fullNameFromEmail(email);
  if (derived) return derived;
  if (first) return first;
  if (second) return second;
  return "Usuario";
}

function applyUserOverride(user) {
  const normalizedEmail = String(user && user.email || "").trim().toLowerCase();
  const override = getOverrideByEmail(normalizedEmail);
  if (!override) {
    return {
      ...user,
      fullName: resolveDisplayName(user && user.fullName, "", normalizedEmail)
    };
  }

  const emailAfterOverride = String(override.email || normalizedEmail).trim().toLowerCase();
  return {
    ...user,
    email: emailAfterOverride || normalizedEmail,
    fullName: resolveDisplayName(override.fullName, user && user.fullName, emailAfterOverride || normalizedEmail)
  };
}

function mergeUsersByEmail() {
  const merged = new Map();

  return {
    add(items) {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        const user = toPublicUser(item);
        const email = String(user && user.email || "").trim().toLowerCase();
        if (!email) continue;

        const normalizedUser = {
          ...user,
          email,
          fullName: resolveDisplayName(user && user.fullName, "", email)
        };

        const current = merged.get(email);
        if (!current) {
          merged.set(email, normalizedUser);
          continue;
        }

        merged.set(email, {
          id: current.id || normalizedUser.id,
          fullName: resolveDisplayName(current.fullName, normalizedUser.fullName, email),
          email,
          emailVerified: current.emailVerified || normalizedUser.emailVerified,
          createdAt: current.createdAt || normalizedUser.createdAt
        });
      }
    },
    toArray() {
      return Array.from(merged.values());
    }
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "POST") {
    const body = readJsonBody(req);
    const operation = String(body.operation || "").trim().toLowerCase();
    if (operation === "correct-user") {
      await handleCorrectUser(req, res, body);
      return;
    }

    await handleSendActivitiesNotification(req, res);
    return;
  }

  if (req.method !== "GET") {
    json(res, 405, { error: "Metodo no permitido" });
    return;
  }

  if (!isAuthorized(req)) {
    json(res, 401, { error: "No autorizado" });
    return;
  }

  try {
    const mergedUsers = mergeUsersByEmail();
    const users = await listUsers();
    mergedUsers.add(Array.isArray(users) ? users : []);

    if (hasStripeBackupConfig()) {
      try {
        const stripeUsers = await listStripeBackupUsers();
        mergedUsers.add(stripeUsers);
      } catch (_stripeError) {
      }
    }

    const safeUsers = mergedUsers
      .toArray()
      .map((user) => applyUserOverride(user));

    safeUsers.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    json(res, 200, {
      ok: true,
      count: safeUsers.length,
      storageMode: hasKvConfig() ? "kv" : (hasBlobConfig() ? "blob" : "memory"),
      users: safeUsers
    });
  } catch (error) {
    json(res, 500, { error: "No se pudo listar usuarios", detail: error.message });
  }
};
