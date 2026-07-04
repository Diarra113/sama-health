import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Responsable.css";

const JOURS = [
  { v: 1, l: "Lun" }, { v: 2, l: "Mar" }, { v: 3, l: "Mer" },
  { v: 4, l: "Jeu" }, { v: 5, l: "Ven" }, { v: 6, l: "Sam" }, { v: 0, l: "Dim" }
];

function ParametresService() {
  const { token } = useAuth();
  const [affectation, setAffectation] = useState(null);
  const [form, setForm] = useState({});
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function charger() {
      try {
        const aff = await axios.get("http://localhost:5000/api/staff/mon-affectation", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAffectation(aff.data);
        const hop = await axios.get(`http://localhost:5000/api/hopitaux/${aff.data.hopitalId}`);
        const spec = hop.data.specialitesAvecId.find((s) => s.id === aff.data.specialiteId);
        setForm(spec || {});
      } catch (e) {
        console.error(e);
        setErreur("Impossible de charger les paramètres.");
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [token]);

  const champChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleJour = (jour) => {
    const joursActuels = form.joursOuverture || [];
    setForm({
      ...form,
      joursOuverture: joursActuels.includes(jour)
        ? joursActuels.filter((j) => j !== jour)
        : [...joursActuels, jour],
    });
  };

  const enregistrer = async () => {
    setMessage(""); setErreur("");
    try {
      await axios.put(
        `http://localhost:5000/api/hopitaux/${affectation.hopitalId}/specialites/${affectation.specialiteId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Paramètres enregistrés avec succès.");
    } catch (e) {
      setErreur("❌ Erreur lors de l'enregistrement. Réessayez.");
    }
  };

  if (chargement) return <p className="resp-message">Chargement...</p>;
  if (erreur && !affectation) return <p className="resp-message">{erreur}</p>;
  if (!affectation) return <p className="resp-message">Impossible de charger votre affectation.</p>;

  return (
    <div>
      <h1 className="resp-titre">Paramètres du service</h1>
      <p className="resp-soustitre">{affectation.specialite} — {affectation.hopital}</p>

      <div className="resp-carte-parametres">

        <h3 className="resp-sous-titre-section">📋 Quotas journaliers</h3>
        <div className="resp-grille-params">
          <div>
            <label className="resp-label">Quota de rendez-vous par jour</label>
            <input
              type="number"
              name="quotaJournalier"
              value={form.quotaJournalier || ""}
              onChange={champChange}
              className="resp-input"
              placeholder="Ex: 15"
            />
          </div>
          <div>
            <label className="resp-label">Quota de tickets du jour</label>
            <input
              type="number"
              name="quotaTickets"
              value={form.quotaTickets || ""}
              onChange={champChange}
              className="resp-input"
              placeholder="Ex: 20"
            />
          </div>
        </div>

        <h3 className="resp-sous-titre-section">💰 Tarification</h3>
        <div className="resp-grille-params">
          <div>
            <label className="resp-label">Tarif de consultation (FCFA)</label>
            <input
              type="number"
              name="tarifConsultation"
              value={form.tarifConsultation || ""}
              onChange={champChange}
              className="resp-input"
              placeholder="Ex: 5000"
            />
          </div>
          <div>
            <label className="resp-label">Durée de validité d'un ticket (jours)</label>
            <input
              type="number"
              name="dureeValiditeJours"
              value={form.dureeValiditeJours || ""}
              onChange={champChange}
              className="resp-input"
              placeholder="Ex: 15"
            />
          </div>
        </div>

        <h3 className="resp-sous-titre-section">⏰ Horaires</h3>
        <div className="resp-grille-params">
          <div>
            <label className="resp-label">Heure de début</label>
            <input
              type="time"
              name="heureDebut"
              value={form.heureDebut?.slice(0, 5) || ""}
              onChange={champChange}
              className="resp-input"
            />
          </div>
          <div>
            <label className="resp-label">Heure de fin</label>
            <input
              type="time"
              name="heureFin"
              value={form.heureFin?.slice(0, 5) || ""}
              onChange={champChange}
              className="resp-input"
            />
          </div>
          <div>
            <label className="resp-label">Début pause déjeuner</label>
            <input
              type="time"
              name="heurePauseDebut"
              value={form.heurePauseDebut?.slice(0, 5) || ""}
              onChange={champChange}
              className="resp-input"
            />
          </div>
          <div>
            <label className="resp-label">Fin pause déjeuner</label>
            <input
              type="time"
              name="heurePauseFin"
              value={form.heurePauseFin?.slice(0, 5) || ""}
              onChange={champChange}
              className="resp-input"
            />
          </div>
          <div>
            <label className="resp-label">Durée moyenne d'une consultation (min)</label>
            <input
              type="number"
              name="dureeMoyenneConsultation"
              value={form.dureeMoyenneConsultation || ""}
              onChange={champChange}
              className="resp-input"
              placeholder="Ex: 15"
            />
          </div>
        </div>

        <h3 className="resp-sous-titre-section">📅 Jours d'ouverture</h3>
        <div className="resp-jours-grille">
          {JOURS.map((j) => (
            <button
              key={j.v}
              className={`resp-jour-btn ${(form.joursOuverture || []).includes(j.v) ? "resp-jour-actif" : ""}`}
              onClick={() => toggleJour(j.v)}
            >
              {j.l}
            </button>
          ))}
        </div>

        {message && <p className="resp-message-succes">{message}</p>}
        {erreur && <p className="resp-erreur-inline">{erreur}</p>}

        <button className="resp-btn-enregistrer" onClick={enregistrer}>
          Enregistrer les paramètres
        </button>
      </div>
    </div>
  );
}

export default ParametresService;