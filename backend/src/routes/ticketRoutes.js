const express = require("express");
const router = express.Router();
const verifierToken = require("../intergiciels/authMiddleware");
const { acheterTicket, mesTickets, telechargerRecuTicket, suivrePosition } = require("../controleurs/ticketControleur");

router.post("/", verifierToken, acheterTicket);
router.get("/", verifierToken, mesTickets);
router.get("/:id/recu", verifierToken, telechargerRecuTicket);
router.get("/:id/position", verifierToken, suivrePosition);

module.exports = router;