const {
  json,
  readJsonBody,
  normalizeEmail,
  verifyPassword,
  setSessionCookie,
  createPublicUser,
  verifyUserRecordToken
} = require("./_auth");
const { getUserByEmail, updateUser, hasKvConfig } = require("./_auth-store");
const { getFullUserByEmail, hasStripeBackupConfig } = require("./_stripe-backup");

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
    const password = String(body.password || "");
    const photoDataUrl = String(body.photoDataUrl || "").trim();
    const userToken = String(body.userToken || "").trim();

    if (!email || !password) {
      json(res, 400, { error: "Credenciales incompletas" });
      return;
    }

    // Intentar resolver el usuario desde el userToken firmado (funciona sin KV)
    let user = null;
    if (userToken) {
      const tokenData = verifyUserRecordToken(userToken);
      if (tokenData && normalizeEmail(tokenData.email) === email) {
        user = tokenData;
      }
    }

    // Fallback: buscar en almacenamiento (KV o memoria)
    if (!user) {
      user = await getUserByEmail(email);
    }

    // Fallback Stripe: buscar en backup de Stripe si Blob está caído
    if (!user && hasStripeBackupConfig()) {
      try {
        user = await getFullUserByEmail(email);
      } catch (_stripeErr) {
        user = null;
      }
    }

    if (!user) {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Si NO hay almacenamiento persistente (KV), siempre devolver AUTH_STORAGE_UNAVAILABLE
      if (!hasKvConfig()) {
        json(res, 409, {
          error: "Cuenta no encontrada en almacenamiento temporal. Registrate de nuevo en este dispositivo o configura Vercel KV.",
          code: "AUTH_STORAGE_UNAVAILABLE"
        });
        return;
      }

      json(res, 401, { error: "Credenciales invalidas" });
      return;
    }

    const passwordValid = user && verifyPassword(password, user.passwordHash);
    
    if (!passwordValid) {
      // Agregar un pequeño delay para evitar ataques de fuerza bruta
      await new Promise(resolve => setTimeout(resolve, 300));
      json(res, 401, { error: "Credenciales invalidas" });
      return;
    }

    if (!user.emailVerified) {
      json(res, 403, { error: "Debes verificar tu correo antes de iniciar sesion" });
      return;
    }

    // Actualizar foto de perfil si se envió una nueva
    let finalUser = user;
    if (photoDataUrl) {
      const isValidImage = /^data:image\/(png|jpe?g|webp);base64,/i.test(photoDataUrl);
      if (isValidImage && photoDataUrl.length <= 2_800_000) {
        finalUser = await updateUser({ ...user, photoUrl: photoDataUrl, avatarUrl: photoDataUrl });
      }
    }

    setSessionCookie(res, {
      sub: finalUser.id,
      email: finalUser.email,
      fullName: finalUser.fullName,
      role: "member",
      planName: String(
        finalUser.paidPlanName
        || finalUser.currentPlanName
        || finalUser.planName
        || finalUser.subscriptionPlan
        || finalUser.membershipPlan
        || finalUser.plan
        || ""
      ).trim(),
      photoUrl: finalUser.photoUrl || finalUser.avatarUrl || "",
      avatarUrl: finalUser.avatarUrl || finalUser.photoUrl || ""
    });

    json(res, 200, {
      ok: true,
      message: "Sesion iniciada",
      user: createPublicUser(finalUser)
    });
  } catch (error) {
    json(res, 500, { error: "No se pudo iniciar sesion", detail: error.message });
  }
};
