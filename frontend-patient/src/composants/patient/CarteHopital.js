import { useState } from "react";
import "./CarteHopital.css";
import { IconePin, IconeTelephone } from "../commun/Icones";
import photoParDefaut from "../../ressources/hopital-placeholder.jpg";
import { Link } from "react-router-dom";

const NOMBRE_MAX_VISIBLE = 4;

function CarteHopital({ id, nom, adresse, telephone, specialites, urgences24h, photo }) {
  const [etendue, setEtendue] = useState(false);
  const aPlusDeSpecialites = specialites.length > NOMBRE_MAX_VISIBLE;
  const specialitesAffichees = etendue ? specialites : specialites.slice(0, NOMBRE_MAX_VISIBLE);

  return (
    <div className={`carte-hopital ${etendue ? "carte-hopital-etendue" : ""}`}>
      <div className="carte-hopital-photo-wrapper">
        <img src={photo || photoParDefaut} alt={nom} className="carte-hopital-photo" />
        {urgences24h && <span className="carte-hopital-badge">Urgences 24h/24</span>}
      </div>

      <div className="carte-hopital-contenu">
        <h3 className="carte-hopital-nom">{nom}</h3>
        <p className="carte-hopital-adresse"><IconePin taille={20} /> {adresse}</p>
        <p className="carte-hopital-telephone"><IconeTelephone taille={20} /> {telephone}</p>

        <div className="carte-hopital-specialites">
          {specialitesAffichees.map((s, index) => (
            <span key={index} className="carte-hopital-tag">{s}</span>
          ))}
        </div>

        {aPlusDeSpecialites && (
          <button
            className="carte-hopital-voir-plus"
            onClick={() => setEtendue(!etendue)}
          >
            {etendue ? "Voir moins ▲" : "Voir plus de spécialités ▼"}
          </button>
        )}
      </div>

      <Link to={`/hopitaux/${id}`} className="carte-hopital-btn">Voir détails</Link>
    </div>
  );
}

export default CarteHopital;