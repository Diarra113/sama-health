import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexte/AuthContext";
import { IconeCalendrier, IconeGroupe, IconePoignee, IconeGraphique } from "../composants/commun/Icones";
import "./Connexion.css";

const ROUTES_PAR_ROLE = {
  administrateur: "/admin",
  medecin: "/medecin",
  responsable: "/responsable",
  accueil: "/accueil",
};

const FONCTIONNALITES = [
  { Icone: IconeCalendrier, titre: "Planifiez", texte: "Gérez vos journées et vos rendez-vous." },
  { Icone: IconeGroupe, titre: "Organisez", texte: "Suivez vos patients et vos activités." },
  { Icone: IconePoignee, titre: "Collaborez", texte: "Coordonnez-vous avec votre équipe." },
  { Icone: IconeGraphique, titre: "Analysez", texte: "Consultez les indicateurs de votre service." },
];

function Connexion() {
  const navigate = useNavigate();
  const { connecter, utilisateur } = useAuth();

  const [contact, setContact] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (utilisateur) {
      navigate(ROUTES_PAR_ROLE[utilisateur.role] || "/", { replace: true });
    }
  }, [utilisateur, navigate]);

  const seConnecter = async () => {
    if (!contact.trim() || !motDePasse.trim()) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }
    setErreur("");
    setEnCours(true);

    try {
      const reponse = await axios.post("http://localhost:5000/api/auth/connexion", {
        contact,
        motDePasse,
      });

      const role = reponse.data.utilisateur.role;
      if (!ROUTES_PAR_ROLE[role]) {
        setErreur("Ce compte n'a pas accès à l'espace professionnel.");
        return;
      }

      connecter(reponse.data.token, reponse.data.utilisateur);
      navigate(ROUTES_PAR_ROLE[role]);
    } catch (erreur) {
      if (erreur.response) {
        setErreur(erreur.response.data.message);
      } else {
        setErreur("Impossible de contacter le serveur.");
      }
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="connexion-staff-page">
      <div className="connexion-staff-gauche">
        <div className="connexion-staff-contenu-gauche">
          <img src={require("../ressources/logo-blanc.png")} alt="SAMA Health" className="connexion-staff-logo-gauche" />

          <h1 className="connexion-staff-titre-gauche">
            Simplifiez votre quotidien,<br />soyez plus efficace.
          </h1>

          <div className="connexion-staff-separateur"></div>

          <p className="connexion-staff-texte-gauche">
            Planifiez vos journées, consultez vos patients, coordonnez avec votre
            équipe et accédez à tous vos outils depuis un seul espace.
          </p>

          <div className="connexion-staff-fonctionnalites">
            {FONCTIONNALITES.map((f, i) => (
              <div key={i} className="connexion-staff-fonctionnalite">
                <div className="connexion-staff-fonctionnalite-icone"><f.Icone taille={22} /></div>
                <p className="connexion-staff-fonctionnalite-titre">{f.titre}</p>
                <p className="connexion-staff-fonctionnalite-texte">{f.texte}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="connexion-staff-droite">
        <div className="connexion-staff-formulaire">
          <h1 className="connexion-staff-bienvenue">Bienvenue dans votre espace professionnel</h1>
          <h2>Connexion</h2>

          <label className="connexion-staff-champ-label">Email professionnel</label>
          <input
            type="email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="connexion-staff-input"
            placeholder="exemple@hopital.sn"
          />

          <label className="connexion-staff-champ-label">Mot de passe</label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="connexion-staff-input"
            placeholder="Votre mot de passe"
          />

          {erreur && <p className="connexion-staff-erreur">{erreur}</p>}

          <button className="connexion-staff-btn" onClick={seConnecter} disabled={enCours}>
            {enCours ? "Connexion..." : "Se connecter"}
          </button>

          <p className="connexion-staff-aide">
            Veuillez utiliser les identifiants qui vous ont été communiqués par votre administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Connexion;