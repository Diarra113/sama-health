import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconeCalendrier, IconeCheck, IconeGroupe, IconeAlerte } from "../../composants/commun/Icones";
import "./Medecin.css";

function TableauDeBordMedecin() {
  const { token, utilisateur } = useAuth();
  const navigate = useNavigate();
  const [donnees, setDonnees] = useState({ absent: false, rendezVous: [], tickets: [] });
  const [present, setPresent] = useState(true);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      axios.get("http://localhost:5000/api/staff/medecin/file-du-jour", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5000/api/staff/medecin/ma-presence", { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([r1, r2]) => {
      setDonnees(r1.data);
      setPresent(r2.data.present);
    }).catch((e) => console.error(e))
      .finally(() => setChargement(false));
  }, [token]);

  const aujourdHui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  if (chargement) return <p className="med-message">Chargement...</p>;

  const rdvTotal = donnees.rendezVous?.length || 0;
  const rdvTermines = donnees.rendezVous?.filter((r) => r.statut === "termine").length || 0;
  const rdvRestants = rdvTotal - rdvTermines;

  const ticketsTotal = donnees.tickets?.length || 0;
  const ticketsTermines = donnees.tickets?.filter((t) => t.statut === "termine").length || 0;
  const ticketsRestants = ticketsTotal - ticketsTermines;

  return (
    <div>
      <h1 className="med-titre">Bienvenue, Dr {utilisateur?.prenom}</h1>
      <p className="med-soustitre">{aujourdHui.charAt(0).toUpperCase() + aujourdHui.slice(1)}</p>

      {!present && (
        <div className="med-banniere-absence">
          <IconeAlerte taille={20} />
          Vous êtes signalé absent aujourd'hui — aucune file à gérer. Rendez-vous sur "Mon planning" pour annuler si nécessaire.
        </div>
      )}

      <h2 className="med-sous-titre-section">File des rendez-vous du jour</h2>
      <div className="med-grille-stats">
        <button className="med-carte-stat med-carte-cliquable" onClick={() => navigate("/medecin/file-du-jour")}>
          <div className="med-icone-stat med-icone-bleu"><IconeCalendrier taille={26} /></div>
          <p className="med-nombre">{rdvTotal}</p>
          <p className="med-label">Total rendez-vous</p>
          <p className="med-voir-plus">Voir la file →</p>
        </button>
        <div className="med-carte-stat">
          <div className="med-icone-stat med-icone-vert"><IconeCheck taille={26} /></div>
          <p className="med-nombre">{rdvTermines}</p>
          <p className="med-label">Consultés</p>
        </div>
        <div className="med-carte-stat">
          <div className="med-icone-stat med-icone-orange"><IconeCalendrier taille={26} /></div>
          <p className="med-nombre">{rdvRestants}</p>
          <p className="med-label">Restants</p>
        </div>
      </div>

      <h2 className="med-sous-titre-section">File des tickets du jour</h2>
      <div className="med-grille-stats">
        <button className="med-carte-stat med-carte-cliquable" onClick={() => navigate("/medecin/file-du-jour")}>
          <div className="med-icone-stat med-icone-bleu"><IconeGroupe taille={26} /></div>
          <p className="med-nombre">{ticketsTotal}</p>
          <p className="med-label">Total tickets</p>
          <p className="med-voir-plus">Voir la file →</p>
        </button>
        <div className="med-carte-stat">
          <div className="med-icone-stat med-icone-vert"><IconeCheck taille={26} /></div>
          <p className="med-nombre">{ticketsTermines}</p>
          <p className="med-label">Consultés</p>
        </div>
        <div className="med-carte-stat">
          <div className="med-icone-stat med-icone-orange"><IconeCalendrier taille={26} /></div>
          <p className="med-nombre">{ticketsRestants}</p>
          <p className="med-label">Restants</p>
        </div>
      </div>

      <div className="med-bientot">
        <p className="med-bientot-titre">Statistiques personnelles — bientôt disponibles</p>
        <p className="med-bientot-texte">
          Nombre de patients vus ce mois, taux de présence, durée moyenne par consultation : ces indicateurs arriveront dans une prochaine version.
        </p>
      </div>
    </div>
  );
}

export default TableauDeBordMedecin;