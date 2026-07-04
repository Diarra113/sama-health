import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconeBouclier } from "../../composants/commun/Icones";
import "./AdministrateursAdmin.css";

function AdministrateursAdmin() {
  const { token, utilisateur } = useAuth();
  const [administrateurs, setAdministrateurs] = useState([]);
  const [chargement, setChargement] = useState(true);

  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [formulaire, setFormulaire] = useState({ nom: "", prenom: "", email: "", telephone: "" });
  const [erreur, setErreur] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [compteCree, setCompteCree] = useState(null);

  useEffect(() => {
    charger();
  }, [token]);

  async function charger() {
    try {
      const reponse = await axios.get("http://localhost:5000/api/admin/personnel", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdministrateurs(reponse.data.administrateurs);
    } catch (erreur) {
      console.error(erreur);
    } finally {
      setChargement(false);
    }
  }

  const champChange = (e) => setFormulaire({ ...formulaire, [e.target.name]: e.target.value });

  const soumettre = async () => {
    setErreur("");
    if (!formulaire.nom.trim() || !formulaire.prenom.trim() || !formulaire.email.trim()) {
      setErreur("Nom, prénom et email sont obligatoires.");
      return;
    }
    setEnregistrement(true);
    try {
      const reponse = await axios.post(
        "http://localhost:5000/api/admin/personnel",
        { ...formulaire, role: "administrateur" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompteCree(reponse.data);
      charger();
    } catch (erreur) {
      setErreur(erreur.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setEnregistrement(false);
    }
  };

  const fermer = () => {
    setAfficherFormulaire(false);
    setCompteCree(null);
    setFormulaire({ nom: "", prenom: "", email: "", telephone: "" });
    setErreur("");
  };

  const supprimer = async (id, nomComplet) => {
    if (!window.confirm(`Supprimer le compte administrateur de ${nomComplet} ?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/personnel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      charger();
    } catch (erreur) {
      alert(erreur.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  return (
    <div>
      <div className="aa-entete">
        <div>
          <h1 className="aa-titre">Administrateurs</h1>
          <p className="aa-soustitre">Comptes ayant un accès complet à la plateforme.</p>
        </div>
        <button className="aa-btn-ajouter" onClick={() => setAfficherFormulaire(true)}>+ Ajouter un administrateur</button>
      </div>

      {chargement && <p className="aa-message">Chargement...</p>}

      {!chargement && (
        <div className="aa-liste">
          {administrateurs.map((u) => (
            <div key={u.id} className="aa-carte">
              <div className="aa-avatar"><IconeBouclier taille={24} /></div>
              <div className="aa-infos">
                <p className="aa-nom">{u.prenom} {u.nom}{u.id === utilisateur?.id && <span className="aa-vous"> (vous)</span>}</p>
                <p className="aa-email">{u.email}</p>
              </div>
              {u.id !== utilisateur?.id && (
                <button className="aa-btn-supprimer" onClick={() => supprimer(u.id, `${u.prenom} ${u.nom}`)}>Supprimer</button>
              )}
            </div>
          ))}
        </div>
      )}

      {afficherFormulaire && (
        <div className="aa-modal-fond">
          <div className="aa-modal">
            {!compteCree ? (
              <>
                <h2>Ajouter un administrateur</h2>

                <div className="aa-ligne-champs">
                  <div>
                    <label className="aa-label">Prénom</label>
                    <input type="text" name="prenom" value={formulaire.prenom} onChange={champChange} className="aa-input" />
                  </div>
                  <div>
                    <label className="aa-label">Nom</label>
                    <input type="text" name="nom" value={formulaire.nom} onChange={champChange} className="aa-input" />
                  </div>
                </div>

                <label className="aa-label">Email</label>
                <input type="email" name="email" value={formulaire.email} onChange={champChange} className="aa-input" />

                <label className="aa-label">Téléphone (optionnel)</label>
                <input type="text" name="telephone" value={formulaire.telephone} onChange={champChange} className="aa-input" />

                {erreur && <p className="aa-erreur">{erreur}</p>}

                <div className="aa-boutons">
                  <button className="aa-btn-annuler" onClick={fermer}>Annuler</button>
                  <button className="aa-btn-creer" onClick={soumettre} disabled={enregistrement}>
                    {enregistrement ? "Création..." : "Créer le compte"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Compte créé avec succès</h2>
                <p className="aa-recap">Communiquez ces identifiants à <strong>{compteCree.utilisateur.prenom} {compteCree.utilisateur.nom}</strong> :</p>
                <div className="aa-identifiants">
                  <p>Email : <strong>{compteCree.utilisateur.email}</strong></p>
                  <p>Mot de passe : <strong>{compteCree.motDePasse}</strong></p>
                </div>
                <button className="aa-btn-creer" onClick={fermer}>Fermer</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdministrateursAdmin;