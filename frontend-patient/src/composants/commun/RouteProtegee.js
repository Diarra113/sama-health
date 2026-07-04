import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexte/AuthContext";

function RouteProtegee() {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/connexion" replace />;
  }

  return <Outlet />;
}

export default RouteProtegee;