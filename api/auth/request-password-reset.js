const {
  json,
  readJsonBody,
  normalizeEmail,
  buildHostBase
} = require("./_auth");
const {
  getUserByEmail,
  createResetToken
} = require("./_auth-store");
const { sendTransactionalEmail } = require("./_mailer");

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
    const email = normalizeEmail(body.email);

    if (!email || !email.includes("@")) {
      json(res, 400, { error: "Correo invalido" });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      json(res, 200, {
        ok: true,
        message: "Si el correo existe, recibira instrucciones para restablecer su contrasena."
      });
      return;
    }

    const resetToken = await createResetToken(email, 60 * 20);
    const baseUrl = buildHostBase(req);
    const resetUrl = `${baseUrl}/?resetToken=${encodeURIComponent(resetToken)}`;

    const mailResult = await sendTransactionalEmail({
      to: email,
      subject: "Restablece tu contrasena en IA Juris",
      html: `<p>Hola ${user.fullName},</p><p>Para restablecer tu contrasena usa este enlace:</p><p><a href=\"${resetUrl}\">Restablecer contrasena</a></p><p>Si no hiciste esta solicitud, ignora este mensaje.</p>`
    });

    const responsePayload = {
      ok: true,
      message: "Si el correo existe, recibira instrucciones para restablecer su contrasena."
    };

    if (!mailResult.sent) {
      responsePayload.resetToken = resetToken;
      responsePayload.resetUrl = resetUrl;
      responsePayload.mailerNote = mailResult.reason;
    }

    json(res, 200, responsePayload);
  } catch (error) {
    json(res, 500, { error: "No se pudo solicitar restablecimiento", detail: error.message });
  }
};
