const express = require("express");
const router = express.Router();
const verifierToken = require("../intergiciels/authMiddleware");
const {
  creerRendezVous, mesRendezVous, telechargerRecuRendezVous,
  obtenirDisponibilites, obtenirJoursSatures, payerRendezVous,
} = require("../controleurs/rendezVousControleur");

router.get("/disponibilites", verifierToken, obtenirDisponibilites);
router.get("/jours-satures", verifierToken, obtenirJoursSatures);
router.post("/", verifierToken, creerRendezVous);
router.get("/", verifierToken, mesRendezVous);
router.get("/:id/recu", verifierToken, telechargerRecuRendezVous);
router.post("/:id/payer", verifierToken, payerRendezVous);

module.exports = router;