const express = require("express");
const router = express.Router();
const verifierToken = require("../intergiciels/authMiddleware");
const {
  obtenirMonAffectation, statistiquesService, rendezVousDuService, traiterRendezVous,
  fileDuJour, ticketsDuService, medecinsDuService, basculerPresence,
  planningsDuService, traiterPlanning,
} = require("../controleurs/staffControleur");
const {
  fileDuJourMedecin, marquerRdvVu, marquerTicketVu,
  soumettrePlanning, mesPlannings,
  maPresenceAujourdhui, mesAbsences, signalerAbsence, annulerAbsence,
} = require("../controleurs/medecinControleur");


// Affectation générale
router.get("/mon-affectation", verifierToken, obtenirMonAffectation);

// Responsable de service
router.get("/responsable/statistiques", verifierToken, statistiquesService);
router.get("/responsable/rendez-vous", verifierToken, rendezVousDuService);
router.put("/responsable/rendez-vous/:id", verifierToken, traiterRendezVous);
router.get("/responsable/file-du-jour", verifierToken, fileDuJour);
router.get("/responsable/tickets", verifierToken, ticketsDuService);
router.get("/responsable/medecins", verifierToken, medecinsDuService);
router.put("/responsable/medecins/:medecinId/presence", verifierToken, basculerPresence);
router.get("/responsable/plannings", verifierToken, planningsDuService);
router.put("/responsable/plannings/:id", verifierToken, traiterPlanning);

// Médecin
router.get("/medecin/file-du-jour", verifierToken, fileDuJourMedecin);
router.put("/medecin/rdv/:id/terminer", verifierToken, marquerRdvVu);
router.put("/medecin/ticket/:id/terminer", verifierToken, marquerTicketVu);
router.post("/medecin/planning", verifierToken, soumettrePlanning);
router.get("/medecin/planning", verifierToken, mesPlannings);
router.get("/medecin/ma-presence", verifierToken, maPresenceAujourdhui);
router.get("/medecin/absences", verifierToken, mesAbsences);
router.post("/medecin/absences", verifierToken, signalerAbsence);
router.put("/medecin/absences/:id/annuler", verifierToken, annulerAbsence);


module.exports = router;