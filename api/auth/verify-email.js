const {
  json,
  readJsonBody,
  buildHostBase
} = require("./_auth");
const {
  consumeVerifyToken,
  getUserByEmail,
  updateUser
} = require("./_auth-store");

async function applyVerification(token) {
  const consumed = await consumeVerifyToken(token);
  if (!consumed || !consumed.email) {
    return { ok: false, status: 400, message: "Token de verificacion invalido o expirado" };
  }

  const user = await getUserByEmail(consumed.email);
  if (!user) {
    return { ok: false, status: 404, message: "Usuario no encontrado" };
  }

  if (user.emailVerified) {
    return { ok: true, status: 200, message: "Correo ya verificado" };
  }

  await updateUser({ ...user, emailVerified: true });
  return { ok: true, status: 200, message: "Correo verificado correctamente" };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      const url = new URL(req.url, buildHostBase(req));
      const token = String(url.searchParams.get("token") || "").trim();
      const result = await applyVerification(token);
      const redirectUrl = `${buildHostBase(req)}/?emailVerified=${result.ok ? "1" : "0"}&authMessage=${encodeURIComponent(result.message)}`;
      res.statusCode = 302;
      res.setHeader("Location", redirectUrl);
      res.end();
      return;
    }

    if (req.method !== "POST") {
      json(res, 405, { error: "Metodo no permitido" });
      return;
    }

    const body = readJsonBody(req);
    const token = String(body.token || "").trim();
    const result = await applyVerification(token);
    json(res, result.status, {
      ok: result.ok,
      message: result.message
    });
  } catch (error) {
    json(res, 500, { error: "No se pudo verificar el correo", detail: error.message });
  }
};
