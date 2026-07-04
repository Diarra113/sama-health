const Specialite = require("../modeles/Specialite");

async function listerToutesSpecialites(req, res) {
  try {
    const specialites = await Specialite.findAll({ order: [["nom", "ASC"]] });
    res.status(200).json(specialites);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = { listerToutesSpecialites };