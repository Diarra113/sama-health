import { NavLink, Outlet } from "react-router-dom";
import "./LayoutAdmin.css";

function LayoutResponsable() {
  return (
    <div className="layout-admin">
      <nav className="admin-onglets">
        <NavLink to="/responsable" end className="admin-onglet">Tableau de bord</NavLink>
        <NavLink to="/responsable/file-du-jour" className="admin-onglet">File du jour</NavLink>
        <NavLink to="/responsable/rendez-vous" className="admin-onglet">Rendez-vous</NavLink>
        <NavLink to="/responsable/tickets" className="admin-onglet">Tickets</NavLink>
        <NavLink to="/responsable/plannings" className="admin-onglet">Plannings</NavLink>
        <NavLink to="/responsable/medecins" className="admin-onglet">Médecins</NavLink>
        <NavLink to="/responsable/parametres" className="admin-onglet">Paramètres du service</NavLink>
      </nav>
      <main className="admin-contenu"><Outlet /></main>
    </div>
  );
}

export default LayoutResponsable;