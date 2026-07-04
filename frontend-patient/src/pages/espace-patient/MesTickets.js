import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { telechargerPDF } from "../../services/telechargement";
import "./MesTickets.css";

function CarteTicket({ ticket, token }) {
  const [position, setPosition] = useState(null);

  const aujourdHui = new Date().toISOString().split("T")[0];
  const estExpire = ticket.dateExpiration && ticket.dateExpiration < aujourdHui && ticket.statut !== "termine";
  const estAujourdHui = ticket.date === aujourdHui;

  useEffect(() => {
    if (estExpire) return;

    async function chargerPosition() {
      try {
        const reponse = await axios.get(`http://localhost:5000/api/tickets/${ticket.id}/position`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosition(reponse.data);
      } catch (erreur) {
        console.error(erreur);
      }
    }
    chargerPosition();

    const intervalle = setInterval(chargerPosition, 30000);
    return () => clearInterval(intervalle);
  }, [ticket.id, token, estExpire]);

  const telecharger = () => {
    telechargerPDF(`http://localhost:5000/api/tickets/${ticket.id}/recu`, token, `ticket-${ticket.numero}.pdf`);
  };

  return (
    <div className="mt-carte">
      <div className="mt-carte-entete">
        <h3>{ticket.Hopital?.nom}</h3>
        <span className="mt-numero">{ticket.numero}</span>
      </div>
      <p className="mt-ligne"><strong>Spécialité :</strong> {ticket.Specialite?.nom}</p>
      <p className="mt-ligne"><strong>Date :</strong> {ticket.date}</p>
      {ticket.dateExpiration && <p className="mt-ligne"><strong>Valable jusqu'au :</strong> {ticket.dateExpiration}</p>}

      {estExpire && <p className="mt-expire">Expiré</p>}

      {!estExpire && estAujourdHui && position && position.statut !== "termine" && (
        <div className="mt-position">
          <p className="mt-position-titre">Votre position dans la file</p>
          <p className="mt-position-valeur">{position.position}{position.position === 1 ? "ᵉʳ" : "ᵉ"}</p>
          {position.tempsAttenteEstimeMinutes > 0 && (
            <p className="mt-position-temps">≈ {position.tempsAttenteEstimeMinutes} min d'attente estimée</p>
          )}
        </div>
      )}

      {position && position.statut === "termine" && (
        <p className="mt-termine">Consultation terminée</p>
      )}

      <button className="mt-btn-telecharger" onClick={telecharger}>Télécharger mon ticket</button>
    </div>
  );
}

function MesTickets() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      try {
        const reponse = await axios.get("http://localhost:5000/api/tickets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(reponse.data);
      } catch (erreur) {
        console.error(erreur);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [token]);

  return (
    <div>
      <div className="mt-banniere">
        <div className="mt-forme mt-forme-1"></div>
        <div className="mt-forme mt-forme-2"></div>
        <h1 className="mt-titre">Mes tickets</h1>
        <p className="mt-soustitre">Votre ticket du jour et le suivi de la file d'attente.</p>
      </div>

      {chargement && <p className="mt-message">Chargement...</p>}

      {!chargement && tickets.length === 0 && (
        <p className="mt-message">Vous n'avez encore aucun ticket. Rendez-vous sur l'Annuaire des hôpitaux pour en acheter un.</p>
      )}

      <div className="mt-liste">
        {tickets.map((ticket) => (
          <CarteTicket key={ticket.id} ticket={ticket} token={token} />
        ))}
      </div>
    </div>
  );
}

export default MesTickets;