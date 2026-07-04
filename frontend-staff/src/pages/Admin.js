import { useAuth } from "../contexte/AuthContext";

function Admin() {
  const { deconnecter } = useAuth();
  return (
    <div style={{ padding: 40 }}>
      <p>Espace Administrateur (à construire)</p>
      <button onClick={deconnecter}>Se déconnecter</button>
    </div>
  );
}
export default Admin;