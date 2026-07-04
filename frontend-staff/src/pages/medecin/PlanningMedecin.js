import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Medecin.css";

const JOURS_SEMAINE = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function PlanningMedecin() {
  const { token } = useAuth();
  const enTetes = { headers: { Authorization: `Bearer ${token}` } };

  const [plannings, setPlannings] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [formPlanning, setFormPlanning] = useState({ dateDebut: "", dateFin: "", commentaire: "" });
  const [erreurPlanning, setErreurPlanning] = useState("");
  const [messagePlanning, setMessagePlanning] = useState("");
  const [dateAbsence, setDateAbsence] = useState("");
  const [erreurAbsence, setErreurAbsence] = useState("");

  const charger = () => {
    Promise.all([
      axios.get("http://localhost:5000/api/staff/medecin/planning", enTetes),
      axios.get("http://localhost:5000/api/staff/medecin/absences", enTetes),
    ]).then(([r1, r2]) => {
      setPlannings(r1.data);
      setAbsences(r2.data);
    }).catch((e) => console.error(e)).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [token]);

  const champPlanningChange = (e) => setFormPlanning({ ...formPlanning, [e.target.name]: e.target.value });

  const soumettrePlanning = async () => {
    setErreurPlanning(""); setMessagePlanning("");
    if (!formPlanning.dateDebut || !formPlanning.dateFin) {
      setErreurPlanning("Les dates de début et de fin sont obligatoires.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/staff/medecin/planning", formPlanning, enTetes);
      setMessagePlanning("Planning soumis — en attente de validation par votre responsable.");
      setFormPlanning({ dateDebut: "", dateFin: "", commentaire: "" });
      charger();
    } catch (e) {
      setErreurPlanning(e.response?.data?.message || "Erreur lors de l'envoi.");
    }
  };

  const soumettreAbsence = async () => {
    setErreurAbsence("");
    if (!dateAbsence) { setErreurAbsence("Choisissez une date."); return; }
    try {
      await axios.post("http://localhost:5000/api/staff/medecin/absences", { date: dateAbsence }, enTetes);
      setDateAbsence("");
      charger();
    } catch (e) {
      setErreurAbsence(e.response?.data?.message || "Erreur.");
    }
  };

  const annulerAbsence = async (id) => {
    await axios.put(`http://localhost:5000/api/staff/medecin/absences/${id}/annuler`, {}, enTetes);
    charger();
  };

  const libellePlanning = (s) =>
    s === "valide" ? { t: "Validé", c: "med-badge-valide" } :
    s === "rejete" ? { t: "Rejeté", c: "med-badge-rejete" } :
    { t: "En attente de validation", c: "med-badge-en_attente" };

  const formaterDate = (d) => {
    if (!d) return "";
    const date = new Date(d + "T00:00:00");
    return `${JOURS_SEMAINE[date.getDay()]} ${date.getDate().toString().padStart(2, "0")}/${(date.getMonth()+1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <div>
      <h1 className="med-titre">Mon planning & absences</h1>
      <p className="med-soustitre">Soumettez vos disponibilités et signalez vos absences à votre responsable.</p>

      <div className="med-deux-colonnes">
        <div className="med-colonne-large">
          <div className="med-carte-formulaire med-carte-pleine-largeur">
            <h2 className="med-section-titre">📅 Soumettre un planning</h2>
            <p className="med-aide-absence">Indiquez la période durant laquelle vous serez disponible.</p>

            <div className="med-ligne-champs">
              <div>
                <label className="med-label">Du</label>
                <input type="date" name="dateDebut" value={formPlanning.dateDebut} onChange={champPlanningChange} className="med-input" />
              </div>
              <div>
                <label className="med-label">Au</label>
                <input type="date" name="dateFin" value={formPlanning.dateFin} onChange={champPlanningChange} className="med-input" />
              </div>
            </div>

            <label className="med-label">Commentaire (optionnel)</label>
            <textarea name="commentaire" value={formPlanning.commentaire} onChange={champPlanningChange} className="med-input med-textarea" placeholder="Ex: Je serai présent, pause déjeuner 12h-13h..." />

            {messagePlanning && <p className="med-message-succes">{messagePlanning}</p>}
            {erreurPlanning && <p className="med-erreur">{erreurPlanning}</p>}
            <button className="med-btn-soumettre" onClick={soumettrePlanning}>Soumettre le planning</button>
          </div>

          <div className="med-carte-formulaire med-carte-pleine-largeur">
            <h2 className="med-section-titre">📋 Historique de mes soumissions</h2>
            {chargement ? <p className="med-message">Chargement...</p> : (
              plannings.length === 0
                ? <p className="med-message-petit">Aucun planning soumis pour l'instant.</p>
                : plannings.map((p) => {
                  const l = libellePlanning(p.statut);
                  return (
                    <div key={p.id} className="med-carte-planning">
                      <div className="med-planning-entete">
                        <div>
                          <p className="med-planning-dates">
                            {formaterDate(p.dateDebut)} → {formaterDate(p.dateFin)}
                          </p>
                          {p.commentaire && <p className="med-planning-commentaire">💬 {p.commentaire}</p>}
                          {p.statut === "rejete" && p.motifRejet && <p className="med-planning-motif">❌ Motif : {p.motifRejet}</p>}
                        </div>
                        <span className={l.c}>{l.t}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        <div className="med-colonne-etroite">
          <div className="med-carte-formulaire">
            <h2 className="med-section-titre">🚫 Signaler une absence</h2>
            <p className="med-aide-absence">En cas d'imprévu, indiquez la date où vous serez absent — votre responsable en sera informé.</p>
            <label className="med-label">Date d'absence</label>
            <input type="date" value={dateAbsence} onChange={(e) => setDateAbsence(e.target.value)} className="med-input" min={new Date().toISOString().split("T")[0]} />
            {erreurAbsence && <p className="med-erreur">{erreurAbsence}</p>}
            <button className="med-btn-absence-petit" onClick={soumettreAbsence}>Signaler cette absence</button>
          </div>

          <div className="med-carte-formulaire">
            <h3 className="med-sous-titre-absences">📆 Mes absences à venir</h3>
            {absences.length === 0
              ? <p className="med-message-petit">Aucune absence signalée.</p>
              : absences.map((a) => (
                <div key={a.id} className="med-ligne-absence">
                  <span>{formaterDate(a.date)}</span>
                  <button className="med-btn-annuler-petit" onClick={() => annulerAbsence(a.id)}>Annuler</button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanningMedecin;