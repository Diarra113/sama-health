import { NavLink, Outlet } from "react-router-dom";
import "./LayoutAdmin.css";

function LayoutMedecin() {
  return (
    <div className="layout-admin">
      <nav className="admin-onglets">
        <NavLink to="/medecin" end className="admin-onglet">Tableau de bord</NavLink>
        <NavLink to="/medecin/file-du-jour" className="admin-onglet">Patients du jour</NavLink>
        <NavLink to="/medecin/planning" className="admin-onglet">Mon planning</NavLink>
      </nav>
      <main className="admin-contenu"><Outlet /></main>
    </div>
  );
}

export default LayoutMedecin;