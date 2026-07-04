import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./SelecteurCreneaux.css";

function SelecteurCreneaux({ hopitalId, specialiteId, date, heureSelectionnee, onSelectionHeure }) {
  const { token } = useAuth();
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!date) return;
    setChargement(true);
    setDonnees(null);
    axios.get(
      `http://localhost:5000/api/rendez-vous/disponibilites?hopitalId=${hopitalId}&specialiteId=${specialiteId}&date=${date}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((r) => setDonnees(r.data))
     .catch((e) => console.error(e))
     .finally(() => setChargement(false));
  }, [hopitalId, specialiteId, date, token]);

  const estPasse = (heure) => {
    const aujourdHui = new Date().toISOString().split("T")[0];
    if (date !== aujourdHui) return false;
    const maintenant = new Date();
    const [h, m] = heure.split(":").map(Number);
    const heureDate = new Date();
    heureDate.setHours(h, m, 0, 0);
    return heureDate <= maintenant;
  };

  if (!date) return <p className="sc-message">Choisissez d'abord une date dans le calendrier.</p>;
  if (chargement) return <p className="sc-message">Chargement des créneaux...</p>;
  if (!donnees) return null;
  if (donnees.ferme) return <p className="sc-message sc-message-ferme">Ce service est fermé ce jour-là. Choisissez une autre date.</p>;
  if (donnees.quotaRdvAtteint) return <p className="sc-message sc-message-ferme">⚠️ Le quota de rendez-vous est atteint pour cette date.</p>;

  return (
    <div className="sc-conteneur">
      {donnees.quotaRdvRestant !== null && (
        <p className="sc-quota">
          {donnees.quotaRdvRestant} place{donnees.quotaRdvRestant > 1 ? "s" : ""} disponible{donnees.quotaRdvRestant > 1 ? "s" : ""} sur {donnees.quotaJournalier}
        </p>
      )}

      <div className="sc-legende">
        <span className="sc-leg-item">
          <span className="sc-leg-couleur sc-leg-pris"></span>Déjà réservé
        </span>
      </div>

      <div className="sc-grille">
        {donnees.creneaux.map((c) => {
          const passe = estPasse(c.heure);
          const indisponible = !c.disponible || passe;

          let classeExtra = "";
          if (passe) classeExtra = "sc-creneau-passe";
          else if (!c.disponible) classeExtra = "sc-creneau-indisponible";

          return (
            <button
              key={c.heure}
              className={`sc-creneau ${classeExtra} ${heureSelectionnee === c.heure ? "sc-creneau-selectionne" : ""}`}
              disabled={indisponible}
              onClick={() => !indisponible && onSelectionHeure(c.heure)}
              title={passe ? "Créneau passé" : !c.disponible ? "Déjà réservé" : ""}
            >
              {c.heure}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SelecteurCreneaux;