import { useState, useRef, useEffect } from "react";
import { IconeMessage, IconeCroix } from "./Icones";
import "./AssistantIA.css";

function AssistantIA() {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      texte: "👋 Bonjour ! Je suis l'assistant de SAMA Health. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const finMessages = useRef(null);

  useEffect(() => {
    if (ouvert) {
      finMessages.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, ouvert]);

  const envoyerMessage = async () => {
    const texte = saisie.trim();
    if (!texte || enCours) return;

    const messageUtilisateur = { id: Date.now(), role: "utilisateur", texte };
    setMessages((prev) => [...prev, messageUtilisateur]);
    setSaisie("");
    setEnCours(true);

    try {
      // Point d'intégration IA — remplacer cette section par l'appel API réel
      const reponse = await obtenirReponseIA(texte);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", texte: reponse },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          texte: "Désolé, je rencontre une difficulté. Veuillez réessayer dans un instant.",
        },
      ]);
    } finally {
      setEnCours(false);
    }
  };

  // Fonction de réponse simulée — à remplacer par l'appel à l'API IA
  async function obtenirReponseIA(message) {
    await new Promise((r) => setTimeout(r, 1000));

    const msg = message.toLowerCase();

    if (msg.includes("rendez-vous") || msg.includes("rdv")) {
      return "Pour prendre un rendez-vous, allez dans 'Nos hôpitaux', choisissez un établissement, sélectionnez une spécialité et un créneau disponible. Votre demande sera confirmée par le responsable de service.";
    }
    if (msg.includes("ticket")) {
      return "Pour acheter un ticket du jour, rendez-vous dans 'Nos hôpitaux', choisissez votre hôpital et votre spécialité, puis procédez au paiement via Wave ou Orange Money.";
    }
    if (msg.includes("paiement") || msg.includes("payer") || msg.includes("wave") || msg.includes("orange")) {
      return "SAMA Health accepte les paiements via Wave et Orange Money. Après confirmation de votre rendez-vous, vous recevrez un lien de paiement dans votre espace personnel.";
    }
    if (msg.includes("hopital") || msg.includes("hôpital")) {
      return "Vous pouvez consulter la liste complète des hôpitaux publics de Dakar dans la section 'Nos hôpitaux'. Chaque fiche présente les spécialités disponibles et l'équipe médicale.";
    }
    if (msg.includes("wolof") || msg.includes("naka") || msg.includes("xam")) {
      return "Waaw, man naa ci kanam ci wolof ! Askan wi mën ko jëfandikoo ci wolof walla ci français. (Oui, je peux continuer en wolof ! L'assistant peut être utilisé en wolof ou en français.)";
    }
    if (msg.includes("bonjour") || msg.includes("salut") || msg.includes("hello")) {
      return "Bonjour ! Comment puis-je vous aider aujourd'hui ? Je suis là pour vous guider dans vos démarches sur SAMA Health.";
    }

    return "Je suis là pour vous aider avec vos rendez-vous, vos tickets de consultation et toutes vos questions sur SAMA Health. Pouvez-vous préciser votre demande ?";
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        className={`assistant-btn-flottant ${ouvert ? "assistant-btn-ouvert" : ""}`}
        onClick={() => setOuvert(!ouvert)}
        title="Assistant SAMA Health"
      >
        {ouvert ? <IconeCroix taille={24} /> : <IconeMessage taille={24} />}
      </button>

      {/* Fenêtre de chat */}
      {ouvert && (
        <div className="assistant-fenetre">
          <div className="assistant-entete">
            <div className="assistant-entete-info">
              <div className="assistant-avatar">
                <IconeMessage taille={18} />
              </div>
              <div>
                <p className="assistant-nom">Assistant SAMA Health</p>
                <p className="assistant-statut">En ligne</p>
              </div>
            </div>
            <button className="assistant-fermer" onClick={() => setOuvert(false)}>
              <IconeCroix taille={18} />
            </button>
          </div>

          <div className="assistant-messages">
            {messages.map((m) => (
              <div key={m.id} className={`assistant-message ${m.role === "utilisateur" ? "assistant-message-utilisateur" : "assistant-message-assistant"}`}>
                <p>{m.texte}</p>
              </div>
            ))}
            {enCours && (
              <div className="assistant-message assistant-message-assistant">
                <div className="assistant-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={finMessages} />
          </div>

          <div className="assistant-saisie">
            <input
              type="text"
              placeholder="Écrivez votre message..."
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && envoyerMessage()}
              className="assistant-input"
              disabled={enCours}
            />
            <button
              className="assistant-btn-envoyer"
              onClick={envoyerMessage}
              disabled={!saisie.trim() || enCours}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AssistantIA;