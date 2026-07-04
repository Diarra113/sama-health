import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexte/AuthContext";
import { IconeDeconnexion, IconeCalendrier, IconeHorloge, IconeGroupe, IconeHopital } from "./Icones";
import "./LayoutDashboard.css";

function LayoutDashboard() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();

  const sortir = () => {
    deconnecter();
    navigate("/");
  };

  return (
    <div className="dashboard">
      {/* Sidebar desktop */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-compte">
          <div className="dashboard-avatar">
            {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
          </div>
          <p className="dashboard-nom">{utilisateur?.prenom} {utilisateur?.nom}</p>
        </div>

        <nav className="dashboard-menu">
          <NavLink to="/espace-patient" end className="dashboard-lien">Tableau de bord</NavLink>
          <NavLink to="/espace-patient/rendez-vous" className="dashboard-lien">Mes rendez-vous</NavLink>
          <NavLink to="/espace-patient/tickets" className="dashboard-lien">Mes tickets</NavLink>
          <NavLink to="/espace-patient/profil" className="dashboard-lien">Mon profil</NavLink>
        </nav>

        <button className="dashboard-deconnexion" onClick={sortir}>
          <IconeDeconnexion taille={20} />
          Déconnexion
        </button>
      </aside>

      {/* Contenu principal */}
      <main className="dashboard-contenu">
        <Outlet />
      </main>

      {/* Barre de navigation mobile en bas */}
      <nav className="dashboard-nav-mobile">
        <NavLink to="/espace-patient" end className="dashboard-nav-mobile-btn">
          <IconeHopital taille={22} />
          <span>Accueil</span>
        </NavLink>
        <NavLink to="/espace-patient/rendez-vous" className="dashboard-nav-mobile-btn">
          <IconeCalendrier taille={22} />
          <span>Rendez-vous</span>
        </NavLink>
        <NavLink to="/espace-patient/tickets" className="dashboard-nav-mobile-btn">
          <IconeHorloge taille={22} />
          <span>Tickets</span>
        </NavLink>
        <NavLink to="/espace-patient/profil" className="dashboard-nav-mobile-btn">
          <IconeGroupe taille={22} />
          <span>Profil</span>
        </NavLink>
        <button className="dashboard-nav-mobile-btn dashboard-nav-mobile-deco" onClick={sortir}>
          <IconeDeconnexion taille={22} />
          <span>Sortir</span>
        </button>
      </nav>
    </div>
  );
}

export default LayoutDashboard;