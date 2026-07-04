import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Calendrier.css";

const MOIS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const JOURS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function formaterDateISO(date) {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

function Calendrier({ joursOuverture = [1,2,3,4,5], dateSelectionnee, onSelectionDate, hopitalId, specialiteId }) {
  const { token } = useAuth();
  const [moisAffiche, setMoisAffiche] = useState(new Date());
  const [joursSatures, setJoursSatures] = useState([]);

  const annee = moisAffiche.getFullYear();
  const mois = moisAffiche.getMonth();

  useEffect(() => {
    if (!hopitalId || !specialiteId) return;

    async function chargerSaturation() {
      try {
        const reponse = await axios.get(
          `http://localhost:5000/api/rendez-vous/jours-satures?hopitalId=${hopitalId}&specialiteId=${specialiteId}&annee=${annee}&mois=${mois + 1}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJoursSatures(reponse.data.joursSatures || []);
      } catch (e) {
        console.error("Erreur jours saturés:", e);
      }
    }
    chargerSaturation();
  }, [hopitalId, specialiteId, annee, mois, token]);

  const premierJourMois = new Date(annee, mois, 1);
  const decalage = (premierJourMois.getDay() + 6) % 7;
  const nombreJoursMois = new Date(annee, mois + 1, 0).getDate();

  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);

  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let jour = 1; jour <= nombreJoursMois; jour++) cases.push(jour);

  return (
    <div className="calendrier">
      <div className="calendrier-entete">
        <button className="calendrier-nav" onClick={() => setMoisAffiche(new Date(annee, mois - 1, 1))}>←</button>
        <span className="calendrier-titre">{MOIS_FR[mois]} {annee}</span>
        <button className="calendrier-nav" onClick={() => setMoisAffiche(new Date(annee, mois + 1, 1))}>→</button>
      </div>

      <div className="calendrier-jours-semaine">
        {JOURS_FR.map((j) => <span key={j} className="calendrier-jour-label">{j}</span>)}
      </div>

      <div className="calendrier-grille">
        {cases.map((jour, index) => {
          if (jour === null) return <div key={index} className="calendrier-case-vide"></div>;

          const dateCase = new Date(annee, mois, jour);
          dateCase.setHours(0, 0, 0, 0);
          const jourSemaineJS = dateCase.getDay();
          const dateISO = formaterDateISO(dateCase);

          const estPasse = dateCase < aujourdHui;
          const estFerme = !joursOuverture.includes(jourSemaineJS);
          const estSature = joursSatures.includes(dateISO);
          const indisponible = estPasse || estFerme || estSature;
          const estSelectionnee = dateISO === dateSelectionnee;

          let classeExtra = "";
          if (estSature && !estPasse && !estFerme) classeExtra = "calendrier-case-saturee";
          else if (indisponible) classeExtra = "calendrier-case-indisponible";

          return (
            <button
              key={index}
              className={`calendrier-case ${classeExtra} ${estSelectionnee ? "calendrier-case-selectionnee" : ""}`}
              disabled={indisponible}
              onClick={() => onSelectionDate(dateISO)}
              title={estSature ? "Complet — quota atteint" : estFerme ? "Fermé" : estPasse ? "Date passée" : ""}
            >
              {jour}
            </button>
          );
        })}
      </div>

      <div className="calendrier-legende">
        <span className="leg-item"><span className="leg-couleur leg-saturee"></span>Complet</span>
        <span className="leg-item"><span className="leg-couleur leg-ferme"></span>Fermé / Passé</span>
      </div>
    </div>
  );
}

export default Calendrier;