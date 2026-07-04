import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Responsable.css";

function RendezVousResponsable() {
  const { token } = useAuth();
  const [liste, setListe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [motifs, setMotifs] = useState({});
  const [enCours, setEnCours] = useState({});

  const charger = () => {
    axios.get("http://localhost:5000/api/staff/responsable/rendez-vous", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setListe(r.data))
      .catch((e) => console.error(e))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    if (!token) return;
    charger();
  }, [token]);

  const traiter = async (id, statut) => {
    setEnCours({ ...enCours, [id]: true });
    try {
      await axios.put(
        `http://localhost:5000/api/staff/responsable/rendez-vous/${id}`,
        { statut, motifRejet: motifs[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      charger();
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors du traitement.");
    } finally {
      setEnCours({ ...enCours, [id]: false });
    }
  };

  const libelle = (r) => {
    if (r.statut === "termine") return { t: "Consulté ✓", c: "resp-badge-confirme" };
    if (r.statut === "rejete") return { t: "Rejeté", c: "resp-badge-rejete" };
    if (r.statut === "confirme") {
      const dateHeure = new Date(`${r.dateRDV}T${r.heureRDV?.slice(0, 5)}`);
      if (dateHeure <= new Date()) return { t: "Non présenté", c: "resp-badge-rejete" };
      if (r.paye) return { t: "Confirmé & Payé ✓", c: "resp-badge-confirme" };
      return { t: "En attente de paiement", c: "resp-badge-attente" };
    }
    return { t: "En attente de validation", c: "resp-badge-attente" };
  };

  return (
    <div>
      <h1 className="resp-titre">Rendez-vous</h1>
      <p className="resp-soustitre">Tous les rendez-vous de votre service. Confirmez ou rejetez les demandes en attente.</p>

      {chargement ? (
        <p className="resp-message">Chargement...</p>
      ) : liste.length === 0 ? (
        <p className="resp-message">Aucun rendez-vous pour l'instant.</p>
      ) : (
        liste.map((r) => {
          const l = libelle(r);
          return (
            <div key={r.id} className="resp-carte-rdv">
              <div className="resp-rdv-entete">
                <p className="resp-rdv-patient">{r.nomPatient}</p>
                <span className={l.c}>{l.t}</span>
              </div>
              <p className="resp-rdv-date">{r.dateRDV} à {r.heureRDV?.slice(0, 5)}</p>

              {r.statut === "en_attente" && (
                <div className="resp-rdv-actions">
                  <input
                    type="text"
                    placeholder="Motif si rejet (optionnel)"
                    className="resp-input-motif"
                    onChange={(e) => setMotifs({ ...motifs, [r.id]: e.target.value })}
                  />
                  <button
                    className="resp-btn-confirmer"
                    onClick={() => traiter(r.id, "confirme")}
                    disabled={enCours[r.id]}
                  >
                    {enCours[r.id] ? "..." : "Confirmer"}
                  </button>
                  <button
                    className="resp-btn-rejeter"
                    onClick={() => traiter(r.id, "rejete")}
                    disabled={enCours[r.id]}
                  >
                    {enCours[r.id] ? "..." : "Rejeter"}
                  </button>
                </div>
              )}

              {r.statut === "confirme" && !r.paye && new Date(`${r.dateRDV}T${r.heureRDV?.slice(0, 5)}`) > new Date() && (
                <p className="resp-mention-paiement">
                  Le patient doit encore effectuer le paiement pour finaliser son rendez-vous.
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default RendezVousResponsable;