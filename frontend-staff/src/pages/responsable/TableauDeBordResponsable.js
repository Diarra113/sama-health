import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconeCalendrier, IconeCheck, IconeCroix, IconeGroupe } from "../../composants/commun/Icones";
import "./Responsable.css";

function TableauDeBordResponsable() {
  const { token, utilisateur } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [fileDuJour, setFileDuJour] = useState({ rendezVous: [], tickets: [] });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      axios.get("http://localhost:5000/api/staff/responsable/statistiques", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5000/api/staff/responsable/file-du-jour", { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([r1, r2]) => {
      setStats(r1.data);
      setFileDuJour(r2.data);
    }).catch((e) => console.error(e))
      .finally(() => setChargement(false));
  }, [token]);

  const aujourdHui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  if (chargement) return <p className="resp-message">Chargement...</p>;

  const rdvTermines = fileDuJour.rendezVous?.filter((r) => r.statut === "termine").length || 0;
  const ticketsTermines = fileDuJour.tickets?.filter((t) => t.statut === "termine").length || 0;

  return (
    <div>
      <h1 className="resp-titre">Bienvenue, {utilisateur?.prenom}</h1>
      <p className="resp-soustitre">{aujourdHui.charAt(0).toUpperCase() + aujourdHui.slice(1)}</p>

      <h2 className="resp-sous-titre-section">Statistiques globales — Rendez-vous</h2>
      <div className="resp-grille-stats">
        <div className="resp-carte-stat">
          <div className="resp-icone-stat resp-icone-bleu"><IconeCalendrier taille={26} /></div>
          <p className="resp-nombre">{stats?.total || 0}</p>
          <p className="resp-label">Total rendez-vous</p>
        </div>
        <div className="resp-carte-stat">
          <div className="resp-icone-stat resp-icone-vert"><IconeCheck taille={26} /></div>
          <p className="resp-nombre">{stats?.confirmes || 0}</p>
          <p className="resp-label">Confirmés</p>
        </div>
        <div className="resp-carte-stat">
          <div className="resp-icone-stat resp-icone-orange"><IconeCalendrier taille={26} /></div>
          <p className="resp-nombre">{stats?.enAttente || 0}</p>
          <p className="resp-label">En attente</p>
        </div>
        <div className="resp-carte-stat">
          <div className="resp-icone-stat resp-icone-rouge"><IconeCroix taille={26} /></div>
          <p className="resp-nombre">{stats?.rejetes || 0}</p>
          <p className="resp-label">Rejetés</p>
        </div>
      </div>

      <h2 className="resp-sous-titre-section">File du jour</h2>
      <div className="resp-grille-stats">
        <button className="resp-carte-stat resp-carte-cliquable" onClick={() => navigate("/responsable/file-du-jour")}>
          <div className="resp-icone-stat resp-icone-bleu"><IconeCalendrier taille={26} /></div>
          <p className="resp-nombre">{fileDuJour.rendezVous?.length || 0}</p>
          <p className="resp-label">Rendez-vous aujourd'hui</p>
          <p className="resp-voir-plus">Voir la file →</p>
        </button>

        <button className="resp-carte-stat resp-carte-cliquable" onClick={() => navigate("/responsable/file-du-jour")}>
          <div className="resp-icone-stat resp-icone-violet"><IconeGroupe taille={26} /></div>
          <p className="resp-nombre">{fileDuJour.tickets?.length || 0}</p>
          <p className="resp-label">Tickets aujourd'hui</p>
          <p className="resp-voir-plus">Voir la file →</p>
        </button>

        <div className="resp-carte-stat">
          <div className="resp-icone-stat resp-icone-vert"><IconeCheck taille={26} /></div>
          <p className="resp-nombre">{rdvTermines + ticketsTermines}</p>
          <p className="resp-label">Consultations terminées</p>
        </div>

        <button className="resp-carte-stat resp-carte-cliquable" onClick={() => navigate("/responsable/rendez-vous")}>
          <div className="resp-icone-stat resp-icone-orange"><IconeCalendrier taille={26} /></div>
          <p className="resp-nombre">{stats?.enAttente || 0}</p>
          <p className="resp-label">Rendez-vous à valider</p>
          <p className="resp-voir-plus">Valider →</p>
        </button>
      </div>

      <div className="resp-bientot">
        <p className="resp-bientot-titre">Statistiques avancées — bientôt disponibles</p>
        <p className="resp-bientot-texte">
          Taux de présence, pics d'affluence par jour, durée moyenne de consultation, taux de rejet : ces indicateurs arriveront dans une prochaine version.
        </p>
      </div>
    </div>
  );
}

export default TableauDeBordResponsable;