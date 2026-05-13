const {
  json,
  getSessionFromRequest,
  createPublicUser
} = require("./_auth");
const { getUserById } = require("./_auth-store");

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

  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.sub) {
      json(res, 401, { error: "Sesion no valida" });
      return;
    }

    const user = await getUserById(session.sub);

    // Fallback sin KV: si no encontramos el usuario en almacenamiento,
    // reconstruimos el perfil básico desde el token de sesión firmado.
    if (!user) {
      if (!session.email || !session.fullName) {
        json(res, 401, { error: "Sesion no valida" });
        return;
      }

      const sessionUser = {
        id: session.sub || "",
        fullName: String(session.fullName || ""),
        email: String(session.email || ""),
        planName: String(session.planName || session.plan || ""),
        paidPlanName: String(session.planName || session.plan || ""),
        photoUrl: String(session.photoUrl || session.avatarUrl || ""),
        avatarUrl: String(session.avatarUrl || session.photoUrl || ""),
        emailVerified: true,
        createdAt: null
      };

      json(res, 200, { ok: true, user: createPublicUser(sessionUser), source: "session-token" });
      return;
    }

    json(res, 200, { ok: true, user: createPublicUser(user), source: "store" });
  } catch (error) {
    json(res, 500, { error: "No se pudo validar sesion", detail: error.message });
  }
};
