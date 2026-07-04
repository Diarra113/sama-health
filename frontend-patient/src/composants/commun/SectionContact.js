import { Link } from "react-router-dom";
import { IconeTelephone, IconeEmail, IconePin } from "./Icones";
import "./SectionContact.css";

function SectionContact() {
  return (
    <section className="section-contact">
      <div className="section-contact-grille">
        <div className="section-contact-bloc">
          <h3 className="section-contact-titre">SAMA Health</h3>
          <p>
            Votre plateforme de soins sans attente. SAMA Health s'engage à vous offrir un accès simplifié et rapide aux soins de santé publics à Dakar.
          </p>
        </div>

        <div className="section-contact-bloc">
          <h3 className="section-contact-titre">Liens rapides</h3>
          <Link to="/hopitaux">Annuaire des hôpitaux</Link>
          <Link to="/a-propos">À propos de nous</Link>
          <Link to="/pourquoi-sama-health">Pourquoi SAMA Health ?</Link>
          <Link to="/connexion">Connexion</Link>
        </div>

        <div className="section-contact-bloc">
          <h3 className="section-contact-titre">Nous joindre</h3>
          <p className="section-contact-ligne-icone"><IconeTelephone taille={22} /> +221 78 446 01 61</p>
          <p className="section-contact-ligne-icone"><IconeEmail taille={22} /> samahealth221@gmail.com</p>
          <p className="section-contact-ligne-icone"><IconePin taille={22} /> Dakar, Sénégal</p>
        </div>

        <div className="section-contact-bloc section-contact-urgence">
          <h3 className="section-contact-titre-urgence">En cas d'urgence</h3>
          <p className="section-contact-ligne-icone"><IconeTelephone taille={20} /> SAMU — 15 / 1515</p>
          <p className="section-contact-ligne-icone"><IconeTelephone taille={20} /> Police Secours — 17</p>
          <p className="section-contact-ligne-icone"><IconeTelephone taille={20} /> Sapeurs-Pompiers — 18</p>
          <p className="section-contact-ligne-icone"><IconeTelephone taille={20} /> Numéro Vert — 800 00 50 50</p>
        </div>
      </div>
    </section>
  );
}

export default SectionContact;