import { IconeCalendrier, IconeHorloge, IconeMessage, IconeBouclier, IconePaiement } from "../composants/commun/Icones";
import SectionContact from "../composants/commun/SectionContact";
import "./PourquoiSH.css";

function PourquoiSH() {
  return (
    <div className="page-pourquoi">
      <div className="page-pourquoi-entete">
        <p className="page-pourquoi-label">Pourquoi SAMA Health ?</p>
        <div className="forme-decorative forme-1"></div>
        <div className="forme-decorative forme-2"></div>
        <h1 className="page-pourquoi-titre">
          Parce que se soigner ne devrait jamais commencer par une file d'attente.
        </h1>
        <p className="page-pourquoi-slogan">Votre santé, votre temps, sous contrôle.</p>
        <svg className="page-pourquoi-vague" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,10 C360,90 1080,0 1440,40 L1440,100 L0,100 Z" fill="#ffffff" />
        </svg>
      </div>

      <div className="rangee-fonctionnalite">
        <div className="rangee-texte">
          <div className="rangee-icone"><IconeBouclier taille={32} /></div>
          <h2>Une modernisation radicale</h2>
          <p>
            À Dakar, l'accès aux hôpitaux publics repose encore largement sur des files physiques et des démarches papier. SAMA Health porte une modernisation radicale de cette expérience : une initiative qui n'a jamais existé sous cette forme au Sénégal. Chaque patient, quel que soit son profil, peut désormais se faire soigner sans attente inutile, où qu'il se trouve et quand il en a besoin.
          </p>
        </div>
        <div className="rangee-visuel">
          <div className="forme-decorative forme-3"></div>
          <div className="rangee-carte-flottante">
            <span>Plateforme</span>
            <strong className="rangee-paiements">100% digitale</strong>
            <span className="rangee-temps">Une première au Sénégal</span>
          </div>
        </div>
      </div>

      <div className="rangee-fonctionnalite rangee-inversee">
        <div className="rangee-texte">
          <div className="rangee-icone"><IconeHorloge taille={32} /></div>
          <h2>Suivez votre file d'attente, en direct</h2>
          <p>
            Achetez votre ticket de consultation le jour même et suivez votre position exacte dans la file depuis votre téléphone. Vous ne vous déplacez qu'au bon moment : plus jamais des heures debout sous le soleil à attendre votre tour sans visibilité.
          </p>
        </div>
        <div className="rangee-visuel">
          <div className="forme-decorative forme-4"></div>
          <div className="rangee-carte-flottante">
            <span>Position dans la file</span>
            <strong>3ᵉ</strong>
            <span className="rangee-temps">≈ 12 min d'attente estimée</span>
          </div>
        </div>
      </div>

      <div className="rangee-fonctionnalite">
        <div className="rangee-texte">
          <div className="rangee-icone"><IconeMessage taille={32} /></div>
          <h2>Un assistant intelligent, qui parle votre langue</h2>
          <p>
            Plus de 80% des Dakarois parlent wolof au quotidien. Notre assistant conversationnel répond à toutes vos questions concernant la prise de rendez-vous, les horaires et les spécialités disponibles. Il guide chaque patient non francophone, étape par étape. Personne n'est laissé de côté.
          </p>
        </div>
        <div className="rangee-visuel">
          <div className="forme-decorative forme-3"></div>
          <div className="rangee-carte-flottante rangee-carte-message">
            <span>💬 "Naka nga def ?"</span>
            <span className="rangee-temps">Assistant disponible en wolof, 24h/24</span>
          </div>
        </div>
      </div>

      <div className="rangee-fonctionnalite rangee-inversee">
        <div className="rangee-texte">
          <div className="rangee-icone"><IconePaiement taille={32} /></div>
          <h2>Payez comme vous le souhaitez</h2>
          <p>
            Wave, Orange Money : réglez votre ticket ou votre rendez-vous avec le mode de paiement que vous utilisez déjà au quotidien. Votre reçu est généré et téléchargeable immédiatement. Aucune avance d'argent à faire sur place, aucune mauvaise surprise.
          </p>
        </div>
        <div className="rangee-visuel">
          <div className="forme-decorative forme-4"></div>
          <div className="rangee-carte-flottante">
            <span>Paiement accepté</span>
            <strong className="rangee-paiements">Wave · OM</strong>
            <span className="rangee-temps">Reçu généré instantanément</span>
          </div>
        </div>
      </div>

      <div className="page-pourquoi-grille">
        <div className="raison-carte">
          <div className="raison-icone"><IconeCalendrier taille={28} /></div>
          <h3 className="raison-titre">Réservez sans vous déplacer</h3>
          <p className="raison-texte">Prenez rendez-vous en ligne depuis chez vous, à tout moment de la journée.</p>
        </div>
        <div className="raison-carte">
          <div className="raison-icone"><IconeBouclier taille={28} /></div>
          <h3 className="raison-titre">Données protégées</h3>
          <p className="raison-texte">Vos informations personnelles sont chiffrées et traitées conformément à la réglementation CDP du Sénégal.</p>
        </div>
        <div className="raison-carte">
          <div className="raison-icone"><IconeMessage taille={28} /></div>
          <h3 className="raison-titre">Disponible en wolof</h3>
          <p className="raison-texte">Un assistant conversationnel dans votre langue pour vous accompagner à chaque étape.</p>
        </div>
        <div className="raison-carte">
          <div className="raison-icone"><IconeHorloge taille={28} /></div>
          <h3 className="raison-titre">Accessible 24h/24</h3>
          <p className="raison-texte">La plateforme est disponible à toute heure, depuis n'importe quel smartphone ou ordinateur.</p>
        </div>
      </div>

      <SectionContact />
    </div>
  );
}

export default PourquoiSH;