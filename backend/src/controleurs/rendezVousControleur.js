const crypto = require("crypto");
const { Op, fn, col } = require("sequelize");
const RendezVous = require("../modeles/RendezVous");
const Ticket = require("../modeles/Ticket");
const Hopital = require("../modeles/Hopital");
const Specialite = require("../modeles/Specialite");
const HopitalSpecialite = require("../modeles/HopitalSpecialite");
const Paiement = require("../modeles/Paiement");
const Utilisateur = require("../modeles/Utilisateur");
const Patient = require("../modeles/Patient");
const { genererRecuRendezVous } = require("../services/pdfService");

async function trouverPatient(utilisateurId) {
  return await Patient.findOne({ where: { utilisateurId } });
}

async function creerRendezVous(req, res) {
  try {
    const { hopitalId, specialiteId, dateRDV, heureRDV } = req.body;

    if (!hopitalId || !specialiteId || !dateRDV || !heureRDV) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const patient = await trouverPatient(req.utilisateurId);
    if (!patient) return res.status(404).json({ message: "Profil patient introuvable." });

    const lien = await HopitalSpecialite.findOne({
      where: { HopitalId: hopitalId, SpecialiteId: specialiteId },
    });
    if (!lien) return res.status(404).json({ message: "Cette spécialité n'est pas proposée dans cet hôpital." });

    // Bloquer les créneaux passés si c'est aujourd'hui
    const aujourdHui = new Date().toISOString().split("T")[0];
    if (dateRDV === aujourdHui) {
      const maintenant = new Date();
      const [hRDV, mRDV] = heureRDV.split(":").map(Number);
      const heureRdvDate = new Date();
      heureRdvDate.setHours(hRDV, mRDV, 0, 0);
      if (heureRdvDate <= maintenant) {
        return res.status(400).json({ message: "Ce créneau est déjà passé. Veuillez choisir un créneau futur." });
      }
    }

    // Bloquer si ticket actif ce jour pour même spécialité
    const ticketExistant = await Ticket.findOne({
      where: { patientId: patient.id, hopitalId, specialiteId, date: dateRDV, statut: ["en_attente", "valide"] },
    });
    if (ticketExistant) {
      return res.status(409).json({ message: "Vous avez déjà un ticket actif pour cette spécialité à cette date." });
    }

    // Anti-doublon même patient même jour même spécialité (tous statuts)
    const rdvExistantAujourdHui = await RendezVous.findOne({
      where: { patientId: patient.id, hopitalId, specialiteId, dateRDV },
    });
    if (rdvExistantAujourdHui) {
      return res.status(409).json({ message: "Vous avez déjà un rendez-vous pour cette spécialité à cette date." });
    }

    // Quota rendez-vous (inclut terminés pour ne pas libérer les places)
    const nombreRdvPris = await RendezVous.count({
      where: { hopitalId, specialiteId, dateRDV, statut: ["en_attente", "confirme", "termine"] },
    });
    if (lien.quotaJournalier && nombreRdvPris >= lien.quotaJournalier) {
      return res.status(409).json({ message: "Le quota de rendez-vous pour cette date est atteint. Veuillez choisir une autre date." });
    }

    // Horaires
    if (lien.heureDebut && lien.heureFin) {
      const debut = lien.heureDebut.slice(0, 5);
      const fin = lien.heureFin.slice(0, 5);
      if (heureRDV < debut || heureRDV >= fin) {
        return res.status(400).json({ message: `Cet hôpital reçoit entre ${debut} et ${fin} pour cette spécialité.` });
      }
    }

    // Créneau déjà pris par un autre patient (tous statuts pour ne pas libérer)
    const creneauPris = await RendezVous.findOne({
      where: { hopitalId, specialiteId, dateRDV, heureRDV, statut: ["en_attente", "confirme", "termine"] },
    });
    if (creneauPris) {
      return res.status(409).json({ message: "Ce créneau est déjà réservé. Veuillez choisir un autre horaire." });
    }

    const rendezVous = await RendezVous.create({
      patientId: patient.id,
      hopitalId,
      specialiteId,
      dateRDV,
      heureRDV,
      statut: "en_attente",
    });

    res.status(201).json({
      message: "Demande de rendez-vous envoyée. En attente de validation par le responsable de service.",
      rendezVous,
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la création du rendez-vous." });
  }
}

async function mesRendezVous(req, res) {
  try {
    const patient = await trouverPatient(req.utilisateurId);
    if (!patient) return res.status(200).json([]);

    const rendezVous = await RendezVous.findAll({
      where: { patientId: patient.id },
      include: [Hopital, Specialite],
      order: [["dateRDV", "DESC"]],
    });

    const resultat = await Promise.all(rendezVous.map(async (r) => {
      const paiement = await Paiement.findOne({ where: { rendezVousId: r.id } });
      const lien = await HopitalSpecialite.findOne({
        where: { HopitalId: r.hopitalId, SpecialiteId: r.specialiteId },
      });
      return {
        id: r.id,
        dateRDV: r.dateRDV,
        heureRDV: r.heureRDV,
        statut: r.statut,
        motifRejet: r.motifRejet,
        Hopital: r.Hopital,
        Specialite: r.Specialite,
        tarif: lien?.tarifConsultation || 0,
        paye: !!paiement,
      };
    }));

    res.status(200).json(resultat);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function telechargerRecuRendezVous(req, res) {
  try {
    const patient = await trouverPatient(req.utilisateurId);
    if (!patient) return res.status(404).json({ message: "Profil patient introuvable." });

    const rendezVous = await RendezVous.findByPk(req.params.id, { include: [Hopital, Specialite] });
    if (!rendezVous || rendezVous.patientId !== patient.id) {
      return res.status(404).json({ message: "Rendez-vous introuvable." });
    }

    const paiement = await Paiement.findOne({ where: { rendezVousId: rendezVous.id } });
    if (!paiement) return res.status(404).json({ message: "Aucun paiement trouvé." });

    const utilisateur = await Utilisateur.findByPk(req.utilisateurId);
    genererRecuRendezVous(res, {
      rendezVous,
      hopital: rendezVous.Hopital,
      specialite: rendezVous.Specialite,
      paiement,
      patient: utilisateur,
    });
  } catch (erreur) {
    console.error(erreur);
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur." });
  }
}

async function payerRendezVous(req, res) {
  try {
    const patient = await trouverPatient(req.utilisateurId);
    if (!patient) return res.status(404).json({ message: "Profil patient introuvable." });

    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv || rdv.patientId !== patient.id) {
      return res.status(404).json({ message: "Rendez-vous introuvable." });
    }
    if (rdv.statut !== "confirme") {
      return res.status(400).json({ message: "Ce rendez-vous n'est pas encore confirmé par le responsable." });
    }

    const paiementExistant = await Paiement.findOne({ where: { rendezVousId: rdv.id } });
    if (paiementExistant) {
      return res.status(409).json({ message: "Ce rendez-vous a déjà été payé." });
    }

    const lien = await HopitalSpecialite.findOne({
      where: { HopitalId: rdv.hopitalId, SpecialiteId: rdv.specialiteId },
    });

    const paiement = await Paiement.create({
      montant: lien?.tarifConsultation || 0,
      modePaiement: req.body.modePaiement || "wave",
      refTransaction: `SIMULE-${crypto.randomBytes(6).toString("hex")}`,
      statut: "reussi",
      rendezVousId: rdv.id,
    });

    res.status(201).json({ message: "Paiement effectué avec succès.", paiement });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors du paiement." });
  }
}

async function obtenirDisponibilites(req, res) {
  try {
    const { hopitalId, specialiteId, date } = req.query;
    if (!hopitalId || !specialiteId || !date) {
      return res.status(400).json({ message: "hopitalId, specialiteId et date sont obligatoires." });
    }

    const lien = await HopitalSpecialite.findOne({ where: { HopitalId: hopitalId, SpecialiteId: specialiteId } });
    if (!lien) return res.status(404).json({ message: "Spécialité introuvable dans cet hôpital." });

    const jourSemaine = new Date(date + "T00:00:00").getDay();
    const joursOuverture = lien.joursOuverture || [1, 2, 3, 4, 5];

    if (!joursOuverture.includes(jourSemaine)) {
      return res.status(200).json({ ferme: true, creneaux: [], quotaRdvRestant: 0, quotaJournalier: lien.quotaJournalier });
    }

    const heureDebut = lien.heureDebut || "08:00:00";
    const heureFin = lien.heureFin || "17:00:00";
    const dureeMoyenne = lien.dureeMoyenneConsultation || 15;

    const creneauxPossibles = [];
    let [h, m] = heureDebut.split(":").map(Number);
    const [hFin, mFin] = heureFin.split(":").map(Number);

    while (h < hFin || (h === hFin && m < mFin)) {
      const heureActuelle = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const enPause = lien.heurePauseDebut && lien.heurePauseFin &&
        heureActuelle >= lien.heurePauseDebut.slice(0, 5) &&
        heureActuelle < lien.heurePauseFin.slice(0, 5);
      if (!enPause) creneauxPossibles.push(heureActuelle);
      m += dureeMoyenne;
      if (m >= 60) { m -= 60; h += 1; }
    }

    // Inclure tous statuts pour ne pas libérer les créneaux
    const rdvExistants = await RendezVous.findAll({
      where: {
        hopitalId, specialiteId, dateRDV: date,
        statut: ["en_attente", "confirme", "termine"],
      },
      attributes: ["heureRDV"],
    });
    const heuresReservees = rdvExistants.map((r) => r.heureRDV.slice(0, 5));

    const quotaRdvAtteint = lien.quotaJournalier ? rdvExistants.length >= lien.quotaJournalier : false;
    const quotaRdvRestant = lien.quotaJournalier ? Math.max(0, lien.quotaJournalier - rdvExistants.length) : null;

    const creneaux = creneauxPossibles.map((heure) => ({
      heure,
      disponible: !heuresReservees.includes(heure) && !quotaRdvAtteint,
    }));

    res.status(200).json({
      ferme: false,
      creneaux,
      quotaRdvRestant,
      quotaJournalier: lien.quotaJournalier,
      quotaRdvAtteint,
      dureeMoyenneConsultation: dureeMoyenne,
      heurePauseDebut: lien.heurePauseDebut?.slice(0, 5) || null,
      heurePauseFin: lien.heurePauseFin?.slice(0, 5) || null,
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function obtenirJoursSatures(req, res) {
  try {
    const { hopitalId, specialiteId, annee, mois } = req.query;
    const lien = await HopitalSpecialite.findOne({ where: { HopitalId: hopitalId, SpecialiteId: specialiteId } });
    if (!lien || lien.quotaJournalier === null || lien.quotaJournalier === undefined) {
      return res.status(200).json({ joursSatures: [] });
    }

    const debut = `${annee}-${String(mois).padStart(2, "0")}-01`;
    const fin = `${annee}-${String(mois).padStart(2, "0")}-31`;

    const comptes = await RendezVous.findAll({
      where: {
        hopitalId, specialiteId,
        dateRDV: { [Op.between]: [debut, fin] },
        statut: ["en_attente", "confirme", "termine"],
      },
      attributes: ["dateRDV", [fn("COUNT", col("id")), "total"]],
      group: ["dateRDV"],
    });

    const joursSatures = comptes
      .filter((c) => parseInt(c.dataValues.total) >= lien.quotaJournalier)
      .map((c) => c.dateRDV);

    res.status(200).json({ joursSatures });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = {
  creerRendezVous, mesRendezVous, telechargerRecuRendezVous,
  payerRendezVous, obtenirDisponibilites, obtenirJoursSatures,
};