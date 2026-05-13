const fs = require("fs");
const path = require("path");

const OVERRIDES_PATH = path.resolve(__dirname, "../../runtime-logs/users-report-overrides.json");

function ensureDir() {
  const dir = path.dirname(OVERRIDES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readOverrides() {
  try {
    if (!fs.existsSync(OVERRIDES_PATH)) return {};
    const raw = fs.readFileSync(OVERRIDES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_err) {
    return {};
  }
}

function writeOverrides(overrides) {
  try {
    ensureDir();
    fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides || {}, null, 2), "utf8");
  } catch (_err) {
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function getOverrideByEmail(email) {
  const key = normalizeEmail(email);
  if (!key) return null;
  const all = readOverrides();
  const item = all[key];
  if (!item || typeof item !== "object") return null;
  return {
    fullName: normalizeName(item.fullName || ""),
    email: normalizeEmail(item.email || ""),
    updatedAt: String(item.updatedAt || "")
  };
}

function upsertOverride({ currentEmail, fullName, email }) {
  const key = normalizeEmail(currentEmail);
  if (!key) {
    throw new Error("currentEmail requerido");
  }

  const nameValue = normalizeName(fullName || "");
  const emailValue = normalizeEmail(email || "");
  if (!nameValue && !emailValue) {
    throw new Error("Debes enviar al menos fullName o email");
  }

  const all = readOverrides();
  all[key] = {
    fullName: nameValue,
    email: emailValue,
    updatedAt: new Date().toISOString()
  };
  writeOverrides(all);

  return {
    currentEmail: key,
    fullName: nameValue,
    email: emailValue,
    updatedAt: all[key].updatedAt
  };
}

module.exports = {
  getOverrideByEmail,
  upsertOverride
};
