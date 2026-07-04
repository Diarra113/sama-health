import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexte/AuthContext";
import { telechargerPDF } from "../services/telechargement";
import { IconeHopital, IconeCheck } from "../composants/commun/Icones";
import "./AchatTicket.css";

function AchatTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [hopital, setHopital] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState(1);

  const [specialiteChoisie, setSpecialiteChoisie] = useState(null);
  const [modePaiement, setModePaiement] = useState("wave");

  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [ticketCree, setTicketCree] = useState(null);

  useEffect(() => {
    async function charger() {
      try {
        const reponse = await axios.get(`http://localhost:5000/api/hopitaux/${id}`);
        setHopital(reponse.data);
      } catch (e) { console.error(e); }
      finally { setChargement(false); }
    }
    charger();
  }, [id]);

  const choisirSpecialite = async (specialite) => {
    setErreur("");
    // Vérifier quota avant de continuer
    try {
      const reponse = await axios.get(
        `http://localhost:5000/api/tickets/quota?hopitalId=${id}&specialiteId=${specialite.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (reponse.data.sature) {
        setErreur(`Le quota de tickets pour aujourd'hui est atteint pour la spécialité "${specialite.nom}". Revenez demain.`);
        return;
      }
    } catch (e) { console.error(e); }

    setSpecialiteChoisie(specialite);
    setEtape(2);
  };

  const confirmerEtPayer = async () => {
    setEnCours(true);
    setErreur("");
    try {
      const reponse = await axios.post(
        "http://localhost:5000/api/tickets",
        { hopitalId: hopital.id, specialiteId: specialiteChoisie.id, modePaiement },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicketCree(reponse.data.ticket);
      setEtape(3);
    } catch (e) {
      setErreur(e.response?.data?.message || "Impossible de contacter le serveur.");
    } finally { setEnCours(false); }
  };

  const telecharger = () => {
    telechargerPDF(
      `http://localhost:5000/api/tickets/${ticketCree.id}/recu`,
      token,
      `ticket-${ticketCree.numero}.pdf`
    );
  };

  if (chargement) return <p className="at-chargement">Chargement...</p>;
  if (!hopital) return <p className="at-chargement">Hôpital introuvable.</p>;

  return (
    <div className="at-page">
      <div className="at-corps">
        <div className="at-colonne-principale">
          <p className="at-titre-page">Achetez votre ticket du jour</p>
          <p className="at-soustitre-page">Renseignez les informations suivantes</p>

          <div className="at-barre-progression">
            {[1,2,3].map((n) => (
              <div key={n} className={`at-segment ${etape >= n ? "actif" : ""}`}></div>
            ))}
          </div>

          {etape === 1 && (
            <div className="at-carte">
              <h2>Choisissez une spécialité</h2>
              {erreur && <p className="at-erreur">{erreur}</p>}
              <div className="at-liste-specialites">
                {hopital.specialitesAvecId.map((s) => (
                  <button key={s.id} className="at-specialite-btn" onClick={() => choisirSpecialite(s)}>
                    <span className="at-specialite-nom">{s.nom}</span>
                    <span className="at-specialite-tarif">{s.tarifConsultation ? `${s.tarifConsultation} FCFA` : "Tarif non renseigné"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {etape === 2 && (
            <div className="at-carte">
              <button className="at-retour" onClick={() => { setEtape(1); setErreur(""); }}>← Retour</button>
              <h2>Paiement</h2>
              <p className="at-aide">Votre ticket sera valable pour aujourd'hui, avec votre position dans la file visible en temps réel.</p>

              <div className="at-choix-paiement">
                <button className={`at-paiement-btn ${modePaiement === "wave" ? "at-paiement-actif" : ""}`} onClick={() => setModePaiement("wave")}>Wave</button>
                <button className={`at-paiement-btn ${modePaiement === "orange_money" ? "at-paiement-actif" : ""}`} onClick={() => setModePaiement("orange_money")}>Orange Money</button>
              </div>

              <p className="at-montant">Montant à payer : <strong>{specialiteChoisie.tarifConsultation || 0} FCFA</strong></p>

              {erreur && <p className="at-erreur">{erreur}</p>}
              <button className="at-btn-principal" onClick={confirmerEtPayer} disabled={enCours}>
                {enCours ? "Paiement en cours..." : "Payer et obtenir mon ticket"}
              </button>
            </div>
          )}

          {etape === 3 && ticketCree && (
            <div className="at-carte at-succes">
              <div className="at-succes-icone"><IconeCheck taille={56} /></div>
              <h2>Ticket obtenu !</h2>
              <p>Vous êtes en position <strong>{ticketCree.position}</strong> dans la file aujourd'hui.</p>
              <p className="at-code">Code de réservation : {ticketCree.codeReservation}</p>
              <button className="at-btn-principal" onClick={telecharger}>Télécharger mon ticket</button>
              <button className="at-btn-secondaire" onClick={() => navigate("/espace-patient/tickets", { replace: true })}>
                Suivre ma position en temps réel
              </button>
            </div>
          )}
        </div>

        <div className="at-sidebar">
          <div className="at-sidebar-carte">
            <div className="at-sidebar-titre-ligne">
              <IconeHopital taille={22} />
              <h3>{hopital.nom}</h3>
            </div>
            <span className="at-badge-public">Établissement public</span>
            <div className="at-recap">
              <p className="at-recap-label">Spécialité</p>
              <p className="at-recap-valeur">{specialiteChoisie ? specialiteChoisie.nom : "Non choisie"}</p>
              {specialiteChoisie && (
                <>
                  <p className="at-recap-label">Tarif</p>
                  <p className="at-recap-valeur">{specialiteChoisie.tarifConsultation || 0} FCFA</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchatTicket;