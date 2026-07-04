import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexte/AuthContext";
import { IconeCheck } from "../composants/commun/Icones";
import Calendrier from "../composants/patient/Calendrier";
import SelecteurCreneaux from "../composants/patient/SelecteurCreneaux";
import "./PriseRendezVous.css";

function PriseRendezVous() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [hopital, setHopital] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState(1);

  const [specialiteChoisie, setSpecialiteChoisie] = useState(null);
  const [dateChoisie, setDateChoisie] = useState("");
  const [heureChoisie, setHeureChoisie] = useState("");
  const [modePaiement, setModePaiement] = useState("wave");

  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [rendezVousCree, setRendezVousCree] = useState(null);

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

  const choisirSpecialite = (specialite) => {
    setSpecialiteChoisie(specialite);
    setErreur("");
    setEtape(2);
  };

  const choisirDate = (date) => {
    setDateChoisie(date);
    setHeureChoisie("");
    setErreur("");
  };

  const validerCreneau = () => {
    if (!dateChoisie || !heureChoisie) {
      setErreur("Merci de choisir une date et un créneau horaire.");
      return;
    }
    setErreur("");
    setEtape(3);
  };

  const confirmerEtPayer = async () => {
    setEnCours(true);
    setErreur("");
    try {
      const reponse = await axios.post(
        "http://localhost:5000/api/rendez-vous",
        { hopitalId: hopital.id, specialiteId: specialiteChoisie.id, dateRDV: dateChoisie, heureRDV: heureChoisie },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRendezVousCree(reponse.data.rendezVous);
      setEtape(4);
    } catch (e) {
      setErreur(e.response?.data?.message || "Impossible de contacter le serveur.");
    } finally {
      setEnCours(false);
    }
  };

  if (chargement) return <p className="prv-chargement">Chargement...</p>;
  if (!hopital) return <p className="prv-chargement">Hôpital introuvable.</p>;

  return (
    <div className="prv-page">
      <div className="prv-corps-plein">

        <p className="prv-titre-page">Prenez votre rendez-vous en ligne</p>
        <p className="prv-soustitre-page">{hopital.nom}</p>

        <div className="prv-barre-progression">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`prv-segment ${etape >= n ? "actif" : ""}`}></div>
          ))}
        </div>

        {etape === 1 && (
          <div className="prv-carte">
            <h2>Choisissez une spécialité</h2>
            <div className="prv-liste-specialites">
              {hopital.specialitesAvecId.map((s) => (
                <button key={s.id} className="prv-specialite-btn" onClick={() => choisirSpecialite(s)}>
                  <span className="prv-specialite-nom">{s.nom}</span>
                  <span className="prv-specialite-tarif">{s.tarifConsultation ? `${s.tarifConsultation} FCFA` : "Tarif non renseigné"}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {etape === 2 && (
          <div className="prv-carte">
            <button className="prv-retour" onClick={() => setEtape(1)}>← Retour</button>
            <h2>Choisissez une date et un créneau</h2>

            <Calendrier
              joursOuverture={specialiteChoisie.joursOuverture}
              dateSelectionnee={dateChoisie}
              onSelectionDate={choisirDate}
              hopitalId={hopital.id}
              specialiteId={specialiteChoisie.id}
            />

            <div className="prv-creneaux-zone">
              <SelecteurCreneaux
                hopitalId={hopital.id}
                specialiteId={specialiteChoisie.id}
                date={dateChoisie}
                heureSelectionnee={heureChoisie}
                onSelectionHeure={setHeureChoisie}
              />
            </div>

            {erreur && <p className="prv-erreur">{erreur}</p>}
            <button className="prv-btn-principal" onClick={validerCreneau}>Continuer</button>
          </div>
        )}

        {etape === 3 && (
          <div className="prv-carte">
            <button className="prv-retour" onClick={() => setEtape(2)}>← Retour</button>
            <h2>Récapitulatif</h2>
            <p className="prv-aide">Vérifiez les informations avant de confirmer votre demande.</p>

            <div className="prv-recap-final">
              <p><strong>Hôpital :</strong> {hopital.nom}</p>
              <p><strong>Spécialité :</strong> {specialiteChoisie.nom}</p>
              <p><strong>Date :</strong> {dateChoisie} à {heureChoisie}</p>
              <p><strong>Tarif :</strong> {specialiteChoisie.tarifConsultation || 0} FCFA</p>
            </div>

            <div className="prv-info-paiement">
              ℹ️ Le paiement se fera après validation de votre demande par le responsable de service.
            </div>

            {erreur && <p className="prv-erreur">{erreur}</p>}
            <button className="prv-btn-principal" onClick={confirmerEtPayer} disabled={enCours}>
              {enCours ? "Envoi en cours..." : "Envoyer ma demande de rendez-vous"}
            </button>
          </div>
        )}

        {etape === 4 && rendezVousCree && (
          <div className="prv-carte prv-succes">
            <div className="prv-succes-icone"><IconeCheck taille={56} /></div>
            <h2>Demande envoyée !</h2>
            <p>Votre demande de rendez-vous pour le <strong>{rendezVousCree.dateRDV}</strong> à <strong>{rendezVousCree.heureRDV?.slice(0, 5)}</strong> a bien été enregistrée.</p>
            <div className="prv-info-paiement">
              ⏳ En attente de validation par le responsable de service. Vous pourrez suivre le statut dans "Mes rendez-vous".
            </div>
            <button className="prv-btn-secondaire" onClick={() => navigate("/espace-patient/rendez-vous", { replace: true })}>
              Voir mes rendez-vous
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PriseRendezVous;