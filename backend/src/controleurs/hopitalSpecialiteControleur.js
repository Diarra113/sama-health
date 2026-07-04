const Hopital = require("../modeles/Hopital");
const Specialite = require("../modeles/Specialite");
const HopitalSpecialite = require("../modeles/HopitalSpecialite");

async function ajouterSpecialite(req, res) {
  try {
    const hopital = await Hopital.findByPk(req.params.id);
    if (!hopital) return res.status(404).json({ message: "Hôpital introuvable." });

    const { specialiteId, nomNouvelleSpecialite, quotaJournalier, quotaTickets, heureDebut, heureFin, tarifConsultation, dureeValiditeJours } = req.body;

    let specialite;
    if (specialiteId) {
      specialite = await Specialite.findByPk(specialiteId);
      if (!specialite) return res.status(404).json({ message: "Spécialité introuvable." });
    } else if (nomNouvelleSpecialite) {
      specialite = await Specialite.create({ nom: nomNouvelleSpecialite });
    } else {
      return res.status(400).json({ message: "Choisissez une spécialité existante ou indiquez un nouveau nom." });
    }

    const dejaLiee = await HopitalSpecialite.findOne({ where: { HopitalId: hopital.id, SpecialiteId: specialite.id } });
    if (dejaLiee) return res.status(409).json({ message: "Cette spécialité est déjà proposée par cet hôpital." });

    await hopital.addSpecialite(specialite, {
      through: { quotaJournalier, quotaTickets, heureDebut, heureFin, tarifConsultation, dureeValiditeJours },
    });

    res.status(201).json({ message: "Spécialité ajoutée avec succès.", specialite });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function modifierSpecialite(req, res) {
  try {
    const lien = await HopitalSpecialite.findOne({
      where: { HopitalId: req.params.id, SpecialiteId: req.params.specialiteId },
    });
    if (!lien) return res.status(404).json({ message: "Association introuvable." });

    const {
      quotaJournalier, quotaTickets, heureDebut, heureFin,
      tarifConsultation, dureeValiditeJours, dureeMoyenneConsultation, joursOuverture,
      heurePauseDebut, heurePauseFin,
    } = req.body;

    await lien.update({
      quotaJournalier: quotaJournalier ?? lien.quotaJournalier,
      quotaTickets: quotaTickets ?? lien.quotaTickets,
      heureDebut: heureDebut ?? lien.heureDebut,
      heureFin: heureFin ?? lien.heureFin,
      tarifConsultation: tarifConsultation ?? lien.tarifConsultation,
      dureeValiditeJours: dureeValiditeJours ?? lien.dureeValiditeJours,
      dureeMoyenneConsultation: dureeMoyenneConsultation ?? lien.dureeMoyenneConsultation,
      joursOuverture: joursOuverture ?? lien.joursOuverture,
      heurePauseDebut: heurePauseDebut ?? lien.heurePauseDebut,
      heurePauseFin: heurePauseFin ?? lien.heurePauseFin,
    });

    res.status(200).json({ message: "Mis à jour avec succès." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function retirerSpecialite(req, res) {
  try {
    const hopital = await Hopital.findByPk(req.params.id);
    if (!hopital) return res.status(404).json({ message: "Hôpital introuvable." });
    const specialite = await Specialite.findByPk(req.params.specialiteId);
    if (!specialite) return res.status(404).json({ message: "Spécialité introuvable." });

    await hopital.removeSpecialite(specialite);
    res.status(200).json({ message: "Spécialité retirée de cet hôpital." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = { ajouterSpecialite, modifierSpecialite, retirerSpecialite };