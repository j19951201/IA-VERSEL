const crypto = require("crypto");

const {
  json,
  readJsonBody,
  normalizeEmail,
  normalizeName,
  hashPassword,
  createPublicUser,
  buildHostBase,
  signUserRecordToken
} = require("./_auth");
const {
  getUserByEmail,
  createUser,
  updateUser,
  createVerifyToken,
  hasKvConfig,
  hasBlobConfig
} = require("./_auth-store");
const { upsertStripeCustomer } = require("./_stripe-backup");
const { sendTransactionalEmail, sendWelcomeEmail } = require("./_mailer");

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
    const fullName = normalizeName(body.fullName);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const photoDataUrl = String(body.photoDataUrl || "").trim();
    const restoreLogin = body.restoreLogin === true;

    if (!fullName || fullName.length < 3) {
      json(res, 400, { error: "Nombre completo invalido" });
      return;
    }

    if (!email || !email.includes("@")) {
      json(res, 400, { error: "Correo invalido" });
      return;
    }

    if (password.length < 8) {
      json(res, 400, { error: "La contrasena debe tener al menos 8 caracteres" });
      return;
    }

    if (photoDataUrl) {
      const isValidImage = /^data:image\/(png|jpe?g|webp);base64,/i.test(photoDataUrl);
      if (!isValidImage) {
        json(res, 400, { error: "Formato de foto invalido" });
        return;
      }
      if (photoDataUrl.length > 2_800_000) {
        json(res, 400, { error: "La foto es demasiado grande" });
        return;
      }
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      json(res, 409, { error: "Ese correo ya esta registrado" });
      return;
    }

    const passwordHash = hashPassword(password);
    let user;
    let usingTransientUser = false;

    try {
      user = await createUser({ fullName, email, passwordHash, photoUrl: photoDataUrl || "" });
    } catch (createError) {
      const detail = String((createError && createError.message) || "");
      const looksLikeStorageFailure = /blob|kv|store|suspend|suspended|storage/i.test(detail);
      if (!looksLikeStorageFailure) {
        throw createError;
      }

      // Fallback transitorio: permite login inmediato con userToken aunque el store esté caído.
      usingTransientUser = true;
      const now = new Date().toISOString();
      user = {
        id: crypto.randomUUID(),
        fullName,
        email,
        passwordHash,
        photoUrl: photoDataUrl || "",
        avatarUrl: photoDataUrl || "",
        emailVerified: true,
        createdAt: now,
        updatedAt: now
      };
    }

    const verifyToken = usingTransientUser ? "" : await createVerifyToken(email, 60 * 30);

    const baseUrl = buildHostBase(req);
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`;

    let mailResult = { sent: false, reason: "restore-login" };
    if (!restoreLogin && !usingTransientUser) {
      mailResult = await sendTransactionalEmail({
        to: email,
        subject: "Verifica tu cuenta de IA Juris",
        html: `<p>Hola ${fullName},</p><p>Gracias por registrarte. Verifica tu cuenta con este enlace:</p><p><a href=\"${verifyUrl}\">Verificar correo</a></p><p>Si no solicitaste esta cuenta, ignora este mensaje.</p>`
      });
    }

    // Enviar correo de bienvenida después de crear la cuenta
    let welcomeResult = { sent: false, reason: "skip-transient-store" };
    if (!usingTransientUser) {
      welcomeResult = await sendWelcomeEmail({
        to: email,
        fullName
      });
    }

    // Si no hay servicio de email configurado, auto-verificar para que el usuario pueda iniciar sesión
    let autoVerified = false;
    if (restoreLogin || !mailResult.sent || usingTransientUser) {
      if (!usingTransientUser) {
        await updateUser({ ...user, emailVerified: true });
      }
      autoVerified = true;
    }

    try {
      await upsertStripeCustomer({
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        emailVerified: autoVerified || !!user.emailVerified,
        passwordHash: user.passwordHash
      });
    } catch (_stripeBackupError) {
    }

    // Generar userToken para autenticación sin almacenamiento persistente
    // Permite al frontend enviar este token en el login y evitar la pérdida de sesión
    // entre invocaciones serverless cuando no hay Vercel KV configurado
    const userToken = signUserRecordToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      photoUrl: user.photoUrl || "",
      emailVerified: true
    });

    const payload = {
      ok: true,
      message: mailResult.sent
        ? "Cuenta creada. Revisa tu correo para verificar la cuenta y lee tu correo de bienvenida a IA Juris."
        : (restoreLogin ? "Cuenta restaurada en este dispositivo. Ya puedes iniciar sesion." : "¡Cuenta creada con éxito! Ya puedes iniciar sesión."),
      requiresEmailVerification: !autoVerified,
      autoVerified,
      userToken,
      user: createPublicUser(user),
      storageMode: hasKvConfig() ? "kv" : (hasBlobConfig() ? "blob" : "memory"),
      restoreLogin,
      transientStoreFallback: usingTransientUser,
      emailsSent: {
        verificationEmail: mailResult.sent,
        welcomeEmail: welcomeResult.sent
      }
    };

    if (!mailResult.sent && !autoVerified) {
      payload.verificationToken = verifyToken;
      payload.verifyUrl = verifyUrl;
      payload.mailerNote = mailResult.reason;
    }

    json(res, 201, payload);
  } catch (error) {
    json(res, 500, { error: "No se pudo crear la cuenta", detail: error.message });
  }
};
