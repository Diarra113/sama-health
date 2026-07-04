const jwt = require("jsonwebtoken");

function verifierToken(req, res, next) {
  const enTete = req.headers.authorization;

  if (!enTete || !enTete.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
  }

  const token = enTete.split(" ")[1];

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateurId = decode.id;
    req.role = decode.role;
    next();
  } catch (erreur) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
}

module.exports = verifierToken;