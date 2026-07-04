const express = require("express");
const router = express.Router();
const verifierToken = require("../intergiciels/authMiddleware");
const verifierRoleAdmin = require("../intergiciels/verifierRoleAdmin");
const { creerMembrePersonnel, listerPersonnel, supprimerMembrePersonnel } = require("../controleurs/adminControleur");

router.post("/personnel", verifierToken, verifierRoleAdmin, creerMembrePersonnel);
router.get("/personnel", verifierToken, verifierRoleAdmin, listerPersonnel);
router.delete("/personnel/:id", verifierToken, verifierRoleAdmin, supprimerMembrePersonnel);

module.exports = router;