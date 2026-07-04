const Medecin = require("../modeles/Medecin");
const Utilisateur = require("../modeles/Utilisateur");
const RendezVous = require("../modeles/RendezVous");
const Ticket = require("../modeles/Ticket");
const Planning = require("../modeles/Planning");
const PresenceJour = require("../modeles/PresenceJour");
const Patient = require("../modeles/Patient");

async function trouverMedecin(req) {
  return await Medecin.findOne({ where: { utilisateurId: req.utilisateurId } });
}

async function getInfosPatient(patientId) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) return { nomComplet: "Inconnu" };
  const utilisateur = await Utilisateur.findByPk(patient.utilisateurId);
  return {
    nomComplet: utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "Inconnu",
    dateNaissance: patient.dateNaissance || null,
    sexe: patient.sexe || null,
    adresse: patient.adresse || null,
    telephone: utilisateur?.telephone || null,
    email: utilisateur?.email || null,
  };
}

async function fileDuJourMedecin(req, res) {
  try {
    const medecin = await trouverMedecin(req);
    if (!medecin) return res.status(404).json({ message: "Affectation introuvable." });

    const aujourdHui = new Date().toISOString().split("T")[0];

    const presenceAujourdHui = await PresenceJour.findOne({
      where: { medecinId: medecin.id, date: aujourdHui },
    });
    if (presenceAujourdHui && !presenceAujourdHui.present) {
      return res.status(200).json({ absent: true, rendezVous: [], tickets: [] });
    }

    const rdv = await RendezVous.findAll({
      where: {
        hopitalId: medecin.hopitalId,
        specialiteId: medecin.specialiteId,
        dateRDV: aujourdHui,
        statut: ["confirme", "termine"],
      },
      order: [["heureRDV", "ASC"]],
    });

    const tickets = await Ticket.findAll({
      where: {
        hopitalId: medecin.hopitalId,
        specialiteId: medecin.specialiteId,
        date: aujourdHui,
      },
      order: [["position", "ASC"]],
    });

    const maintenant = new Date();

    res.status(200).json({
      absent: false,
      rendezVous: await Promise.all(rdv.map(async (r) => {
  const heureRdv = new Date(`${r.dateRDV}T${r.heureRDV}`);
  const infos = await getInfosPatient(r.patientId);
  return {
    id: r.id,
    heure: r.heureRDV,
    statut: r.statut,
    heureDepassee: heureRdv < maintenant && r.statut !== "termine",
    patient: infos.nomComplet,
    infosPatient: infos,
  };
})),
tickets: await Promise.all(tickets.map(async (t) => {
  const infos = await getInfosPatient(t.patientId);
  return {
    id: t.id,
    position: t.position,
    numero: t.numero,
    statut: t.statut,
    patient: infos.nomComplet,
    infosPatient: infos,
  };
})),
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function marquerRdvVu(req, res) {
  try {
    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable." });

    const maintenant = new Date();
    const heureRdv = new Date(`${rdv.dateRDV}T${rdv.heureRDV}`);
    if (heureRdv > maintenant) {
      return res.status(400).json({
        message: "Impossible de marquer ce patient comme vu avant l'heure de son rendez-vous.",
      });
    }

    await rdv.update({ statut: "termine" });
    res.status(200).json({ message: "Patient marqué comme vu." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function marquerTicketVu(req, res) {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable." });
    await ticket.update({ statut: "termine" });
    res.status(200).json({ message: "Patient marqué comme vu." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function soumettrePlanning(req, res) {
  try {
    const medecin = await trouverMedecin(req);
    if (!medecin) return res.status(404).json({ message: "Affectation introuvable." });

    const { dateDebut, dateFin, commentaire } = req.body;
    if (!dateDebut || !dateFin) {
      return res.status(400).json({ message: "Les dates de début et de fin sont obligatoires." });
    }

    const planning = await Planning.create({
      medecinId: medecin.id,
      dateDebut,
      dateFin,
      commentaire,
      statut: "en_attente",
    });

    res.status(201).json({ message: "Planning soumis avec succès.", planning });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function mesPlannings(req, res) {
  try {
    const medecin = await trouverMedecin(req);
    if (!medecin) return res.status(404).json({ message: "Affectation introuvable." });

    const plannings = await Planning.findAll({
      where: { medecinId: medecin.id },
      order: [["dateDebut", "DESC"]],
    });
    res.status(200).json(plannings);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function maPresenceAujourdhui(req, res) {
  try {
    const medecin = await trouverMedecin(req);
    if (!medecin) return res.status(404).json({ message: "Affectation introuvable." });

    const aujourdHui = new Date().toISOString().split("T")[0];
    const presence = await PresenceJour.findOne({ where: { medecinId: medecin.id, date: aujourdHui } });
    res.status(200).json({ present: presence ? presence.present : true });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function mesAbsences(req, res) {
  try {
    const medecin = await trouverMedecin(req);
    if (!medecin) return res.status(404).json({ message: "Affectation introuvable." });

    const { Op } = require("sequelize");
    const aujourdHui = new Date().toISOString().split("T")[0];
    const absences = await PresenceJour.findAll({
      where: { medecinId: medecin.id, present: false, date: { [Op.gte]: aujourdHui } },
      order: [["date", "ASC"]],
    });
    res.status(200).json(absences);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function signalerAbsence(req, res) {
  try {
    const medecin = await trouverMedecin(req);
    if (!medecin) return res.status(404).json({ message: "Affectation introuvable." });

    const { date } = req.body;
    if (!date) return res.status(400).json({ message: "La date est obligatoire." });

    let presence = await PresenceJour.findOne({ where: { medecinId: medecin.id, date } });
    if (presence) {
      await presence.update({ present: false });
    } else {
      presence = await PresenceJour.create({ medecinId: medecin.id, date, present: false });
    }
    res.status(200).json({ message: "Absence signalée.", presence });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function annulerAbsence(req, res) {
  try {
    const presence = await PresenceJour.findByPk(req.params.id);
    if (!presence) return res.status(404).json({ message: "Introuvable." });
    await presence.update({ present: true });
    res.status(200).json({ message: "Absence annulée." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = {
  fileDuJourMedecin, marquerRdvVu, marquerTicketVu,
  soumettrePlanning, mesPlannings,
  maPresenceAujourdhui, mesAbsences, signalerAbsence, annulerAbsence,
};