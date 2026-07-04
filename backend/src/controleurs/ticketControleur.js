const crypto = require("crypto");
const { Op } = require("sequelize");
const Ticket = require("../modeles/Ticket");
const RendezVous = require("../modeles/RendezVous");
const Paiement = require("../modeles/Paiement");
const Hopital = require("../modeles/Hopital");
const Specialite = require("../modeles/Specialite");
const HopitalSpecialite = require("../modeles/HopitalSpecialite");
const Utilisateur = require("../modeles/Utilisateur");
const Patient = require("../modeles/Patient");
const { genererRecuTicket } = require("../services/pdfService");

async function trouverPatient(utilisateurId) {
  return await Patient.findOne({ where: { utilisateurId } });
}

function genererCode(longueur = 8) {
  return crypto.randomBytes(longueur).toString("hex").slice(0, longueur).toUpperCase();
}

async function verifierQuotaTicket(req, res) {
  try {
    const { hopitalId, specialiteId } = req.query;
    const lien = await HopitalSpecialite.findOne({ where: { HopitalId: hopitalId, SpecialiteId: specialiteId } });
    const aujourdHui = new Date().toISOString().split("T")[0];
    const count = await Ticket.count({
      where: { hopitalId, specialiteId, date: aujourdHui, statut: ["en_attente", "valide"] },
    });
    const quotaTickets = lien?.quotaTickets || lien?.quotaJournalier;
    const sature = quotaTickets ? count >= quotaTickets : false;
    res.status(200).json({ sature, count, quota: quotaTickets });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function acheterTicket(req, res) {
  try {
    const { hopitalId, specialiteId, modePaiement } = req.body;
    if (!hopitalId || !specialiteId || !modePaiement) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const patient = await trouverPatient(req.utilisateurId);
    if (!patient) return res.status(404).json({ message: "Profil patient introuvable." });

    const lien = await HopitalSpecialite.findOne({ where: { HopitalId: hopitalId, SpecialiteId: specialiteId } });
    if (!lien) return res.status(404).json({ message: "Cette spécialité n'est pas proposée dans cet hôpital." });

    const aujourdHui = new Date().toISOString().split("T")[0];

    if (lien.heureDebut && lien.heureFin) {
      const maintenant = new Date().toTimeString().slice(0, 8);
      if (maintenant < lien.heureDebut.slice(0, 8) || maintenant >= lien.heureFin.slice(0, 8)) {
        return res.status(400).json({
          message: `Ce service n'accepte les tickets qu'entre ${lien.heureDebut.slice(0, 5)} et ${lien.heureFin.slice(0, 5)}.`,
        });
      }
    }

    // Bloquer si RDV confirmé/en attente ce jour
    const rdvExistant = await RendezVous.findOne({
      where: { patientId: patient.id, hopitalId, specialiteId, dateRDV: aujourdHui, statut: ["en_attente", "confirme"] },
    });
    if (rdvExistant) {
      return res.status(409).json({ message: "Vous avez déjà un rendez-vous pour cette spécialité aujourd'hui. Vous ne pouvez pas acheter un ticket en plus." });
    }

    // Anti-doublon ticket
    const doublon = await Ticket.findOne({
      where: { patientId: patient.id, hopitalId, specialiteId, date: aujourdHui, statut: ["en_attente", "valide"] },
    });
    if (doublon) return res.status(409).json({ message: "Vous avez déjà un ticket actif aujourd'hui pour cette spécialité." });

    // Quota tickets
    const nombreDejaPris = await Ticket.count({
      where: { hopitalId, specialiteId, date: aujourdHui, statut: ["en_attente", "valide"] },
    });
    const quotaTickets = lien.quotaTickets || lien.quotaJournalier;
    if (quotaTickets && nombreDejaPris >= quotaTickets) {
      return res.status(409).json({ message: "Service saturé pour aujourd'hui. Le quota de tickets est atteint." });
    }

    const position = nombreDejaPris + 1;
    const numero = `TKT-${Date.now()}`;
    const codeReservation = genererCode();

    let dateExpiration = null;
    if (lien.dureeValiditeJours) {
      const dateExp = new Date();
      dateExp.setDate(dateExp.getDate() + lien.dureeValiditeJours);
      dateExpiration = dateExp.toISOString().split("T")[0];
    }

    const ticket = await Ticket.create({
      patientId: patient.id,
      hopitalId,
      specialiteId,
      numero,
      codeReservation,
      position,
      date: aujourdHui,
      dateExpiration,
      statut: "en_attente",
    });

    const paiement = await Paiement.create({
      montant: lien.tarifConsultation || 0,
      modePaiement,
      refTransaction: `SIMULE-${crypto.randomBytes(6).toString("hex")}`,
      statut: "reussi",
      ticketId: ticket.id,
    });

    res.status(201).json({ message: "Ticket acheté avec succès.", ticket, paiement });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de l'achat du ticket." });
  }
}

async function mesTickets(req, res) {
  try {
    const patient = await trouverPatient(req.utilisateurId);
    if (!patient) return res.status(200).json([]);

    const tickets = await Ticket.findAll({
      where: { patientId: patient.id },
      include: [Hopital, Specialite],
      order: [["date", "DESC"]],
    });
    res.status(200).json(tickets);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function telechargerRecuTicket(req, res) {
  try {
    const patient = await trouverPatient(req.utilisateurId);
    if (!patient) return res.status(404).json({ message: "Profil patient introuvable." });

    const ticket = await Ticket.findByPk(req.params.id, { include: [Hopital, Specialite] });
    if (!ticket || ticket.patientId !== patient.id) return res.status(404).json({ message: "Ticket introuvable." });

    const paiement = await Paiement.findOne({ where: { ticketId: ticket.id } });
    if (!paiement) return res.status(404).json({ message: "Aucun paiement trouvé." });

    const utilisateur = await Utilisateur.findByPk(req.utilisateurId);
    genererRecuTicket(res, { ticket, hopital: ticket.Hopital, specialite: ticket.Specialite, paiement, patient: utilisateur });
  } catch (erreur) {
    console.error(erreur);
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur." });
  }
}

async function suivrePosition(req, res) {
  try {
    const patient = await trouverPatient(req.utilisateurId);
    if (!patient) return res.status(404).json({ message: "Profil patient introuvable." });

    const ticket = await Ticket.findByPk(req.params.id, { include: [Hopital, Specialite] });
    if (!ticket || ticket.patientId !== patient.id) return res.status(404).json({ message: "Ticket introuvable." });

    if (ticket.statut === "termine") {
      return res.status(200).json({ statut: "termine", message: "Consultation terminée." });
    }

    const positionActuelle = await Ticket.count({
      where: {
        hopitalId: ticket.hopitalId,
        specialiteId: ticket.specialiteId,
        date: ticket.date,
        statut: "en_attente",
        id: { [Op.lte]: ticket.id },
      },
    });

    const lien = await HopitalSpecialite.findOne({
      where: { HopitalId: ticket.hopitalId, SpecialiteId: ticket.specialiteId },
    });

    const dureeMoyenne = lien?.dureeMoyenneConsultation || 15;
    const tempsAttenteEstime = (positionActuelle - 1) * dureeMoyenne;

    res.status(200).json({
      statut: ticket.statut,
      position: positionActuelle,
      tempsAttenteEstimeMinutes: tempsAttenteEstime > 0 ? tempsAttenteEstime : 0,
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = { acheterTicket, mesTickets, telechargerRecuTicket, suivrePosition, verifierQuotaTicket };