import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Responsable.css";

function FileDuJour() {
  const { token } = useAuth();
  const [donnees, setDonnees] = useState({ rendezVous: [], tickets: [] });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/staff/responsable/file-du-jour", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setDonnees(r.data))
      .catch((e) => console.error(e))
      .finally(() => setChargement(false));
  }, [token]);

  const libelleStatutRdv = (r) => {
  if (r.statut === "termine") return { texte: "Consulté ✓", classe: "resp-badge-confirme" };
  const maintenant = new Date();
  const heureRdv = new Date();
  const [h, m] = r.heure.split(":").map(Number);
  heureRdv.setHours(h, m, 0, 0);
  if (heureRdv < maintenant) return { texte: "Non présenté", classe: "resp-badge-rejete" };
  return { texte: "Confirmé — en attente", classe: "resp-badge-attente" };
};

  const libelleStatutTicket = (t) => {
    if (t.statut === "termine") return { texte: "Consulté ✓", classe: "resp-badge-confirme" };
    if (t.statut === "valide") return { texte: "Présent", classe: "resp-badge-confirme" };
    return { texte: "En attente", classe: "resp-badge-attente" };
  };

  return (
    <div>
      <h1 className="resp-titre">File du jour</h1>
      <p className="resp-soustitre">Tous les patients attendus aujourd'hui pour votre service.</p>

      {chargement ? <p className="resp-message">Chargement...</p> : (
        <>
          <div className="resp-section">
            <h2 className="resp-section-titre">
              Rendez-vous ({donnees.rendezVous.length}) —{" "}
              {donnees.rendezVous.filter((r) => r.statut === "termine").length} consultés
            </h2>
            {donnees.rendezVous.length === 0 && <p className="resp-message-petit">Aucun rendez-vous confirmé aujourd'hui.</p>}
            {donnees.rendezVous.map((r) => {
              const l = libelleStatutRdv(r);
              return (
                <div key={r.id} className={`resp-carte-file ${r.statut === "termine" ? "resp-carte-file-terminee" : ""}`}>
                  <span className="resp-heure-file">{r.heure?.slice(0, 5)}</span>
                  <span className="resp-patient-file">{r.patient}</span>
                  <span className={l.classe}>{l.texte}</span>
                </div>
              );
            })}
          </div>

          <div className="resp-section">
            <h2 className="resp-section-titre">
              Tickets ({donnees.tickets.length}) —{" "}
              {donnees.tickets.filter((t) => t.statut === "termine").length} consultés
            </h2>
            {donnees.tickets.length === 0 && <p className="resp-message-petit">Aucun ticket aujourd'hui.</p>}
            {donnees.tickets.map((t) => {
              const l = libelleStatutTicket(t);
              return (
                <div key={t.id} className={`resp-carte-file ${t.statut === "termine" ? "resp-carte-file-terminee" : ""}`}>
                  <span className="resp-heure-file">N°{t.position}</span>
                  <span className="resp-patient-file">{t.patient}</span>
                  <span className={l.classe}>{l.texte}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default FileDuJour;