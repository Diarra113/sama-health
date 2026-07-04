import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { telechargerPDF } from "../../services/telechargement";
import "./MesRendezVous.css";

function MesRendezVous() {
  const { token } = useAuth();
  const [rendezVous, setRendezVous] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [paiementEnCours, setPaiementEnCours] = useState({});
  const [modePaiement, setModePaiement] = useState({});

  const charger = async () => {
    try {
      const reponse = await axios.get("http://localhost:5000/api/rendez-vous", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRendezVous(reponse.data);
    } catch (erreur) {
      console.error(erreur);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, [token]);

  const telecharger = (id) => {
    telechargerPDF(`http://localhost:5000/api/rendez-vous/${id}/recu`, token, `ticket-rdv-${id}.pdf`);
  };

  const payer = async (rdvId) => {
    setPaiementEnCours({ ...paiementEnCours, [rdvId]: true });
    try {
      await axios.post(
        `http://localhost:5000/api/rendez-vous/${rdvId}/payer`,
        { modePaiement: modePaiement[rdvId] || "wave" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      charger();
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors du paiement.");
    } finally {
      setPaiementEnCours({ ...paiementEnCours, [rdvId]: false });
    }
  };

  const libelleStatut = (statut, dateRDV, heureRDV) => {
  if (statut === "termine") return { texte: "Consulté ✓", classe: "mrv-statut-confirme" };
  if (statut === "rejete") return { texte: "Rejeté", classe: "mrv-statut-rejete" };
  if (statut === "confirme") {
    const dateHeure = new Date(`${dateRDV}T${heureRDV}`);
    if (dateHeure <= new Date()) return { texte: "Non présenté", classe: "mrv-statut-rejete" };
    return { texte: "Confirmé", classe: "mrv-statut-confirme" };
  }
  return { texte: "En attente de validation", classe: "mrv-statut-attente" };
};

  const maintenant = new Date();

  const aVenir = rendezVous.filter((r) => {
    if (r.statut === "rejete" || r.statut === "termine") return false;
    return new Date(`${r.dateRDV}T${r.heureRDV}`) > maintenant;
  });

  const passes = rendezVous.filter((r) => {
    if (r.statut === "rejete" || r.statut === "termine") return true;
    return new Date(`${r.dateRDV}T${r.heureRDV}`) <= maintenant;
  });

  const CarteRdv = ({ rdv, estPasse }) => {
    const statut = libelleStatut(rdv.statut, rdv.dateRDV, rdv.heureRDV);

    return (
      <div className="mrv-carte">
        <div className="mrv-carte-entete">
          <h3>{rdv.Hopital?.nom}</h3>
          <span className={`mrv-statut ${statut.classe}`}>{statut.texte}</span>
        </div>
        <p className="mrv-ligne"><strong>Spécialité :</strong> {rdv.Specialite?.nom}</p>
        <p className="mrv-ligne"><strong>Date :</strong> {rdv.dateRDV} à {rdv.heureRDV?.slice(0, 5)}</p>
        <p className="mrv-ligne"><strong>Tarif :</strong> {rdv.tarif} FCFA</p>

        {rdv.statut === "en_attente" && (
  <div className="mrv-notif mrv-notif-attente">
    ⏳ En attente de validation par le responsable de service.
  </div>
)}

{rdv.statut === "rejete" && rdv.motifRejet && (
  <div className="mrv-notif mrv-notif-rejete">
    Motif du rejet : {rdv.motifRejet}
  </div>
)}

{rdv.statut === "confirme" && !estPasse && !rdv.paye && (
  <div className="mrv-paiement-zone">
    <div className="mrv-notif mrv-notif-confirme">
      Votre rendez-vous est confirmé. Procédez au paiement pour finaliser.
    </div>
    <div className="mrv-choix-paiement">
      <button
        className={`mrv-paiement-btn ${(modePaiement[rdv.id] || "wave") === "wave" ? "mrv-paiement-actif" : ""}`}
        onClick={() => setModePaiement({ ...modePaiement, [rdv.id]: "wave" })}
      >Wave</button>
      <button
        className={`mrv-paiement-btn ${modePaiement[rdv.id] === "orange_money" ? "mrv-paiement-actif" : ""}`}
        onClick={() => setModePaiement({ ...modePaiement, [rdv.id]: "orange_money" })}
      >Orange Money</button>
    </div>
    <button
      className="mrv-btn-telecharger"
      onClick={() => payer(rdv.id)}
      disabled={paiementEnCours[rdv.id]}
    >
      {paiementEnCours[rdv.id] ? "Paiement en cours..." : `Payer ${rdv.tarif} FCFA`}
    </button>
  </div>
)}

{rdv.statut === "confirme" && !estPasse && rdv.paye && (
  <>
    <div className="mrv-notif mrv-notif-confirme">
      Paiement effectué — votre ticket est disponible.
    </div>
    <button className="mrv-btn-telecharger" onClick={() => telecharger(rdv.id)}>
      Télécharger mon ticket
    </button>
  </>
)}

{rdv.statut === "confirme" && estPasse && (
  <div className="mrv-notif mrv-notif-rejete">
    Vous ne vous êtes pas présenté à ce rendez-vous.
  </div>
)}

{rdv.statut === "termine" && (
  <button className="mrv-btn-telecharger" onClick={() => telecharger(rdv.id)}>
    Télécharger le reçu
  </button>
)}
      </div>
    );
  };

  return (
    <div>
      <div className="mrv-banniere">
        <div className="mrv-forme mrv-forme-1"></div>
        <div className="mrv-forme mrv-forme-2"></div>
        <h1 className="mrv-titre">Mes rendez-vous</h1>
        <p className="mrv-soustitre">Suivez vos rendez-vous à venir et passés.</p>
      </div>

      {chargement && <p className="mrv-message">Chargement...</p>}

      {!chargement && rendezVous.length === 0 && (
        <p className="mrv-message">Vous n'avez encore aucun rendez-vous.</p>
      )}

      {!chargement && aVenir.length > 0 && (
        <>
          <h2 className="mrv-section-titre">À venir</h2>
          <div className="mrv-liste">
            {aVenir.map((rdv) => <CarteRdv key={rdv.id} rdv={rdv} estPasse={false} />)}
          </div>
        </>
      )}

      {!chargement && passes.length > 0 && (
        <>
          <h2 className="mrv-section-titre">Passés</h2>
          <div className="mrv-liste">
            {passes.map((rdv) => <CarteRdv key={rdv.id} rdv={rdv} estPasse={true} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default MesRendezVous;