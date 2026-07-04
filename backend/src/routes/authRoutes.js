const express = require("express");
const router = express.Router();
const { inscriptionPatient, verifierCode, connexion } = require("../controleurs/authControleur");

router.post("/inscription", inscriptionPatient);
router.post("/verifier-code", verifierCode);
router.post("/connexion", connexion);

module.exports = router;