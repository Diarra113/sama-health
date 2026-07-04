import { IconePin, IconeBouclier, IconeMessage, IconeCalendrier } from "../composants/commun/Icones";
import SectionContact from "../composants/commun/SectionContact";
import "./APropos.css";

const equipe = [
  { initiales: "MD", photo: null, nom: "Mame Diarra Dia", role: "Co-fondatrice & Développeuse", decalage: "haut" },
  { initiales: "SM", photo: null, nom: "Saynabou Mbacke", role: "Co-fondatrice & Développeuse", decalage: "bas" },
];

const valeurs = [
  { Icone: IconePin, titre: "Proximité", texte: "Pensée pour le terrain à Dakar." },
  { Icone: IconeBouclier, titre: "Confiance", texte: "Données protégées, conformes à la loi sénégalaise." },
  { Icone: IconeMessage, titre: "Accessibilité", texte: "Inclusive, même pour les non-francophones." },
  { Icone: IconeCalendrier, titre: "Innovation", texte: "Une première pour les hôpitaux publics du pays." },
];

function APropos() {
  return (
    <div className="page-apropos">
      <div className="page-apropos-entete">
        <div className="forme-decorative forme-1"></div>
        <div className="forme-decorative forme-2"></div>
        <p className="page-apropos-label">À propos de nous</p>
        <h1 className="page-apropos-titre">
          Notre mission : rendre les soins publics accessibles à tous, sans attente.
        </h1>

        <svg className="page-apropos-vague" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,10 C360,90 1080,0 1440,40 L1440,100 L0,100 Z" fill="#ffffff" />
        </svg>
      </div>

      <div className="page-apropos-histoire">
        <div className="forme-decorative forme-3"></div>
        <h2>Notre histoire</h2>
        <p>
            SAMA Health est un projet réalisé dans le cadre du Projet Tutoré de
            deuxième année de la filière Génie Logiciel et Systèmes d'Information,
            sous la supervision du Dr Moustapha Mbaye.
            <br /><br />
            Le projet est né de la volonté de concevoir une plateforme numérique
            dédiée au domaine de la santé, adaptée au contexte sénégalais. Il a été
            développé dans le cadre d'un travail académique visant à mettre en
            pratique les compétences acquises en analyse, conception et
            développement d'applications.
            <br /><br />
            SAMA Health constitue ainsi le résultat d'un projet collaboratif mené
            par des étudiants autour des problématiques liées à l'accès à
            l'information et aux services de santé.
</p>
      </div>

      <div className="page-apropos-encadrement">
        <div className="forme-decorative forme-4"></div>
        <div className="encadrement-carte">
          <h3>École Supérieure Polytechnique de Dakar</h3>
          <p>Département Génie Informatique</p>
          <p>Année académique 2025/2026.</p>
        </div>
        <div className="encadrement-carte">
          <h3>Encadrement académique</h3>
          <p>
            Projet supervisé par <strong>Dr Moustapha Mbaye</strong>, Enseignant-Chercheur
            à l'École Supérieure Polytechnique de Dakar.
          </p>
        </div>
      </div>

      <div className="page-apropos-equipe">
        <div className="forme-decorative forme-3"></div>
        <h2 className="equipe-titre">L'équipe</h2>
        <div className="equipe-grille">
          {equipe.map((membre, index) => (
            <div key={index} className={`equipe-carte equipe-carte-${membre.decalage}`}>
              {membre.photo ? (
                <img src={membre.photo} alt={membre.nom} className="equipe-photo" />
              ) : (
                <div className="equipe-avatar">{membre.initiales}</div>
              )}
              <h3 className="equipe-nom">{membre.nom}</h3>
              <p className="equipe-role">{membre.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="page-apropos-valeurs">
        <div className="forme-decorative forme-4"></div>
        <h2 className="valeurs-titre">Nos valeurs</h2>
        <div className="valeurs-grille">
          {valeurs.map((v, index) => (
            <div key={index} className="valeur-carte">
              <div className="valeur-icone"><v.Icone taille={30} /></div>
              <h3 className="valeur-titre">{v.titre}</h3>
              <p className="valeur-texte">{v.texte}</p>
            </div>
          ))}
        </div>
      </div>

      <SectionContact />
    </div>
  );
}

export default APropos;