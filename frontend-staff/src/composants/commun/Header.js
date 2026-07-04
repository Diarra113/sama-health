import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Header.css";

const LIBELLES_ROLE = {
  administrateur: "Administrateur",
  medecin: "Médecin",
  responsable: "Responsable de service",
  accueil: "Agent de guichet",
};

function Header() {
  const { utilisateur, token, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [affectation, setAffectation] = useState(null);

  useEffect(() => {
    async function charger() {
      if (utilisateur?.role === "administrateur") return;
      try {
        const reponse = await axios.get("http://localhost:5000/api/staff/mon-affectation", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAffectation(reponse.data);
      } catch (erreur) {
        console.error(erreur);
      }
    }
    if (utilisateur && token) charger();
  }, [utilisateur, token]);

  const sortir = () => {
    deconnecter();
    navigate("/");
  };

  return (
    <header className="header-staff">
      <img src={require("../../ressources/logo-blanc.png")} alt="SAMA Health" className="header-staff-logo" />

      <div className="header-staff-badge">
        <span className="header-staff-role">
          {utilisateur?.role === "medecin" && affectation?.fonction ? affectation.fonction : LIBELLES_ROLE[utilisateur?.role]}
        </span>
        {affectation?.specialite && <span className="header-staff-detail">{affectation.specialite}</span>}
        {affectation?.hopital && <span className="header-staff-detail">{affectation.hopital}</span>}
      </div>

      <div className="header-staff-compte">
        <div className="header-staff-avatar">
          {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
        </div>
        <div className="header-staff-nom-bloc">
          <p className="header-staff-nom">{utilisateur?.prenom} {utilisateur?.nom}</p>
          <button className="header-staff-deconnexion" onClick={sortir}>Déconnexion</button>
        </div>
      </div>
    </header>
  );
}

export default Header;