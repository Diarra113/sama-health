import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexte/AuthContext";
import { IconeDeconnexion, IconeMenu, IconeCroix } from "./Icones";
import "./Header.css";

function Header() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const sortir = () => {
    deconnecter();
    setMenuOuvert(false);
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <img src={require("../../ressources/logo.png")} alt="SAMA Health" className="header-logo-img" />
      </Link>

      {/* Desktop */}
      <div className="header-right">
        <nav className="header-nav">
          <Link to="/" className="header-link">Accueil</Link>
          <Link to="/hopitaux" className="header-link">Hôpitaux</Link>
          <div className="header-dropdown">
            <button className="header-link header-dropdown-btn">À propos</button>
            <div className="header-dropdown-content">
              <Link to="/a-propos">À propos de nous</Link>
              <Link to="/pourquoi-sama-health">Pourquoi SAMA Health ?</Link>
            </div>
          </div>
        </nav>

        {utilisateur ? (
          <div className="header-dropdown">
            <button className="header-compte-btn">
              <span className="header-compte-avatar">
                {utilisateur.prenom?.[0]}{utilisateur.nom?.[0]}
              </span>
            </button>
            <div className="header-dropdown-content header-dropdown-content-droite">
              <Link to="/espace-patient">Mon espace</Link>
              <button className="header-dropdown-deconnexion" onClick={sortir}>
                <IconeDeconnexion taille={16} /> Déconnexion
              </button>
            </div>
          </div>
        ) : (
          <Link to="/connexion" className="header-btn-connexion">Connexion</Link>
        )}
      </div>

      {/* Bouton hamburger mobile */}
      <button className="header-hamburger" onClick={() => setMenuOuvert(!menuOuvert)}>
        {menuOuvert ? <IconeCroix taille={26} /> : <IconeMenu taille={26} />}
      </button>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="header-menu-mobile">
          <Link to="/" className="header-mobile-lien" onClick={() => setMenuOuvert(false)}>Accueil</Link>
          <Link to="/hopitaux" className="header-mobile-lien" onClick={() => setMenuOuvert(false)}>Hôpitaux</Link>
          <Link to="/a-propos" className="header-mobile-lien" onClick={() => setMenuOuvert(false)}>À propos de nous</Link>
          <Link to="/pourquoi-sama-health" className="header-mobile-lien" onClick={() => setMenuOuvert(false)}>Pourquoi SAMA Health ?</Link>
          {utilisateur ? (
            <>
              <Link to="/espace-patient" className="header-mobile-lien" onClick={() => setMenuOuvert(false)}>Mon espace</Link>
              <button className="header-mobile-deconnexion" onClick={sortir}>
                <IconeDeconnexion taille={16} /> Déconnexion
              </button>
            </>
          ) : (
            <Link to="/connexion" className="header-mobile-btn-connexion" onClick={() => setMenuOuvert(false)}>Connexion</Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;