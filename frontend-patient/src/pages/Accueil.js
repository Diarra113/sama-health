import { useState, useEffect } from "react";
import axios from "axios";
import Hero from "../composants/commun/Hero";
import BarreRecherche from "../composants/patient/BarreRecherche";
import ListeHopitaux from "../composants/patient/ListeHopitaux";
import SectionContact from "../composants/commun/SectionContact";

function Accueil() {
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
    <div>
      <Hero />
      <BarreRecherche
        recherche={recherche}
        onRechercheChange={setRecherche}
        zone={zone}
        onZoneChange={setZone}
      />

      {rechercheActive && (
        <p className="accueil-resultats-compteur">
          {hopitauxFiltres.length} résultat{hopitauxFiltres.length !== 1 ? "s" : ""} trouvé{hopitauxFiltres.length !== 1 ? "s" : ""}
        </p>
      )}

      <ListeHopitaux
        hopitaux={hopitauxFiltres}
        limite={rechercheActive ? null : 6}
        voirTout={!rechercheActive}
      />

      <SectionContact />
    </div>
  );
}

export default Accueil;