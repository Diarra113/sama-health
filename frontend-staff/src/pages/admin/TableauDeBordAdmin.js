import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconeHopital, IconeGroupe, IconeBouclier, IconeCroixMedicale } from "../../composants/commun/Icones";
import "./TableauDeBordAdmin.css";

function TableauDeBordAdmin() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ hopitaux: 0, specialites: 0, medecins: 0, responsables: 0, accueil: 0, administrateurs: 0 });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      const enTetes = { headers: { Authorization: `Bearer ${token}` } };
      let hopitaux = 0, specialites = 0, medecins = 0, responsables = 0, accueil = 0, administrateurs = 0;

      try {
        const r = await axios.get("http://localhost:5000/api/hopitaux");
        hopitaux = r.data.length;
      } catch (e) { console.error("Erreur hopitaux:", e); }

      try {
        const r = await axios.get("http://localhost:5000/api/specialites");
        specialites = r.data.length;
      } catch (e) { console.error("Erreur specialites:", e); }

      try {
        const r = await axios.get("http://localhost:5000/api/admin/personnel", enTetes);
        medecins = r.data.medecins.length;
        responsables = r.data.responsables.length;
        accueil = r.data.accueil.length;
        administrateurs = r.data.administrateurs.length;
      } catch (e) { console.error("Erreur personnel:", e); }

      setStats({ hopitaux, specialites, medecins, responsables, accueil, administrateurs });
      setChargement(false);
    }
    charger();
  }, [token]);

  return (
    <div>
      <h1 className="tba-titre">Tableau de bord administratif</h1>
      <p className="tba-soustitre">Pilotage général de la plateforme SAMA Health.</p>

      {chargement ? (
        <p className="tba-message">Chargement...</p>
      ) : (
        <>
          <div className="tba-grille">
            <button className="tba-carte tba-carte-cliquable" onClick={() => navigate("/admin/hopitaux")}>
              <div className="tba-icone tba-icone-bleu"><IconeHopital taille={26} /></div>
              <p className="tba-nombre">{stats.hopitaux}</p>
              <p className="tba-label">Hôpitaux publics</p>
              <span className="tba-voir-plus">Voir tous les hôpitaux →</span>
            </button>

            <div className="tba-carte">
              <div className="tba-icone tba-icone-jaune"><IconeCroixMedicale taille={26} /></div>
              <p className="tba-nombre">{stats.specialites}</p>
              <p className="tba-label">Spécialités</p>
              <span className="tba-note">Différentes spécialités proposées sur la plateforme</span>
            </div>

            <div className="tba-carte">
              <div className="tba-icone tba-icone-vert"><IconeGroupe taille={26} /></div>
              <p className="tba-nombre">{stats.medecins}</p>
              <p className="tba-label">Médecins</p>
              <span className="tba-note">Gérés depuis chaque hôpital</span>
            </div>

            <div className="tba-carte">
              <div className="tba-icone tba-icone-orange"><IconeGroupe taille={26} /></div>
              <p className="tba-nombre">{stats.responsables}</p>
              <p className="tba-label">Responsables de service</p>
              <span className="tba-note">Gérés depuis chaque hôpital</span>
            </div>

            <div className="tba-carte">
              <div className="tba-icone tba-icone-violet"><IconeGroupe taille={26} /></div>
              <p className="tba-nombre">{stats.accueil}</p>
              <p className="tba-label">Agents de guichet</p>
              <span className="tba-note">Gérés depuis chaque hôpital</span>
            </div>

            <button className="tba-carte tba-carte-cliquable" onClick={() => navigate("/admin/administrateurs")}>
              <div className="tba-icone tba-icone-rouge"><IconeBouclier taille={26} /></div>
              <p className="tba-nombre">{stats.administrateurs}</p>
              <p className="tba-label">Administrateurs</p>
              <span className="tba-voir-plus">Gérer les administrateurs →</span>
            </button>
          </div>

          <div className="tba-bientot">
            <p className="tba-bientot-titre">📊 Statistiques avancées — bientôt disponibles</p>
            <p className="tba-bientot-texte">
              Rendez-vous pris, tickets vendus, taux de fréquentation par hôpital : ces indicateurs
              arriveront dans une prochaine version de la plateforme.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default TableauDeBordAdmin;