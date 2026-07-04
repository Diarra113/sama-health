import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Responsable.css";

function PlanningsResponsable() {
  const { token } = useAuth();
  const [plannings, setPlannings] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [motifs, setMotifs] = useState({});

  const charger = () => {
    axios.get("http://localhost:5000/api/staff/responsable/plannings", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setPlannings(r.data)).catch((e) => console.error(e)).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [token]);

  const traiter = async (id, statut) => {
    await axios.put(`http://localhost:5000/api/staff/responsable/plannings/${id}`, { statut, motifRejet: motifs[id] }, { headers: { Authorization: `Bearer ${token}` } });
    charger();
  };

  const libelle = (s) => s === "valide" ? { t: "Validé", c: "resp-badge-confirme" } : s === "rejete" ? { t: "Rejeté", c: "resp-badge-rejete" } : { t: "En attente", c: "resp-badge-attente" };

  return (
    <div>
      <h1 className="resp-titre">Plannings à valider</h1>
      <p className="resp-soustitre">Disponibilités soumises par les médecins de votre service.</p>

      {chargement ? <p className="resp-message">Chargement...</p> : (
        plannings.length === 0 ? <p className="resp-message">Aucun planning soumis pour l'instant.</p> :
        plannings.map((p) => {
          const l = libelle(p.statut);
          return (
            <div key={p.id} className="resp-carte-rdv">
              <div className="resp-rdv-entete">
                <p className="resp-rdv-patient">{p.Medecin?.Utilisateur?.prenom} {p.Medecin?.Utilisateur?.nom}</p>
                <span className={l.c}>{l.t}</span>
              </div>
              <p className="resp-rdv-date">{p.dateDebut} → {p.dateFin}</p>
              {p.commentaire && <p className="resp-rdv-date">{p.commentaire}</p>}

              {p.statut === "en_attente" && (
                <div className="resp-rdv-actions">
                  <input
                    type="text"
                    placeholder="Motif si rejet (optionnel)"
                    className="resp-input-motif"
                    onChange={(e) => setMotifs({ ...motifs, [p.id]: e.target.value })}
                  />
                  <button className="resp-btn-confirmer" onClick={() => traiter(p.id, "valide")}>Valider</button>
                  <button className="resp-btn-rejeter" onClick={() => traiter(p.id, "rejete")}>Rejeter</button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default PlanningsResponsable;