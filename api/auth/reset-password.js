const {
  json,
  readJsonBody,
  hashPassword
} = require("./_auth");
const {
  consumeResetToken,
  getUserByEmail,
  updateUser
} = require("./_auth-store");

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

  try {
    const body = readJsonBody(req);
    const token = String(body.token || "").trim();
    const newPassword = String(body.newPassword || "");

    if (!token) {
      json(res, 400, { error: "Token requerido" });
      return;
    }

    if (newPassword.length < 8) {
      json(res, 400, { error: "La contrasena debe tener al menos 8 caracteres" });
      return;
    }

    const consumed = await consumeResetToken(token);
    if (!consumed || !consumed.email) {
      json(res, 400, { error: "Token de restablecimiento invalido o expirado" });
      return;
    }

    const user = await getUserByEmail(consumed.email);
    if (!user) {
      json(res, 404, { error: "Usuario no encontrado" });
      return;
    }

    const updatedUser = {
      ...user,
      passwordHash: hashPassword(newPassword)
    };

    await updateUser(updatedUser);

    json(res, 200, { ok: true, message: "Contrasena actualizada correctamente" });
  } catch (error) {
    json(res, 500, { error: "No se pudo restablecer la contrasena", detail: error.message });
  }
};
