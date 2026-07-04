import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Responsable.css";

function MedecinsResponsable() {
  const { token } = useAuth();
  const [medecins, setMedecins] = useState([]);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    axios.get("http://localhost:5000/api/staff/responsable/medecins", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setMedecins(r.data))
      .catch((e) => console.error(e))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [token]);

  const basculer = async (medecinId) => {
    await axios.put(`http://localhost:5000/api/staff/responsable/medecins/${medecinId}/presence`, {}, { headers: { Authorization: `Bearer ${token}` } });
    charger();
  };

  return (
    <div>
      <h1 className="resp-titre">Médecins présents aujourd'hui</h1>
      <p className="resp-soustitre">Indiquez quels médecins de votre service travaillent aujourd'hui.</p>

      {chargement ? <p className="resp-message">Chargement...</p> : (
        medecins.length === 0
          ? <p className="resp-message">Aucun médecin affecté à ce service pour l'instant.</p>
          : medecins.map((m) => (
            <div key={m.id} className="resp-carte-medecin">
              <div className="resp-avatar-medecin">{m.prenom?.[0]}{m.nom?.[0]}</div>
              <div className="resp-infos-medecin">
                <p className="resp-nom-medecin">{m.prenom} {m.nom}</p>
                <p className="resp-fonction-medecin">{m.fonction}</p>
                {m.absencesAvenir?.length > 0 && (
                  <p className="resp-absences-avenir">
                    🚫 Absent le(s) : {m.absencesAvenir.join(", ")}
                  </p>
                )}
              </div>
              <button
                className={`resp-toggle-presence ${m.present ? "resp-present" : "resp-absent"}`}
                onClick={() => basculer(m.medecinId)}
              >
                {m.present ? "Présent aujourd'hui" : "Absent aujourd'hui"}
              </button>
            </div>
          ))
      )}
    </div>
  );
}

export default MedecinsResponsable;