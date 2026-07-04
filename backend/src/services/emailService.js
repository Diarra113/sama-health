const nodemailer = require("nodemailer");

const transporteur = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function envoyerCodeVerification(destinataire, code) {
  await transporteur.sendMail({
    from: `"SAMA Health" <${process.env.EMAIL_USER}>`,
    to: destinataire,
    subject: "Votre code de vérification SAMA Health",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1B5173;">Vérification de votre compte</h2>
        <p>Voici votre code de vérification SAMA Health :</p>
        <p style="font-size: 28px; font-weight: bold; color: #1B5173; letter-spacing: 4px;">${code}</p>
        <p style="color: #64748b; font-size: 14px;">Ce code est valable 10 minutes. Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
    `,
  });
}

module.exports = { envoyerCodeVerification };