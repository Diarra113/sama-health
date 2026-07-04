const PDFDocument = require("pdfkit");
const path = require("path");

function genererRecuRendezVous(res, { rendezVous, hopital, specialite, paiement, patient }) {
  const doc = new PDFDocument({ size: [380, 400], margin: 35 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=ticket-rdv-${rendezVous.id}.pdf`);
  doc.pipe(res);

  const largeurLogo = 90;
  try {
    doc.image(
      path.join(__dirname, "../../ressources/logo.png"),
      (doc.page.width - largeurLogo) / 2,
      doc.y,
      { width: largeurLogo }
    );
    doc.moveDown(4);
  } catch (e) {
    doc.fontSize(18).fillColor("#1B5173").text("SAMA Health", { align: "center" });
    doc.moveDown(1);
  }

  doc.fontSize(11).fillColor("#64748b").text("Votre plateforme de soins sans attente", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(14).fillColor("#1B5173").text("Ticket de rendez-vous prioritaire", { align: "center" });
  doc.moveDown(1.2);

  doc.fontSize(11).fillColor("#1f2430");
  doc.text(`Patient : ${patient.prenom} ${patient.nom}`);
  doc.text(`Hôpital : ${hopital.nom}`);
  doc.text(`Spécialité : ${specialite.nom}`);
  doc.text(`Date du rendez-vous : ${rendezVous.dateRDV}`);
  doc.text(`Heure : ${rendezVous.heureRDV}`);
  doc.moveDown(0.6);
  doc.text(`Statut : ${rendezVous.statut === "confirme" ? "Confirmé" : rendezVous.statut}`);
  doc.moveDown(1);

  doc.fontSize(12).fillColor("#1B5173").text("Détails du paiement");
  doc.fontSize(11).fillColor("#1f2430");
  doc.text(`Montant payé : ${paiement.montant} FCFA`);
  doc.text(`Mode de paiement : ${paiement.modePaiement === "wave" ? "Wave" : "Orange Money"}`);
  doc.text(`Référence : ${paiement.refTransaction}`);
  doc.text(`Date : ${new Date(paiement.dateTransaction).toLocaleString("fr-FR")}`);
  doc.moveDown(1.5);

  doc.fontSize(9).fillColor("#94a3b8").text(
    "Veuillez présenter ce document à votre arrivée à l'hôpital.",
    { align: "center" }
  );

  doc.end();
}

function genererRecuTicket(res, { ticket, hopital, specialite, paiement, patient }) {
  const doc = new PDFDocument({ size: [380, 580], margin: 35 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=ticket-${ticket.numero}.pdf`);
  doc.pipe(res);

  const largeurLogo = 90;
  try {
    doc.image(
      path.join(__dirname, "../../ressources/logo.png"),
      (doc.page.width - largeurLogo) / 2,
      doc.y,
      { width: largeurLogo }
    );
    doc.moveDown(4);
  } catch (e) {
    doc.fontSize(18).fillColor("#1B5173").text("SAMA Health", { align: "center" });
    doc.moveDown(1);
  }

  doc.fontSize(11).fillColor("#64748b").text("Votre plateforme de soins sans attente", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(14).fillColor("#1B5173").text("Ticket de consultation - Jour même", { align: "center" });
  doc.moveDown(1.2);

  doc.fontSize(11).fillColor("#1f2430");
  doc.text(`Patient : ${patient.prenom} ${patient.nom}`);
  doc.text(`Hôpital : ${hopital.nom}`);
  doc.text(`Spécialité : ${specialite.nom}`);
  doc.text(`Date : ${ticket.date}`);
  doc.text(`Valable jusqu'au : ${ticket.dateExpiration || "Non renseigné"}`);
  doc.moveDown(0.8);

  doc.fontSize(12).fillColor("#1B5173").text(`Numéro de ticket : ${ticket.numero}`);
  doc.fontSize(12).fillColor("#dc2626").text(`Code de réservation : ${ticket.codeReservation}`);
  doc.moveDown(1.2);

  doc.fontSize(12).fillColor("#1B5173").text("Détails du paiement");
  doc.fontSize(11).fillColor("#1f2430");
  doc.text(`Montant payé : ${paiement.montant} FCFA`);
  doc.text(`Mode de paiement : ${paiement.modePaiement === "wave" ? "Wave" : "Orange Money"}`);
  doc.text(`Référence : ${paiement.refTransaction}`);
  doc.moveDown(1.5);

  doc.fontSize(9).fillColor("#94a3b8").text(
    "Veuillez présenter ce code au personnel d'accueil à votre arrivée à l'hôpital.",
    { align: "center" }
  );

  doc.end();
}

module.exports = { genererRecuRendezVous, genererRecuTicket };