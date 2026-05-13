const { json, clearSessionCookie } = require("./_auth");

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

  clearSessionCookie(res);
  json(res, 200, { ok: true, message: "Sesion cerrada" });
};
