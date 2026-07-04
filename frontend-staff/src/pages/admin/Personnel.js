import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import "./Personnel.css";

function Personnel() {
  const { token } = useAuth();
  const [donnees, setDonnees] = useState({ medecins: [], responsables: [], accueil: [], administrateurs: [] });
  const [chargement, setChargement] = useState(true);
  const [hopitaux, setHopitaux] = useState([]);

  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [formulaire, setFormulaire] = useState({
    nom: "", prenom: "", email: "", telephone: "", role: "medecin",
    hopitalId: "", specialiteId: "", matriculeOuPoste: "", fonction: "",
  });
  const [erreur, setErreur] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [compteCree, setCompteCree] = useState(null);

  useEffect(() => {
    chargerPersonnel();
    chargerHopitaux();
  }, [token]);

  async function chargerPersonnel() {
    try {
      const reponse = await axios.get("http://localhost:5000/api/admin/personnel", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonnees(reponse.data);
    } catch (erreur) {
      console.error(erreur);
    } finally {
      setChargement(false);
    }
  }

  async function chargerHopitaux() {
    try {
      const reponse = await axios.get("http://localhost:5000/api/hopitaux");
      setHopitaux(reponse.data);
    } catch (erreur) {
      console.error(erreur);
    }
  }

  const champChange = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const hopitalSelectionne = hopitaux.find((h) => h.id === parseInt(formulaire.hopitalId));

  const soumettre = async () => {
    setErreur("");
    if (!formulaire.nom.trim() || !formulaire.prenom.trim() || !formulaire.email.trim()) {
      setErreur("Nom, prénom et email sont obligatoires.");
      return;
    }
    if ((formulaire.role === "medecin" || formulaire.role === "responsable") && (!formulaire.hopitalId || !formulaire.specialiteId)) {
      setErreur("Hôpital et spécialité sont obligatoires pour ce rôle.");
      return;
    }
    if (formulaire.role === "accueil" && !formulaire.hopitalId) {
      setErreur("L'hôpital est obligatoire pour ce rôle.");
      return;
    }

    setEnregistrement(true);
    try {
      const reponse = await axios.post(
        "http://localhost:5000/api/admin/personnel",
        formulaire,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompteCree(reponse.data);
      chargerPersonnel();
    } catch (erreur) {
      if (erreur.response) {
        setErreur(erreur.response.data.message);
      } else {
        setErreur("Impossible de contacter le serveur.");
      }
    } finally {
      setEnregistrement(false);
    }
  };

  const fermerFormulaire = () => {
    setAfficherFormulaire(false);
    setCompteCree(null);
    setFormulaire({ nom: "", prenom: "", email: "", telephone: "", role: "medecin", hopitalId: "", specialiteId: "", matriculeOuPoste: "", fonction: "" });
    setErreur("");
  };

  const supprimer = async (id, nomComplet) => {
    if (!window.confirm(`Supprimer le compte de ${nomComplet} ? Cette action est irréversible.`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/personnel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      chargerPersonnel();
    } catch (erreur) {
      alert(erreur.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  const LIBELLES_ROLE = { medecin: "Médecin", responsable: "Responsable de service", accueil: "Agent de guichet", administrateur: "Administrateur" };

  return (
    <div>
      <div className="personnel-entete">
        <h1>Personnel</h1>
        <button className="personnel-btn-ajouter" onClick={() => setAfficherFormulaire(true)}>+ Ajouter un membre</button>
      </div>

      {chargement && <p className="personnel-message">Chargement...</p>}

      {!chargement && (
        <>
          {["medecins", "responsables", "accueil", "administrateurs"].map((categorie) => (
            donnees[categorie].length > 0 && (
              <div key={categorie} className="personnel-section">
                <h2 className="personnel-section-titre">
                  {categorie === "medecins" ? "Médecins" : categorie === "responsables" ? "Responsables de service" : categorie === "accueil" ? "Agents de guichet" : "Administrateurs"}
                </h2>
                <div className="personnel-liste">
                  {donnees[categorie].map((u) => {
                    const affectation = u.Medecin || u.ResponsableService || u.PersonnelAccueil || u.Administrateur;
                    return (
                      <div key={u.id} className="personnel-carte">
                        <div className="personnel-avatar">{u.prenom?.[0]}{u.nom?.[0]}</div>
                        <div className="personnel-infos">
                          <p className="personnel-nom">{u.prenom} {u.nom}</p>
                          <p className="personnel-email">{u.email}</p>
                          {affectation?.Hopital && <p className="personnel-detail">{affectation.Hopital.nom}{affectation.Specialite ? ` • ${affectation.Specialite.nom}` : ""}</p>}
                        </div>
                        <button className="personnel-btn-supprimer" onClick={() => supprimer(u.id, `${u.prenom} ${u.nom}`)}>Supprimer</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}

          {donnees.medecins.length === 0 && donnees.responsables.length === 0 && donnees.accueil.length === 0 && donnees.administrateurs.length === 0 && (
            <p className="personnel-message">Aucun membre du personnel pour l'instant.</p>
          )}
        </>
      )}

      {afficherFormulaire && (
        <div className="personnel-modal-fond">
          <div className="personnel-modal">
            {!compteCree ? (
              <>
                <h2>Ajouter un membre du personnel</h2>

                <label className="personnel-label">Rôle</label>
                <select name="role" value={formulaire.role} onChange={champChange} className="personnel-input">
                  <option value="medecin">Médecin (ou autre fonction soignante)</option>
                  <option value="responsable">Responsable de service</option>
                  <option value="accueil">Agent de guichet</option>
                  <option value="administrateur">Administrateur</option>
                </select>

                <div className="personnel-ligne-champs">
                  <div>
                    <label className="personnel-label">Prénom</label>
                    <input type="text" name="prenom" value={formulaire.prenom} onChange={champChange} className="personnel-input" />
                  </div>
                  <div>
                    <label className="personnel-label">Nom</label>
                    <input type="text" name="nom" value={formulaire.nom} onChange={champChange} className="personnel-input" />
                  </div>
                </div>

                <label className="personnel-label">Email</label>
                <input type="email" name="email" value={formulaire.email} onChange={champChange} className="personnel-input" placeholder="exemple@hopital.sn" />

                <label className="personnel-label">Téléphone (optionnel)</label>
                <input type="text" name="telephone" value={formulaire.telephone} onChange={champChange} className="personnel-input" placeholder="77 123 45 67" />

                {formulaire.role === "medecin" && (
                  <>
                    <label className="personnel-label">Fonction</label>
                    <input type="text" name="fonction" value={formulaire.fonction} onChange={champChange} className="personnel-input" placeholder="Ex : Médecin généraliste, Sage-femme, Infirmier..." />
                  </>
                )}

                {(formulaire.role === "medecin" || formulaire.role === "responsable" || formulaire.role === "accueil") && (
                  <>
                    <label className="personnel-label">Hôpital</label>
                    <select name="hopitalId" value={formulaire.hopitalId} onChange={champChange} className="personnel-input">
                      <option value="">Sélectionner un hôpital</option>
                      {hopitaux.map((h) => <option key={h.id} value={h.id}>{h.nom}</option>)}
                    </select>
                  </>
                )}

                {(formulaire.role === "medecin" || formulaire.role === "responsable") && hopitalSelectionne && (
                  <>
                    <label className="personnel-label">Spécialité</label>
                    <select name="specialiteId" value={formulaire.specialiteId} onChange={champChange} className="personnel-input">
                      <option value="">Sélectionner une spécialité</option>
                      {hopitalSelectionne.specialitesAvecId.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                    </select>
                  </>
                )}

                {(formulaire.role === "medecin" || formulaire.role === "responsable") && (
                  <>
                    <label className="personnel-label">Matricule (optionnel)</label>
                    <input type="text" name="matriculeOuPoste" value={formulaire.matriculeOuPoste} onChange={champChange} className="personnel-input" />
                  </>
                )}

                {erreur && <p className="personnel-erreur">{erreur}</p>}

                <div className="personnel-modal-boutons">
                  <button className="personnel-btn-annuler" onClick={fermerFormulaire}>Annuler</button>
                  <button className="personnel-btn-creer" onClick={soumettre} disabled={enregistrement}>
                    {enregistrement ? "Création..." : "Créer le compte"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Compte créé avec succès</h2>
                <p className="personnel-recap">
                  Communiquez ces identifiants à <strong>{compteCree.utilisateur.prenom} {compteCree.utilisateur.nom}</strong> :
                </p>
                <div className="personnel-identifiants">
                  <p>Email : <strong>{compteCree.utilisateur.email}</strong></p>
                  <p>Mot de passe temporaire : <strong>{compteCree.motDePasseTemporaire}</strong></p>
                </div>
                <button className="personnel-btn-creer" onClick={fermerFormulaire}>Fermer</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Personnel;