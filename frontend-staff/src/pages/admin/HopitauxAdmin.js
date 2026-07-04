import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconePin } from "../../composants/commun/Icones";
import "./HopitauxAdmin.css";

function HopitauxAdmin() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [hopitaux, setHopitaux] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");

  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [formulaire, setFormulaire] = useState({ nom: "", adresse: "", telephone: "", siteWeb: "", presentation: "", urgences24h: false });
  const [erreur, setErreur] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    try {
      const reponse = await axios.get("http://localhost:5000/api/hopitaux");
      setHopitaux(reponse.data);
    } catch (erreur) {
      console.error(erreur);
    } finally {
      setChargement(false);
    }
  }

  const champChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulaire({ ...formulaire, [name]: type === "checkbox" ? checked : value });
  };

  const soumettre = async () => {
    if (!formulaire.nom.trim() || !formulaire.adresse.trim()) {
      setErreur("Le nom et l'adresse sont obligatoires.");
      return;
    }
    setErreur("");
    setEnregistrement(true);
    try {
      await axios.post("http://localhost:5000/api/hopitaux", formulaire, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAfficherFormulaire(false);
      setFormulaire({ nom: "", adresse: "", telephone: "", siteWeb: "", presentation: "", urgences24h: false });
      charger();
    } catch (erreur) {
      setErreur(erreur.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setEnregistrement(false);
    }
  };

  const enleverAccents = (texte) => texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hopitauxFiltres = hopitaux.filter((h) =>
    enleverAccents(h.nom.toLowerCase()).includes(enleverAccents(recherche.toLowerCase()))
  );

  if (chargement) return <p className="ha-message">Chargement...</p>;

  

  return (
    <div>
      <div className="ha-entete">
        <div>
          <h1 className="ha-titre">Hôpitaux</h1>
          <p className="ha-soustitre">Sélectionnez un hôpital pour gérer ses informations et son personnel.</p>
        </div>
        <button className="ha-btn-ajouter" onClick={() => setAfficherFormulaire(true)}>+ Ajouter un hôpital</button>
      </div>

      <input
        type="text"
        placeholder="Rechercher un hôpital..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="ha-recherche"
      />

      <div className="ha-grille">
        {hopitauxFiltres.map((h) => (
          <button key={h.id} className="ha-carte" onClick={() => navigate(`/admin/hopitaux/${h.id}`)}>
            <h3>{h.nom}</h3>
            <p><IconePin taille={14} /> {h.adresse}</p>
            <span className="ha-nb-specialites">{h.specialites.length} spécialité{h.specialites.length !== 1 ? "s" : ""}</span>
          </button>
        ))}
        {hopitauxFiltres.length === 0 && <p className="ha-message">Aucun hôpital ne correspond à votre recherche.</p>}
      </div>

      {afficherFormulaire && (
        <div className="ha-modal-fond">
          <div className="ha-modal">
            <h2>Ajouter un hôpital</h2>

            <label className="ha-label">Nom de l'hôpital</label>
            <input type="text" name="nom" value={formulaire.nom} onChange={champChange} className="ha-input" />

            <label className="ha-label">Adresse</label>
            <input type="text" name="adresse" value={formulaire.adresse} onChange={champChange} className="ha-input" />

            <label className="ha-label">Téléphone (optionnel)</label>
            <input type="text" name="telephone" value={formulaire.telephone} onChange={champChange} className="ha-input" />

            <label className="ha-label">Site web (optionnel)</label>
            <input type="text" name="siteWeb" value={formulaire.siteWeb} onChange={champChange} className="ha-input" />

            <label className="ha-label">Présentation (optionnel)</label>
            <textarea name="presentation" value={formulaire.presentation} onChange={champChange} className="ha-input ha-textarea" />

            <label className="ha-checkbox-ligne">
              <input type="checkbox" name="urgences24h" checked={formulaire.urgences24h} onChange={champChange} />
              Urgences 24h/24
            </label>

            {erreur && <p className="ha-erreur">{erreur}</p>}

            <div className="ha-modal-boutons">
              <button className="ha-btn-annuler" onClick={() => setAfficherFormulaire(false)}>Annuler</button>
              <button className="ha-btn-creer" onClick={soumettre} disabled={enregistrement}>
                {enregistrement ? "Création..." : "Créer l'hôpital"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HopitauxAdmin;