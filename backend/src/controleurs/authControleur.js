const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Utilisateur = require("../modeles/Utilisateur");
const Patient = require("../modeles/Patient");
const { envoyerCodeVerification } = require("../services/emailService");

// Stockage temporaire des codes en attente de vérification (en mémoire, pour l'instant)
const codesEnAttente = {};

async function inscriptionPatient(req, res) {
  try {
    const { nom, prenom, email, telephone, motDePasse } = req.body;

    if (!nom || !prenom || !motDePasse) {
      return res.status(400).json({ message: "Nom, prénom et mot de passe sont obligatoires." });
    }
    if (!email && !telephone) {
      return res.status(400).json({ message: "Un email ou un numéro de téléphone est requis." });
    }

    const utilisateurExistant = await Utilisateur.findOne({
      where: email ? { email } : { telephone },
    });
    if (utilisateurExistant) {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email ou ce numéro." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    codesEnAttente[email || telephone] = {
      code,
      nom,
      prenom,
      email,
      telephone,
      motDePasse,
      expiration: Date.now() + 10 * 60 * 1000,
    };

    if (email) {
      await envoyerCodeVerification(email, code);
    }

    res.status(200).json({ message: "Code de vérification envoyé." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
}

async function verifierCode(req, res) {
  try {
    const { contact, code } = req.body;
    const enAttente = codesEnAttente[contact];

    if (!enAttente) {
      return res.status(400).json({ message: "Aucune demande d'inscription trouvée pour ce contact." });
    }
    if (Date.now() > enAttente.expiration) {
      delete codesEnAttente[contact];
      return res.status(400).json({ message: "Le code a expiré. Veuillez recommencer l'inscription." });
    }
    if (enAttente.code !== code) {
      return res.status(400).json({ message: "Code de vérification incorrect." });
    }

    const motDePasseHache = await bcrypt.hash(enAttente.motDePasse, 10);

    const utilisateur = await Utilisateur.create({
      nom: enAttente.nom,
      prenom: enAttente.prenom,
      email: enAttente.email || null,
      telephone: enAttente.telephone || null,
      motDePasse: motDePasseHache,
      role: "patient",
    });

    await Patient.create({ utilisateurId: utilisateur.id });

    delete codesEnAttente[contact];

    res.status(201).json({
      message: "Compte créé avec succès.",
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, prenom: utilisateur.prenom },
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la vérification." });
  }
}

async function connexion(req, res) {
  try {
    const { contact, motDePasse } = req.body;

    if (!contact || !motDePasse) {
      return res.status(400).json({ message: "Contact et mot de passe sont obligatoires." });
    }

    const estEmail = contact.includes("@");
    const utilisateur = await Utilisateur.findOne({
      where: estEmail ? { email: contact } : { telephone: contact },
    });

    if (!utilisateur) {
      return res.status(401).json({ message: "Email/téléphone ou mot de passe incorrect." });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({ message: "Email/téléphone ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Connexion réussie.",
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        role: utilisateur.role,
      },
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
}

module.exports = { inscriptionPatient, verifierCode, connexion };