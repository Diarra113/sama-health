function verifierRoleAdmin(req, res, next) {
  if (req.role !== "administrateur") {
    return res.status(403).json({ message: "Accès réservé à l'administrateur." });
  }
  next();
}

module.exports = verifierRoleAdmin;