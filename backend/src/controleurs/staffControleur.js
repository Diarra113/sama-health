const Utilisateur = require("../modeles/Utilisateur");
const Medecin = require("../modeles/Medecin");
const ResponsableService = require("../modeles/ResponsableService");
const Hopital = require("../modeles/Hopital");
const Specialite = require("../modeles/Specialite");
const RendezVous = require("../modeles/RendezVous");
const Ticket = require("../modeles/Ticket");
const PresenceJour = require("../modeles/PresenceJour");
const Planning = require("../modeles/Planning");

async function obtenirMonAffectation(req, res) {
  try {
    const role = req.role;
    let affectation = null;

    if (role === "medecin") {
      affectation = await Medecin.findOne({ where: { utilisateurId: req.utilisateurId }, include: [Hopital, Specialite] });
    } else if (role === "responsable") {
      affectation = await ResponsableService.findOne({ where: { utilisateurId: req.utilisateurId }, include: [Hopital, Specialite] });
    }

    res.status(200).json({
      hopitalId: affectation?.hopitalId || null,
      hopital: affectation?.Hopital?.nom || null,
      specialiteId: affectation?.specialiteId || null,
      specialite: affectation?.Specialite?.nom || null,
      fonction: affectation?.fonction || null,
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function statistiquesService(req, res) {
  try {
    const responsable = await ResponsableService.findOne({ where: { utilisateurId: req.utilisateurId } });
    if (!responsable) return res.status(404).json({ message: "Affectation introuvable." });

    const { hopitalId, specialiteId } = responsable;
    const tous = await RendezVous.findAll({ where: { hopitalId, specialiteId } });

    res.status(200).json({
      total: tous.length,
      confirmes: tous.filter((r) => r.statut === "confirme").length,
      enAttente: tous.filter((r) => r.statut === "en_attente").length,
      rejetes: tous.filter((r) => r.statut === "rejete").length,
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function rendezVousDuService(req, res) {
  try {
    const responsable = await ResponsableService.findOne({ where: { utilisateurId: req.utilisateurId } });
    if (!responsable) return res.status(404).json({ message: "Affectation introuvable." });

    const rdvs = await RendezVous.findAll({
      where: { hopitalId: responsable.hopitalId, specialiteId: responsable.specialiteId },
      order: [["dateRDV", "DESC"]],
    });

    const Patient = require("../modeles/Patient");
    const Paiement = require("../modeles/Paiement");

    const resultat = await Promise.all(rdvs.map(async (r) => {
      const patient = await Patient.findByPk(r.patientId);
      const utilisateur = patient ? await Utilisateur.findByPk(patient.utilisateurId) : null;
      const paiement = await Paiement.findOne({ where: { rendezVousId: r.id } });
      return {
        id: r.id,
        dateRDV: r.dateRDV,
        heureRDV: r.heureRDV,
        statut: r.statut,
        motifRejet: r.motifRejet,
        nomPatient: utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "Patient inconnu",
        paye: !!paiement,
      };
    }));

    res.status(200).json(resultat);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function traiterRendezVous(req, res) {
  try {
    const { statut, motifRejet } = req.body;
    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable." });
    await rdv.update({ statut, motifRejet: statut === "rejete" ? motifRejet : null });
    res.status(200).json({ message: "Rendez-vous mis à jour." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function fileDuJour(req, res) {
  try {
    const responsable = await ResponsableService.findOne({ where: { utilisateurId: req.utilisateurId } });
    if (!responsable) return res.status(404).json({ message: "Affectation introuvable." });

    const Patient = require("../modeles/Patient");
    const aujourdHui = new Date().toISOString().split("T")[0];

    const getNomPatient = async (patientId) => {
      const patient = await Patient.findByPk(patientId);
      const utilisateur = patient ? await Utilisateur.findByPk(patient.utilisateurId) : null;
      return utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "Inconnu";
    };

    const rdv = await RendezVous.findAll({
      where: {
        hopitalId: responsable.hopitalId,
        specialiteId: responsable.specialiteId,
        dateRDV: aujourdHui,
        statut: ["confirme", "termine"],
      },
      order: [["heureRDV", "ASC"]],
    });

    const tickets = await Ticket.findAll({
      where: {
        hopitalId: responsable.hopitalId,
        specialiteId: responsable.specialiteId,
        date: aujourdHui,
      },
      order: [["position", "ASC"]],
    });

    res.status(200).json({
      rendezVous: await Promise.all(rdv.map(async (r) => ({
        id: r.id,
        heure: r.heureRDV,
        statut: r.statut,
        patient: await getNomPatient(r.patientId),
      }))),
      tickets: await Promise.all(tickets.map(async (t) => ({
        id: t.id,
        position: t.position,
        numero: t.numero,
        statut: t.statut,
        patient: await getNomPatient(t.patientId),
      }))),
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function ticketsDuService(req, res) {
  try {
    const responsable = await ResponsableService.findOne({ where: { utilisateurId: req.utilisateurId } });
    if (!responsable) return res.status(404).json({ message: "Affectation introuvable." });

    const Patient = require("../modeles/Patient");
    const HopitalSpecialite = require("../modeles/HopitalSpecialite");

    const lien = await HopitalSpecialite.findOne({
      where: { HopitalId: responsable.hopitalId, SpecialiteId: responsable.specialiteId },
    });

    const tickets = await Ticket.findAll({
      where: { hopitalId: responsable.hopitalId, specialiteId: responsable.specialiteId },
      include: [Hopital, Specialite],
      order: [["date", "DESC"]],
    });

    const resultat = await Promise.all(tickets.map(async (t) => {
      const patient = await Patient.findByPk(t.patientId);
      const utilisateur = patient ? await Utilisateur.findByPk(patient.utilisateurId) : null;
      return {
        id: t.id,
        date: t.date,
        numero: t.numero,
        statut: t.statut,
        position: t.position,
        nomPatient: utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "Patient inconnu",
        hopital: t.Hopital?.nom,
        specialite: t.Specialite?.nom,
        heureFin: lien?.heureFin?.slice(0, 5) || null,
      };
    }));

    res.status(200).json(resultat);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function medecinsDuService(req, res) {
  try {
    const responsable = await ResponsableService.findOne({ where: { utilisateurId: req.utilisateurId } });
    if (!responsable) return res.status(404).json({ message: "Affectation introuvable." });

    const aujourdHui = new Date().toISOString().split("T")[0];

    const utilisateurs = await Utilisateur.findAll({
      where: { role: "medecin" },
      include: [{ model: Medecin, where: { hopitalId: responsable.hopitalId, specialiteId: responsable.specialiteId }, include: [PresenceJour] }],
    });

    const resultat = utilisateurs.map((u) => {
      const presenceAuj = u.Medecin.PresenceJours?.find((p) => p.date === aujourdHui);
      const absencesAvenir = u.Medecin.PresenceJours?.filter((p) => p.date > aujourdHui && !p.present) || [];
      return {
        id: u.id,
        nom: u.nom,
        prenom: u.prenom,
        fonction: u.Medecin.fonction,
        medecinId: u.Medecin.id,
        present: presenceAuj ? presenceAuj.present : true,
        absencesAvenir: absencesAvenir.map((a) => a.date),
      };
    });

    res.status(200).json(resultat);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function basculerPresence(req, res) {
  try {
    const medecinId = req.params.medecinId;
    const aujourdHui = new Date().toISOString().split("T")[0];

    let presence = await PresenceJour.findOne({ where: { medecinId, date: aujourdHui } });
    if (presence) {
      await presence.update({ present: !presence.present });
    } else {
      presence = await PresenceJour.create({ medecinId, date: aujourdHui, present: true });
    }
    res.status(200).json({ present: presence.present });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function planningsDuService(req, res) {
  try {
    const responsable = await ResponsableService.findOne({ where: { utilisateurId: req.utilisateurId } });
    if (!responsable) return res.status(404).json({ message: "Affectation introuvable." });

    const medecins = await Medecin.findAll({ where: { hopitalId: responsable.hopitalId, specialiteId: responsable.specialiteId } });
    const idsMedecins = medecins.map((m) => m.id);

    const plannings = await Planning.findAll({
      where: { medecinId: idsMedecins },
      include: [{ model: Medecin, include: [Utilisateur] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(plannings);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function traiterPlanning(req, res) {
  try {
    const { statut, motifRejet } = req.body;
    const planning = await Planning.findByPk(req.params.id);
    if (!planning) return res.status(404).json({ message: "Planning introuvable." });
    await planning.update({ statut, motifRejet: statut === "rejete" ? motifRejet : null });
    res.status(200).json({ message: "Planning mis à jour." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = {
  obtenirMonAffectation, statistiquesService, rendezVousDuService, traiterRendezVous,
  fileDuJour, ticketsDuService, medecinsDuService, basculerPresence,
  planningsDuService, traiterPlanning,
};