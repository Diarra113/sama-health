import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconeCalendrier, IconeHorloge, IconeHopital, IconeCheck, IconeCoeur } from "../../composants/commun/Icones";
import "./TableauDeBord.css";

function TableauDeBord() {
  const { utilisateur, token } = useAuth();
  const navigate = useNavigate();
  const [prochainRdv, setProchainRdv] = useState(null);
  const [ticketDuJour, setTicketDuJour] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      try {
        const aujourdHui = new Date().toISOString().split("T")[0];
        const [reponseRdv, reponseTickets] = await Promise.all([
          axios.get("http://localhost:5000/api/rendez-vous", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/tickets", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const maintenant = new Date();
        const prochains = reponseRdv.data
          .filter((r) => {
            if (r.statut !== "confirme") return false;
            return new Date(`${r.dateRDV}T${r.heureRDV}`) > maintenant;
          })
          .sort((a, b) => (a.dateRDV + a.heureRDV).localeCompare(b.dateRDV + b.heureRDV));

        setProchainRdv(prochains[0] || null);

        const ticketActif = reponseTickets.data.find((t) => t.date === aujourdHui);
        setTicketDuJour(ticketActif || null);
      } catch (erreur) {
        console.error(erreur);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [token]);

  return (
    <div className="tdb-page">

      {/* Bannière */}
<div className="tdb-banniere">
  <div className="forme-decorative forme-1"></div>
  <div className="forme-decorative forme-2"></div>
  <div className="tdb-banniere-contenu">
    <h1 className="tdb-titre">Bonjour, {utilisateur?.prenom} 👋 </h1>
    <p className="mrv-soustitre">Bienvenue sur Sama Health. Gérez facilement vos rendez-vous et vos tickets de consultation en quelques clics.</p>

  </div>
</div>

      {/* Cartes */}
      {!chargement && (
        <div className="tdb-grille">
          <div className="tdb-carte">
            <div className="tdb-carte-entete">
              <div className="tdb-carte-icone">
                <IconeCalendrier taille={22} />
              </div>
              <p className="tdb-carte-label">Prochain rendez-vous</p>
            </div>
            {prochainRdv ? (
              <>
                <p className="tdb-carte-hopital">{prochainRdv.Hopital?.nom}</p>
                <p className="tdb-carte-valeur">{prochainRdv.dateRDV} à {prochainRdv.heureRDV?.slice(0, 5)}</p>
                <p className="tdb-carte-conseil">Merci de vous présenter 30 minutes avant votre rendez-vous et de présenter votre confirmation de réservation à votre arrivée.</p>
                <Link to="/espace-patient/rendez-vous" className="tdb-carte-action">Voir plus →</Link>
              </>
            ) : (
              <>
                <p className="tdb-carte-vide">Aucun rendez-vous confirmé à venir</p>
                <button className="tdb-carte-btn" onClick={() => navigate("/hopitaux")}>
                  Prendre un rendez-vous
                </button>
              </>
            )}
          </div>

          <div className="tdb-carte">
            <div className="tdb-carte-entete">
              <div className="tdb-carte-icone">
                <IconeHorloge taille={22} />
              </div>
              <p className="tdb-carte-label">Ticket du jour</p>
            </div>
            {ticketDuJour ? (
              <>
                <p className="tdb-carte-hopital">{ticketDuJour.Hopital?.nom}</p>
                {ticketDuJour.statut === "termine" ? (
                  <div className="tdb-consulte">
                    <IconeCheck taille={18} />
                    <p className="tdb-carte-valeur">Consultation terminée</p>
                  </div>
                ) : (
                  <>
                    <p className="tdb-carte-valeur">N°{ticketDuJour.position} dans la file</p>
                    <p className="tdb-carte-conseil">Rendez-vous à l'hôpital quand votre tour approche.</p>
                  </>
                )}
                <Link to="/espace-patient/tickets" className="tdb-carte-action">Voir mes tickets →</Link>
              </>
            ) : (
              <>
                <p className="tdb-carte-vide">Aucun ticket actif aujourd'hui</p>
                <button className="tdb-carte-btn" onClick={() => navigate("/hopitaux")}>
                  Acheter un ticket de consultation
                </button>
              </>
            )}
          </div>
        </div>
      )}


    </div>
  );
}

export default TableauDeBord;