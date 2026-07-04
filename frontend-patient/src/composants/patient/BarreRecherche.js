import { useState } from "react";
import { IconeRecherche, IconePin } from "../commun/Icones";
import "./BarreRecherche.css";

function BarreRecherche({ recherche, onRechercheChange, zone, onZoneChange }) {
  const [message, setMessage] = useState("");

  const verifierEtRechercher = () => {
    if (recherche.trim() === "" && zone.trim() === "") {
      setMessage("Veuillez remplir au moins un champ pour lancer la recherche.");
    } else {
      setMessage("");
    }
  };

  const rechercheChange = (valeur) => {
    setMessage("");
    onRechercheChange(valeur);
  };

  const zoneChange = (valeur) => {
    setMessage("");
    onZoneChange(valeur);
  };

  return (
    <div className="barre-recherche-conteneur">
      <div className="barre-recherche">
        <div className="barre-recherche-champ">
          <span className="barre-recherche-icone"><IconeRecherche taille={24} /></span>
          <input
            type="text"
            placeholder="Hôpital, spécialité"
            value={recherche}
            onChange={(e) => rechercheChange(e.target.value)}
            className="barre-recherche-input"
          />
        </div>

        <div className="barre-recherche-separateur"></div>

        <div className="barre-recherche-champ">
          <span className="barre-recherche-icone"><IconePin taille={24} /></span>
          <input
            type="text"
            placeholder="Où ?"
            value={zone}
            onChange={(e) => zoneChange(e.target.value)}
            className="barre-recherche-input"
          />
        </div>

        <button className="barre-recherche-btn" onClick={verifierEtRechercher}>Rechercher</button>
      </div>

      {message && <p className="barre-recherche-message">{message}</p>}
    </div>
  );
}

export default BarreRecherche;