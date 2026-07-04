import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Responsable.css";

function TicketsResponsable() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/staff/responsable/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setTickets(r.data))
      .catch((e) => console.error(e))
      .finally(() => setChargement(false));
  }, [token]);

  const libelleStatut = (t) => {
    if (t.statut === "termine") return { texte: "Consulté ✓", classe: "resp-badge-confirme" };

    // Si le ticket est du jour et que l'heure de fermeture est passée
    const aujourdHui = new Date().toISOString().split("T")[0];
    if (t.date === aujourdHui && t.heureFin) {
      const maintenant = new Date();
      const [h, m] = t.heureFin.split(":").map(Number);
      const heureFermeture = new Date();
      heureFermeture.setHours(h, m, 0, 0);
      if (maintenant >= heureFermeture) {
        return { texte: "Non consulté", classe: "resp-badge-rejete" };
      }
    }

    return { texte: "En attente", classe: "resp-badge-attente" };
  };

  return (
    <div>
      <h1 className="resp-titre">Tickets</h1>
      <p className="resp-soustitre">Historique complet des tickets de votre service.</p>

      {chargement ? <p className="resp-message">Chargement...</p> : (
        tickets.length === 0
          ? <p className="resp-message">Aucun ticket pour l'instant.</p>
          : tickets.map((t) => {
            const l = libelleStatut(t);
            return (
              <div key={t.id} className="resp-carte-rdv">
                <div className="resp-rdv-entete">
                  <p className="resp-rdv-patient">{t.nomPatient}</p>
                  <span className={l.classe}>{l.texte}</span>
                </div>
                <p className="resp-rdv-date">
                  {t.date} — N°{t.position}
                </p>
              </div>
            );
          })
      )}
    </div>
  );
}

export default TicketsResponsable;