const express = require("express");
const router = express.Router();
const verifierToken = require("../intergiciels/authMiddleware");
const { obtenirMonProfil, modifierMonProfil, modifierIdentite } = require("../controleurs/patientControleur");

router.get("/mon-profil", verifierToken, obtenirMonProfil);
router.put("/mon-profil", verifierToken, modifierMonProfil);
router.put("/mon-identite", verifierToken, modifierIdentite);

module.exports = router;