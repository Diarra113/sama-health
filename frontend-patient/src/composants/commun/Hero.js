import { useState } from "react";
import "./Hero.css";

function Hero() {
  const [chargee, setChargee] = useState(false);

  return (
    <section className="hero">
      <img
        src={require("../../ressources/hero-temp.png")}
        alt="Couloir d'hôpital"
        className={`hero-image ${chargee ? "hero-image-chargee" : ""}`}
        onLoad={() => setChargee(true)}
      />
      <div className={`hero-overlay ${chargee ? "hero-overlay-visible" : ""}`}>
        <h1 className="hero-title">Votre plateforme de soins sans attente</h1>
        <p className="hero-subtitle">
          Prenez rendez-vous ou achetez votre ticket de consultation en ligne,
          dans les hôpitaux publics de Dakar.
        </p>
      </div>
    </section>
  );
}

export default Hero;