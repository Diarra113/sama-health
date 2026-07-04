import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CarteHopital from "./CarteHopital";
import "./ListeHopitaux.css";

function ListeHopitaux({ limite, voirTout, hopitaux: hopitauxFiltres }) {
  const [hopitaux, setHopitaux] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function chargerHopitaux() {
      try {
        const reponse = await axios.get("http://localhost:5000/api/hopitaux");
        setHopitaux(reponse.data);
      } catch (erreur) {
        console.error(erreur);
      } finally {
        setChargement(false);
      }
    }
    chargerHopitaux();
  }, []);

  const source = hopitauxFiltres || hopitaux;
  const hopitauxAffiches = limite ? source.slice(0, limite) : source;

  if (chargement && !hopitauxFiltres) {
    return <p className="liste-hopitaux-chargement">Chargement des hôpitaux...</p>;
  }

  return (
    <div className="liste-hopitaux-section">
      <div className="liste-hopitaux">
        {hopitauxAffiches.length === 0 ? (
          <p className="liste-hopitaux-vide">Aucun hôpital ne correspond à votre recherche.</p>
        ) : (
          hopitauxAffiches.map((h) => (
            <CarteHopital
              key={h.id}
              id={h.id}
              nom={h.nom}
              adresse={h.adresse}
              telephone={h.telephone}
              specialites={h.specialites}
              urgences24h={h.urgences24h}
              photo={h.photo}
            />
          ))
        )}
      </div>

      {voirTout && (
        <div className="liste-hopitaux-voir-tout">
          <Link to="/hopitaux" className="liste-hopitaux-voir-tout-btn">
            Voir tous les hôpitaux publics
          </Link>
        </div>
      )}
    </div>
  );
}

export default ListeHopitaux;