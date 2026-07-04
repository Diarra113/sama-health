import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexte/AuthContext";
import { IconeCheck } from "../composants/commun/Icones";
import "./Connexion.css";

function Connexion() {
  const navigate = useNavigate();
  const { connecter, utilisateur } = useAuth();

  useEffect(() => {
    if (utilisateur) {
      navigate("/espace-patient", { replace: true });
    }
  }, [utilisateur, navigate]);

  const [vue, setVue] = useState("accueil");
  const [etape, setEtape] = useState(1);
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [donnees, setDonnees] = useState({
    contact: "",
    prenom: "",
    nom: "",
    motDePasse: "",
    confirmationMotDePasse: "",
    code: "",
  });

  const [loginContact, setLoginContact] = useState("");
  const [loginMotDePasse, setLoginMotDePasse] = useState("");
  const [erreursLogin, setErreursLogin] = useState({});

  const champChange = (e) => {
    setErreurs({ ...erreurs, [e.target.name]: "" });
    setDonnees({ ...donnees, [e.target.name]: e.target.value });
  };

  const estEmailValide = (valeur) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur);
  const estTelephoneValide = (valeur) => /^(\+221)?7[0-8]\d{7}$/.test(valeur.replace(/\s/g, ""));

  const validerContact = (valeur) => {
    if (!valeur.trim()) return "L'email ou le numéro de téléphone est obligatoire.";
    const estNumerique = /^[\d+\s]+$/.test(valeur);
    if (estNumerique) {
      if (!estTelephoneValide(valeur)) return "Numéro invalide. Format attendu : 77 123 45 67.";
    } else if (!estEmailValide(valeur)) {
      return "Adresse email invalide. Format attendu : exemple@email.com.";
    }
    return "";
  };

  const validerEtape1 = () => {
    const nouvellesErreurs = {
      prenom: donnees.prenom.trim() ? "" : "Le prénom est obligatoire.",
      nom: donnees.nom.trim() ? "" : "Le nom est obligatoire.",
      contact: validerContact(donnees.contact),
    };
    setErreurs(nouvellesErreurs);
    if (!nouvellesErreurs.prenom && !nouvellesErreurs.nom && !nouvellesErreurs.contact) {
      setEtape(2);
    }
  };

  const validerEtape2 = async () => {
    const nouvellesErreurs = {};
    if (!donnees.motDePasse || donnees.motDePasse.length < 8) {
      nouvellesErreurs.motDePasse = "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (donnees.confirmationMotDePasse !== donnees.motDePasse || !donnees.confirmationMotDePasse) {
      nouvellesErreurs.confirmationMotDePasse = "Les deux mots de passe ne correspondent pas.";
    }
    setErreurs(nouvellesErreurs);
    if (nouvellesErreurs.motDePasse || nouvellesErreurs.confirmationMotDePasse) return;

    setErreurServeur("");
    setEnCours(true);
    const estEmail = donnees.contact.includes("@");

    try {
      await axios.post("http://localhost:5000/api/auth/inscription", {
        nom: donnees.nom,
        prenom: donnees.prenom,
        email: estEmail ? donnees.contact : null,
        telephone: estEmail ? null : donnees.contact,
        motDePasse: donnees.motDePasse,
      });
      setEtape(3);
    } catch (erreur) {
      if (erreur.response) {
        setErreurServeur(erreur.response.data.message);
      } else {
        setErreurServeur("Impossible de contacter le serveur. Vérifiez que le backend est lancé.");
      }
    } finally {
      setEnCours(false);
    }
  };

  const validerEtape3 = async () => {
    if (!donnees.code.trim()) {
      setErreurs({ code: "Le code de vérification est obligatoire." });
      return;
    }
    setErreurs({});
    setErreurServeur("");
    setEnCours(true);

    try {
      await axios.post("http://localhost:5000/api/auth/verifier-code", {
        contact: donnees.contact,
        code: donnees.code,
      });
      setVue("succes");
    } catch (erreur) {
      if (erreur.response) {
        setErreurServeur(erreur.response.data.message);
      } else {
        setErreurServeur("Impossible de contacter le serveur.");
      }
    } finally {
      setEnCours(false);
    }
  };

  const precedent = () => {
    setErreurs({});
    setEtape(etape - 1);
  };

  const validerLogin = async () => {
  const nouvellesErreurs = {
    contact: validerContact(loginContact),
    motDePasse: loginMotDePasse.trim() ? "" : "Le mot de passe est obligatoire.",
  };
  setErreursLogin(nouvellesErreurs);
  if (nouvellesErreurs.contact || nouvellesErreurs.motDePasse) return;

  setEnCours(true);
  try {
    const reponse = await axios.post("http://localhost:5000/api/auth/connexion", {
      contact: loginContact,
      motDePasse: loginMotDePasse,
    });

    if (reponse.data.utilisateur.role !== "patient") {
      setErreursLogin({ ...erreursLogin, motDePasse: "Ce compte n'est pas un compte patient." });
      return;
    }

    connecter(reponse.data.token, reponse.data.utilisateur);
    navigate("/espace-patient");
  } catch (erreur) {
    if (erreur.response) {
      setErreursLogin({ ...erreursLogin, motDePasse: erreur.response.data.message });
    } else {
      setErreursLogin({ ...erreursLogin, motDePasse: "Impossible de contacter le serveur." });
    }
  } finally {
    setEnCours(false);
  }
};

  return (
    <div className="page-connexion">
      {vue === "accueil" && (
        <div className="connexion-accueil">
          <div className="connexion-carte">
            <Link to="/">
              <img src={require("../ressources/logo.png")} alt="SAMA Health" className="connexion-logo" />
            </Link>
            <h2>Créez votre compte patient</h2>
            <p>Prenez rendez-vous ou achetez votre ticket de consultation en ligne, où que vous soyez et quand vous le souhaitez.</p>
            <button className="connexion-btn-principal" onClick={() => { setVue("inscription"); setEtape(1); setErreurs({}); }}>
              S'inscrire
            </button>
          </div>

          <div className="connexion-carte connexion-carte-secondaire">
            <p>Vous avez déjà un compte ?</p>
            <button className="connexion-btn-secondaire" onClick={() => setVue("login")}>
              Se connecter
            </button>
          </div>
        </div>
      )}

      {vue === "inscription" && (
        <div className="connexion-carte connexion-carte-formulaire">
          <button className="connexion-retour" onClick={() => (etape === 1 ? setVue("accueil") : precedent())}>
            ← Retour
          </button>

          <div className="connexion-barre-progression">
            <div className={`segment ${etape >= 1 ? "actif" : ""}`}></div>
            <div className={`segment ${etape >= 2 ? "actif" : ""}`}></div>
            <div className={`segment ${etape >= 3 ? "actif" : ""}`}></div>
          </div>

          {etape === 1 && (
            <>
              <h2>Vos informations</h2>
              <p className="connexion-etape-label">Étape 1 sur 3</p>

              <label className="connexion-label">Prénom *</label>
              <input type="text" name="prenom" placeholder="Ex : Aïssatou" value={donnees.prenom} onChange={champChange} className="connexion-input" />
              {erreurs.prenom && <p className="connexion-erreur-champ">{erreurs.prenom}</p>}

              <label className="connexion-label">Nom *</label>
              <input type="text" name="nom" placeholder="Ex : Diop" value={donnees.nom} onChange={champChange} className="connexion-input" />
              {erreurs.nom && <p className="connexion-erreur-champ">{erreurs.nom}</p>}

              <label className="connexion-label">Email ou numéro de téléphone *</label>
              <input type="text" name="contact" placeholder="exemple@email.com ou 77 123 45 67" value={donnees.contact} onChange={champChange} className="connexion-input" />
              {erreurs.contact && <p className="connexion-erreur-champ">{erreurs.contact}</p>}

              <button className="connexion-btn-principal" onClick={validerEtape1}>Continuer</button>
            </>
          )}

          {etape === 2 && (
            <>
              <h2>Choisissez un mot de passe</h2>
              <p className="connexion-etape-label">Étape 2 sur 3</p>
              <p className="connexion-aide">
                Choisissez un mot de passe d'au moins 8 caractères, avec une majuscule
                et un chiffre. Veillez à le garder précieusement : vous en aurez besoin
                à chaque connexion.
              </p>

              <label className="connexion-label">Mot de passe *</label>
              <input type="password" name="motDePasse" placeholder="8 caractères minimum" value={donnees.motDePasse} onChange={champChange} className="connexion-input" />
              {erreurs.motDePasse && <p className="connexion-erreur-champ">{erreurs.motDePasse}</p>}

              <label className="connexion-label">Confirmer le mot de passe *</label>
              <input type="password" name="confirmationMotDePasse" placeholder="Ressaisissez le mot de passe" value={donnees.confirmationMotDePasse} onChange={champChange} className="connexion-input" />
              {erreurs.confirmationMotDePasse && <p className="connexion-erreur-champ">{erreurs.confirmationMotDePasse}</p>}

              {erreurServeur && <p className="connexion-erreur-champ">{erreurServeur}</p>}

              <button className="connexion-btn-principal" onClick={validerEtape2} disabled={enCours}>
                {enCours ? "Envoi du code..." : "Continuer"}
              </button>
            </>
          )}

          {etape === 3 && (
            <>
              <h2>Vérifiez votre compte</h2>
              <p className="connexion-etape-label">Étape 3 sur 3</p>
              <p className="connexion-aide">
                Un code de vérification a été envoyé à <strong>{donnees.contact}</strong>.
              </p>

              <label className="connexion-label">Code de vérification *</label>
              <input type="text" name="code" placeholder="Ex : 123456" value={donnees.code} onChange={champChange} className="connexion-input" />
              {erreurs.code && <p className="connexion-erreur-champ">{erreurs.code}</p>}
              {erreurServeur && <p className="connexion-erreur-champ">{erreurServeur}</p>}

              <button className="connexion-btn-principal" onClick={validerEtape3} disabled={enCours}>
                {enCours ? "Vérification..." : "Valider mon compte"}
              </button>
            </>
          )}
        </div>
      )}

      {vue === "login" && (
        <div className="connexion-carte connexion-carte-formulaire">
          <button className="connexion-retour" onClick={() => { setVue("accueil"); setErreursLogin({}); }}>← Retour</button>
          <Link to="/">
            <img src={require("../ressources/logo.png")} alt="SAMA Health" className="connexion-logo" />
          </Link>
          <h2>Connexion</h2>

          <label className="connexion-label">Email ou numéro de téléphone *</label>
          <input
            type="text"
            placeholder="exemple@email.com ou 77 123 45 67"
            value={loginContact}
            onChange={(e) => { setLoginContact(e.target.value); setErreursLogin({ ...erreursLogin, contact: "" }); }}
            className="connexion-input"
          />
          {erreursLogin.contact && <p className="connexion-erreur-champ">{erreursLogin.contact}</p>}

          <label className="connexion-label">Mot de passe *</label>
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={loginMotDePasse}
            onChange={(e) => { setLoginMotDePasse(e.target.value); setErreursLogin({ ...erreursLogin, motDePasse: "" }); }}
            className="connexion-input"
          />
          {erreursLogin.motDePasse && <p className="connexion-erreur-champ">{erreursLogin.motDePasse}</p>}

          <button className="connexion-btn-principal" onClick={validerLogin} disabled={enCours}>
            {enCours ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      )}

      {vue === "succes" && (
        <div className="connexion-carte connexion-carte-formulaire connexion-succes">
          <div className="connexion-succes-icone"><IconeCheck taille={56} /></div>
          <h2>Compte créé avec succès !</h2>
          <p>Bienvenue sur SAMA Health, {donnees.prenom}. Vous pouvez maintenant vous connecter.</p>
          <button className="connexion-btn-principal" onClick={() => setVue("login")}>
            Se connecter
          </button>
        </div>
      )}
    </div>
  );
}

export default Connexion;