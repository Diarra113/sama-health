import { NavLink, Outlet } from "react-router-dom";
import "./LayoutAdmin.css";

function LayoutAdmin() {
  return (
    <div className="layout-admin">
      <nav className="admin-onglets">
        <NavLink to="/admin" end className="admin-onglet">Tableau de bord</NavLink>
        <NavLink to="/admin/hopitaux" className="admin-onglet">Hôpitaux</NavLink>
        <NavLink to="/admin/administrateurs" className="admin-onglet">Administrateurs</NavLink>
      </nav>

      <main className="admin-contenu">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutAdmin;