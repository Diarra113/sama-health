const express = require("express");
const router = express.Router();
const verifierToken = require("../intergiciels/authMiddleware");
const verifierRoleAdmin = require("../intergiciels/verifierRoleAdmin");
const verifierRoleResponsableOuAdmin = require("../intergiciels/verifierRoleResponsableOuAdmin");
const upload = require("../intergiciels/uploadPhoto");
const { listerHopitaux, obtenirHopitalParId, creerHopital, modifierHopital, supprimerHopital, televerserPhoto } = require("../controleurs/hopitalControleur");
const { ajouterSpecialite, modifierSpecialite, retirerSpecialite } = require("../controleurs/hopitalSpecialiteControleur");

router.get("/", listerHopitaux);
router.get("/:id", obtenirHopitalParId);
router.post("/", verifierToken, verifierRoleAdmin, creerHopital);
router.put("/:id", verifierToken, verifierRoleAdmin, modifierHopital);
router.delete("/:id", verifierToken, verifierRoleAdmin, supprimerHopital);
router.post("/:id/photo", verifierToken, verifierRoleAdmin, upload.single("photo"), televerserPhoto);
router.post("/:id/specialites", verifierToken, verifierRoleAdmin, ajouterSpecialite);
router.put("/:id/specialites/:specialiteId", verifierToken, verifierRoleResponsableOuAdmin, modifierSpecialite);
router.delete("/:id/specialites/:specialiteId", verifierToken, verifierRoleAdmin, retirerSpecialite);

module.exports = router;