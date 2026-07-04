const express = require("express");
const router = express.Router();
const { listerToutesSpecialites } = require("../controleurs/specialiteControleur");

router.get("/", listerToutesSpecialites);

module.exports = router;