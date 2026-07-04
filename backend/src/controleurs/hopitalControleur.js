const Hopital = require("../modeles/Hopital");
const Specialite = require("../modeles/Specialite");

function formaterSpecialites(hopital) {
  return hopital.Specialites.map((s) => ({
    id: s.id,
    nom: s.nom,
    quotaJournalier: s.HopitalSpecialite?.quotaJournalier || null,
    quotaTickets: s.HopitalSpecialite?.quotaTickets || null,
    heureDebut: s.HopitalSpecialite?.heureDebut || null,
    heureFin: s.HopitalSpecialite?.heureFin || null,
    tarifConsultation: s.HopitalSpecialite?.tarifConsultation || null,
    dureeValiditeJours: s.HopitalSpecialite?.dureeValiditeJours || null,
    joursOuverture: s.HopitalSpecialite?.joursOuverture || [1, 2, 3, 4, 5],
  }));
}

async function listerHopitaux(req, res) {
  try {
    const hopitaux = await Hopital.findAll({ include: Specialite });

    const resultat = hopitaux.map((h) => ({
      id: h.id,
      nom: h.nom,
      adresse: h.adresse,
      telephone: h.numFixe,
      urgences24h: h.urgences24h,
      photo: h.photo,
      siteWeb: h.siteWeb,
      presentation: h.presentation,
      specialites: h.Specialites.map((s) => s.nom),
      specialitesAvecId: formaterSpecialites(h),
    }));

    res.status(200).json(resultat);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function obtenirHopitalParId(req, res) {
  try {
    const hopital = await Hopital.findByPk(req.params.id, { include: Specialite });
    if (!hopital) return res.status(404).json({ message: "Hôpital introuvable." });

    const Medecin = require("../modeles/Medecin");
    const Utilisateur = require("../modeles/Utilisateur");

    const specialitesAvecMedecins = await Promise.all(
      hopital.Specialites.map(async (s) => {
        const medecins = await Medecin.findAll({
          where: { hopitalId: hopital.id, specialiteId: s.id },
          include: [Utilisateur],
        });

        return {
          id: s.id,
          nom: s.nom,
          quotaJournalier: s.HopitalSpecialite?.quotaJournalier || null,
          quotaTickets: s.HopitalSpecialite?.quotaTickets || null,
          heureDebut: s.HopitalSpecialite?.heureDebut || null,
          heureFin: s.HopitalSpecialite?.heureFin || null,
          tarifConsultation: s.HopitalSpecialite?.tarifConsultation || null,
          dureeValiditeJours: s.HopitalSpecialite?.dureeValiditeJours || null,
          joursOuverture: s.HopitalSpecialite?.joursOuverture || [1, 2, 3, 4, 5],
          medecins: medecins.map((m) => ({
            id: m.id,
            nom: m.Utilisateur?.nom || "",
            prenom: m.Utilisateur?.prenom || "",
            fonction: m.fonction || "Médecin",
          })),
        };
      })
    );

    res.status(200).json({
      id: hopital.id,
      nom: hopital.nom,
      adresse: hopital.adresse,
      telephone: hopital.numFixe,
      urgences24h: hopital.urgences24h,
      photo: hopital.photo,
      siteWeb: hopital.siteWeb,
      presentation: hopital.presentation,
      specialites: hopital.Specialites.map((s) => s.nom),
      specialitesAvecId: specialitesAvecMedecins,
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function creerHopital(req, res) {
  try {
    const { nom, adresse, telephone, siteWeb, presentation, urgences24h } = req.body;

    if (!nom || !adresse) {
      return res.status(400).json({ message: "Le nom et l'adresse sont obligatoires." });
    }

    const hopital = await Hopital.create({
      nom,
      adresse,
      numFixe: telephone || null,
      siteWeb: siteWeb || null,
      presentation: presentation || null,
      urgences24h: urgences24h || false,
    });

    res.status(201).json({ message: "Hôpital créé avec succès.", hopital });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la création de l'hôpital." });
  }
}

async function modifierHopital(req, res) {
  try {
    const hopital = await Hopital.findByPk(req.params.id);
    if (!hopital) {
      return res.status(404).json({ message: "Hôpital introuvable." });
    }

    const { nom, adresse, telephone, siteWeb, presentation, urgences24h } = req.body;

    await hopital.update({
      nom: nom ?? hopital.nom,
      adresse: adresse ?? hopital.adresse,
      numFixe: telephone ?? hopital.numFixe,
      siteWeb: siteWeb ?? hopital.siteWeb,
      presentation: presentation ?? hopital.presentation,
      urgences24h: urgences24h ?? hopital.urgences24h,
    });

    res.status(200).json({ message: "Hôpital mis à jour avec succès.", hopital });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la modification." });
  }
}

async function supprimerHopital(req, res) {
  try {
    const hopital = await Hopital.findByPk(req.params.id);
    if (!hopital) {
      return res.status(404).json({ message: "Hôpital introuvable." });
    }
    await hopital.destroy();
    res.status(200).json({ message: "Hôpital supprimé avec succès." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la suppression." });
  }
}

async function televerserPhoto(req, res) {
  try {
    const hopital = await Hopital.findByPk(req.params.id);
    if (!hopital) return res.status(404).json({ message: "Hôpital introuvable." });
    if (!req.file) return res.status(400).json({ message: "Aucun fichier reçu." });

    await hopital.update({ photo: `http://localhost:5000/uploads/hopitaux/${req.file.filename}` });
    res.status(200).json({ message: "Photo mise à jour.", photo: hopital.photo });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = { listerHopitaux, obtenirHopitalParId, creerHopital, modifierHopital, supprimerHopital, televerserPhoto };