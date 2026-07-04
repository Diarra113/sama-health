import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { IconePin, IconeTelephone, IconeGlobe, IconeCalendrier, IconeHopital } from "../composants/commun/Icones";
import SectionContact from "../composants/commun/SectionContact";
import "./HopitalDetail.css";

function HopitalDetail() {
  const { id } = useParams();
  const [hopital, setHopital] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [adresseOuverte, setAdresseOuverte] = useState(false);
  const [presentationOuverte, setPresentationOuverte] = useState(false);

  useEffect(() => {
    async function charger() {
      try {
        const reponse = await axios.get(`http://localhost:5000/api/hopitaux/${id}`);
        setHopital(reponse.data);
      } catch (erreur) {
        console.error(erreur);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [id]);

  if (chargement) return <p className="hd-chargement">Chargement...</p>;
  if (!hopital) return <p className="hd-chargement">Hôpital introuvable.</p>;

  const lienGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hopital.adresse)}`;

  return (
    <div className="hopital-detail">
      <div className="hd-hero" style={{ "--hd-image": `url(${hopital.photo || require("../ressources/hopital-placeholder.jpg")})` }}>
        <div className="hd-hero-overlay"></div>
        <div className="hd-hero-contenu">
          <h1 className="hd-hero-nom">{hopital.nom}</h1>
          {hopital.urgences24h && <span className="hd-badge-urgence">Urgences 24h/24</span>}
        </div>
      </div>

      <div className="hd-corps">
        <div className="hd-colonne-principale">

          <div className="hd-carte">
            <div className="hd-carte-entete">
              <h3>Adresse</h3>
              <button className="hd-voir-plus" onClick={() => setAdresseOuverte(!adresseOuverte)}>
                {adresseOuverte ? "Voir moins" : "Voir plus"}
              </button>
            </div>
            <p className="hd-ligne"><IconePin taille={18} /> {hopital.adresse}</p>
            {adresseOuverte && (
              <a href={lienGoogleMaps} target="_blank" rel="noopener noreferrer" className="hd-lien-maps">
                Ouvrir dans Google Maps →
              </a>
            )}
          </div>

          <div className="hd-carte">
            <div className="hd-carte-entete">
              <h3>Présentation</h3>
              {hopital.siteWeb && (
                <button className="hd-voir-plus" onClick={() => setPresentationOuverte(!presentationOuverte)}>
                  {presentationOuverte ? "Voir moins" : "Voir plus"}
                </button>
              )}
            </div>
            <p className="hd-texte">{hopital.presentation || "Présentation à venir."}</p>
            {presentationOuverte && hopital.siteWeb && (
              <a href={hopital.siteWeb} target="_blank" rel="noopener noreferrer" className="hd-lien-maps">
                <IconeGlobe taille={16} /> Visiter le site de l'hôpital →
              </a>
            )}
          </div>

          <div className="hd-carte">
            <div className="hd-carte-entete">
              <h3>Horaires &amp; coordonnées</h3>
            </div>
            <p className="hd-ligne"><IconeTelephone taille={18} /> {hopital.telephone || "Non renseigné"}</p>
            <p className="hd-ligne"><IconeCalendrier taille={18} /> Consultations : généralement 8h–17h en semaine</p>
          </div>

          <div className="hd-carte">
            <div className="hd-carte-entete">
              <h3>Équipe médicale</h3>
            </div>
            {hopital.specialitesAvecId.map((spec) => (
              <div key={spec.id} className="hd-specialite-bloc">
                <h4 className="hd-specialite-nom">{spec.nom}</h4>
                {spec.medecins && spec.medecins.length > 0 ? (
                  <div className="hd-medecins-liste">
                    {spec.medecins.map((m) => (
                      <div key={m.id} className="hd-medecin-carte">
                        <div className="hd-medecin-avatar">
                          {m.prenom?.[0]}{m.nom?.[0]}
                        </div>
                        <div>
                          <p className="hd-medecin-nom">Dr {m.prenom} {m.nom}</p>
                          <p className="hd-medecin-fonction">{m.fonction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="hd-medecin-vide">Aucun médecin renseigné pour cette spécialité.</p>
                )}
              </div>
            ))}
          </div>

        </div>

        <div className="hd-sidebar">
          <div className="hd-sidebar-carte">
            <div className="hd-sidebar-titre-ligne">
              <IconeHopital taille={24} />
              <h3 className="hd-sidebar-nom">{hopital.nom}</h3>
            </div>
            <span className="hd-badge-public hd-badge-sidebar">Établissement public</span>
            <p className="hd-sidebar-adresse"><IconePin taille={16} /> {hopital.adresse}</p>
            <Link to={`/hopitaux/${hopital.id}/rendez-vous`} className="hd-btn-principal">
              Prendre rendez-vous
            </Link>
            <Link to={`/hopitaux/${hopital.id}/ticket`} className="hd-btn-secondaire">
              Acheter un ticket de consultation
            </Link>
          </div>
        </div>

      </div>

      <SectionContact />
    </div>
  );
}

export default HopitalDetail;