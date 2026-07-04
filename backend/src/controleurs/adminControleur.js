const bcrypt = require("bcrypt");
const Utilisateur = require("../modeles/Utilisateur");
const Medecin = require("../modeles/Medecin");
const ResponsableService = require("../modeles/ResponsableService");
const Administrateur = require("../modeles/Administrateur");
const Hopital = require("../modeles/Hopital");
const Specialite = require("../modeles/Specialite");

function genererMotDePasse() {
  const lettres = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
  const chiffres = "23456789";
  let mdp = "";
  for (let i = 0; i < 5; i++) mdp += lettres[Math.floor(Math.random() * lettres.length)];
  for (let i = 0; i < 3; i++) mdp += chiffres[Math.floor(Math.random() * chiffres.length)];
  return mdp;
}

async function creerMembrePersonnel(req, res) {
  try {
    const { nom, prenom, email, telephone, role, hopitalId, specialiteId, matriculeOuPoste, fonction, adresse } = req.body;

    if (!nom || !prenom || !role) {
      return res.status(400).json({ message: "Nom, prénom et rôle sont obligatoires." });
    }
    if (!email) {
      return res.status(400).json({ message: "L'email est obligatoire pour un compte professionnel." });
    }
    if (!["medecin", "responsable", "administrateur"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }
    if ((role === "medecin" || role === "responsable") && (!hopitalId || !specialiteId)) {
      return res.status(400).json({ message: "Hôpital et spécialité obligatoires pour ce rôle." });
    }

    const existant = await Utilisateur.findOne({ where: { email } });
    if (existant) {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email." });
    }

    const motDePasse = genererMotDePasse();
    const motDePasseHache = await bcrypt.hash(motDePasse, 10);

    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      telephone: telephone || null,
      motDePasse: motDePasseHache,
      role,
    });

    if (role === "medecin") {
      await Medecin.create({ utilisateurId: utilisateur.id, hopitalId, specialiteId, matricule: matriculeOuPoste || null, fonction: fonction || "Médecin" });
    } else if (role === "responsable") {
      await ResponsableService.create({ utilisateurId: utilisateur.id, hopitalId, specialiteId, matricule: matriculeOuPoste || null });
    } else if (role === "administrateur") {
      await Administrateur.create({ utilisateurId: utilisateur.id, adresse: adresse || null });
    }

    res.status(201).json({
      message: "Compte créé avec succès.",
      utilisateur: { id: utilisateur.id, nom, prenom, email, telephone, role },
      motDePasseTemporaire: motDePasse,
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la création du compte." });
  }
}

async function listerPersonnel(req, res) {
  try {
    const medecins = await Utilisateur.findAll({
      where: { role: "medecin" },
      include: [{ model: Medecin, include: [Hopital, Specialite] }],
    });
    const responsables = await Utilisateur.findAll({
      where: { role: "responsable" },
      include: [{ model: ResponsableService, include: [Hopital, Specialite] }],
    });
    const administrateurs = await Utilisateur.findAll({
      where: { role: "administrateur" },
      include: [Administrateur],
    });

    res.status(200).json({ medecins, responsables, administrateurs });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function supprimerMembrePersonnel(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({ message: "Compte introuvable." });
    }
    if (utilisateur.id === req.utilisateurId) {
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
    }
    await utilisateur.destroy();
    res.status(200).json({ message: "Compte supprimé avec succès." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la suppression." });
  }
}

module.exports = { creerMembrePersonnel, listerPersonnel, supprimerMembrePersonnel };