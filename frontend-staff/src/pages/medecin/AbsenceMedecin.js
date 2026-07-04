import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Medecin.css";

function AbsenceMedecin() {
  const { token } = useAuth();
  const [present, setPresent] = useState(true);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    axios.get("http://localhost:5000/api/staff/medecin/ma-presence", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setPresent(r.data.present)).catch((e) => console.error(e)).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [token]);

  const signaler = async () => {
    await axios.put("http://localhost:5000/api/staff/medecin/signaler-absence", {}, { headers: { Authorization: `Bearer ${token}` } });
    charger();
  };
  const annuler = async () => {
    await axios.put("http://localhost:5000/api/staff/medecin/annuler-absence", {}, { headers: { Authorization: `Bearer ${token}` } });
    charger();
  };

  if (chargement) return <p className="med-message">Chargement...</p>;

  return (
    <div>
      <h1 className="med-titre">Signaler une absence</h1>
      <p className="med-soustitre">En cas d'imprévu, signalez votre absence pour aujourd'hui — votre responsable de service en sera informé immédiatement.</p>

      <div className="med-carte-absence">
        {present ? (
          <>
            <p className="med-statut-present">Vous êtes marqué présent aujourd'hui</p>
            <button className="med-btn-absence" onClick={signaler}>Signaler une absence aujourd'hui</button>
          </>
        ) : (
          <>
            <p className="med-statut-absent">Vous êtes marqué absent aujourd'hui</p>
            <button className="med-btn-annuler-absence" onClick={annuler}>Je suis de retour, annuler l'absence</button>
          </>
        )}
      </div>
    </div>
  );
}

export default AbsenceMedecin;