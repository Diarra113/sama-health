import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconeAlerte } from "../../composants/commun/Icones";
import "./Medecin.css";

function FileDuJourMedecin() {
  const { token } = useAuth();
  const [donnees, setDonnees] = useState({ absent: false, rendezVous: [], tickets: [] });
  const [chargement, setChargement] = useState(true);
  const [patientOuvert, setPatientOuvert] = useState(null);

  const charger = () => {
    axios.get("http://localhost:5000/api/staff/medecin/file-du-jour", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setDonnees(r.data))
      .catch((e) => console.error(e))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [token]);

  const marquerRdvVu = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/medecin/rdv/${id}/terminer`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      charger();
    } catch (e) {
      if (e.response?.status === 400) alert(e.response.data.message);
      else console.error(e);
    }
  };

  const marquerTicketVu = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/medecin/ticket/${id}/terminer`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      charger();
    } catch (e) { console.error(e); }
  };

  const togglePatient = (cle) => setPatientOuvert(patientOuvert === cle ? null : cle);

  const calculerAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    const naissance = new Date(dateNaissance);
    const maintenant = new Date();
    let age = maintenant.getFullYear() - naissance.getFullYear();
    const mois = maintenant.getMonth() - naissance.getMonth();
    if (mois < 0 || (mois === 0 && maintenant.getDate() < naissance.getDate())) age--;
    return age;
  };

  if (chargement) return <p className="med-message">Chargement...</p>;

  if (donnees.absent) {
    return (
      <div>
        <h1 className="med-titre">File du jour</h1>
        <div className="med-banniere-absence">
          <IconeAlerte taille={20} />
          Vous êtes signalé absent aujourd'hui — aucune file à gérer.
        </div>
      </div>
    );
  }

  const InfosPatientDetail = ({ infos }) => {
    if (!infos) return null;
    const age = calculerAge(infos.dateNaissance);
    return (
      <div className="med-infos-patient-detail">
        <div className="med-grille-infos">
          {age !== null && (
            <div className="med-info-item">
              <p className="med-info-label">Âge</p>
              <p className="med-info-valeur">{age} ans</p>
            </div>
          )}
          {infos.sexe && (
            <div className="med-info-item">
              <p className="med-info-label">Sexe</p>
              <p className="med-info-valeur">{infos.sexe === "M" ? "Masculin" : "Féminin"}</p>
            </div>
          )}
          {infos.adresse && (
            <div className="med-info-item">
              <p className="med-info-label">Adresse</p>
              <p className="med-info-valeur">{infos.adresse}</p>
            </div>
          )}
          {infos.email && (
            <div className="med-info-item">
              <p className="med-info-label">Email</p>
              <p className="med-info-valeur">{infos.email}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="med-titre">Patients du jour</h1>
      <p className="med-soustitre">Cliquez sur un patient pour voir ses informations.</p>

      <div className="med-section">
        <h2 className="med-section-titre">Rendez-vous ({donnees.rendezVous.length})</h2>
        {donnees.rendezVous.length === 0
          ? <p className="med-message-petit">Aucun rendez-vous confirmé aujourd'hui.</p>
          : donnees.rendezVous.map((r) => {
            const cle = `rdv-${r.id}`;
            const ouvert = patientOuvert === cle;
            const maintenant = new Date();
            const heureRdv = new Date(`${new Date().toISOString().split("T")[0]}T${r.heure}`);
            const heureDepassee = heureRdv < maintenant && r.statut !== "termine";

            return (
              <div key={r.id} className="med-carte-patient-expandable">
                <div className="med-carte-patient" onClick={() => togglePatient(cle)} style={{ cursor: "pointer" }}>
                  <span className="med-heure-patient">{r.heure?.slice(0, 5)}</span>
                  <span className="med-nom-patient">{r.patient}</span>
                  {r.statut === "termine" ? (
                    <span className="med-badge-termine">Consulté ✓</span>
                  ) : heureDepassee ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <span className="med-badge-non-presente">Non présenté</span>
                      <button className="med-btn-vu med-btn-retard" onClick={(e) => { e.stopPropagation(); marquerRdvVu(r.id); }}>
                        Marquer présent (retard)
                      </button>
                    </div>
                  ) : (
                    <button className="med-btn-vu" onClick={(e) => { e.stopPropagation(); marquerRdvVu(r.id); }}>
                      Marquer consulté
                    </button>
                  )}
                </div>
                {ouvert && <InfosPatientDetail infos={r.infosPatient} />}
              </div>
            );
          })
        }
      </div>

      <div className="med-section">
        <h2 className="med-section-titre">Tickets ({donnees.tickets.length})</h2>
        {donnees.tickets.length === 0
          ? <p className="med-message-petit">Aucun ticket aujourd'hui.</p>
          : donnees.tickets.map((t) => {
            const cle = `ticket-${t.id}`;
            const ouvert = patientOuvert === cle;

            return (
              <div key={t.id} className="med-carte-patient-expandable">
                <div className="med-carte-patient" onClick={() => togglePatient(cle)} style={{ cursor: "pointer" }}>
                  <span className="med-heure-patient">N°{t.position}</span>
                  <span className="med-nom-patient">{t.patient}</span>
                  {t.statut === "termine"
                    ? <span className="med-badge-termine">Consulté ✓</span>
                    : <button className="med-btn-vu" onClick={(e) => { e.stopPropagation(); marquerTicketVu(t.id); }}>Marquer consulté</button>
                  }
                </div>
                {ouvert && <InfosPatientDetail infos={t.infosPatient} />}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default FileDuJourMedecin;