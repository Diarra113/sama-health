import { useState, useEffect } from "react";
import axios from "axios";
import BarreRecherche from "../composants/patient/BarreRecherche";
import ListeHopitaux from "../composants/patient/ListeHopitaux";
import SectionContact from "../composants/commun/SectionContact";
import "./Hopitaux.css";

function Hopitaux() {
  const [hopitaux, setHopitaux] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [zone, setZone] = useState("");

  useEffect(() => {
    async function chargerHopitaux() {
      try {
        const reponse = await axios.get("http://localhost:5000/api/hopitaux");
        setHopitaux(reponse.data);
      } catch (erreur) {
        console.error(erreur);
      }
    }
    chargerHopitaux();
  }, []);

  const rechercheActive = recherche !== "" || zone !== "";

  const hopitauxFiltres = hopitaux.filter((h) => {
    const correspondRecherche =
      recherche === "" ||
      h.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      h.specialites.some((s) => s.toLowerCase().includes(recherche.toLowerCase()));

    const correspondZone =
      zone === "" || h.adresse.toLowerCase().includes(zone.toLowerCase());

    return correspondRecherche && correspondZone;
  });

  return (
    <div className="page-hopitaux">
      <div className="page-hopitaux-entete">
        <div className="forme-decorative forme-1"></div>
        <div className="forme-decorative forme-2"></div>
        <h1 className="page-hopitaux-titre">Annuaire des hôpitaux publics de Dakar</h1>
        <p className="page-hopitaux-soustitre">{hopitaux.length} hôpitaux référencés</p>
        <p className="page-hopitaux-soustitre">Recherchez par nom, spécialité ou zone</p>

        <svg className="page-hopitaux-vague" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,10 C360,90 1080,0 1440,40 L1440,100 L0,100 Z" fill="#ffffff" />
        </svg>
      </div>

      <BarreRecherche
        recherche={recherche}
        onRechercheChange={setRecherche}
        zone={zone}
        onZoneChange={setZone}
      />

      {rechercheActive && (
        <p className="page-hopitaux-compteur">
          {hopitauxFiltres.length} résultat{hopitauxFiltres.length !== 1 ? "s" : ""}
        </p>
      )}

      <ListeHopitaux hopitaux={rechercheActive ? hopitauxFiltres : hopitaux} />
      <SectionContact />
    </div>
  );
}

export default Hopitaux;