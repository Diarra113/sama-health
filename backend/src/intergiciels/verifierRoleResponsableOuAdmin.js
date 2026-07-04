// backend/src/intergiciels/verifierRoleResponsableOuAdmin.js
function verifierRoleResponsableOuAdmin(req, res, next) {
  if (req.role !== "administrateur" && req.role !== "responsable") {
    return res.status(403).json({ message: "Accès non autorisé." });
  }
  next();
}
module.exports = verifierRoleResponsableOuAdmin;