const Utilisateur = require("../modeles/Utilisateur");
const Patient = require("../modeles/Patient");

async function obtenirMonProfil(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.utilisateurId, {
      include: Patient,
    });

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    res.status(200).json({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      adresse: utilisateur.Patient?.adresse || "",
      dateNaissance: utilisateur.Patient?.dateNaissance || "",
      lieuDeNaissance: utilisateur.Patient?.lieuDeNaissance || "",
      sexe: utilisateur.Patient?.sexe || "",
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function modifierMonProfil(req, res) {
  try {
    const { adresse, dateNaissance, lieuDeNaissance, sexe } = req.body;

    const patient = await Patient.findOne({ where: { utilisateurId: req.utilisateurId } });
    if (!patient) {
      return res.status(404).json({ message: "Profil patient introuvable." });
    }

    await patient.update({ adresse, dateNaissance, lieuDeNaissance, sexe });

    res.status(200).json({ message: "Profil mis à jour avec succès." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
}

async function modifierIdentite(req, res) {
  try {
    const { nom, prenom } = req.body;

    if (!nom?.trim() || !prenom?.trim()) {
      return res.status(400).json({ message: "Le nom et le prénom sont obligatoires." });
    }

    const utilisateur = await Utilisateur.findByPk(req.utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    await utilisateur.update({ nom, prenom });

    res.status(200).json({
      message: "Identité mise à jour avec succès.",
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, prenom: utilisateur.prenom, role: utilisateur.role },
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
}

module.exports = { obtenirMonProfil, modifierMonProfil, modifierIdentite };