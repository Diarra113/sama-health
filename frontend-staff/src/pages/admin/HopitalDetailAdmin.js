import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconePin, IconeCrayon, IconeCorbeille, IconeAppareilPhoto, IconeChevron, IconeTelephone } from "../../composants/commun/Icones";
import "./HopitalDetailAdmin.css";

function HopitalDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const enTetes = { headers: { Authorization: `Bearer ${token}` } };

  const [hopital, setHopital] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [personnel, setPersonnel] = useState({ medecins: [], responsables: [] });
  const [toutesSpecialites, setToutesSpecialites] = useState([]);
  const [ouvertes, setOuvertes] = useState({});
  const [rechercheStaff, setRechercheStaff] = useState("");

  const [modeEditionHopital, setModeEditionHopital] = useState(false);
  const [formHopital, setFormHopital] = useState({});

  const [modal, setModal] = useState(null);
  const [formModal, setFormModal] = useState({});
  const [erreurModal, setErreurModal] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [compteCree, setCompteCree] = useState(null);

  useEffect(() => {
    chargerHopital();
    chargerPersonnel();
    chargerToutesSpecialites();
  }, [id]);

  async function chargerHopital() {
    try {
      const r = await axios.get(`http://localhost:5000/api/hopitaux/${id}`);
      setHopital(r.data);
      setFormHopital(r.data);
    } catch (e) { console.error(e); } finally { setChargement(false); }
  }

  async function chargerPersonnel() {
    try {
      const r = await axios.get("http://localhost:5000/api/admin/personnel", enTetes);
      const idNum = parseInt(id);
      setPersonnel({
        medecins: r.data.medecins.filter((u) => u.Medecin?.hopitalId === idNum),
        responsables: r.data.responsables.filter((u) => u.ResponsableService?.hopitalId === idNum),
      });
    } catch (e) { console.error(e); }
  }

  async function chargerToutesSpecialites() {
    try {
      const r = await axios.get("http://localhost:5000/api/specialites");
      setToutesSpecialites(r.data);
    } catch (e) { console.error(e); }
  }

  const toggleSpecialite = (specId) => setOuvertes({ ...ouvertes, [specId]: !ouvertes[specId] });
  const enleverAccents = (texte) => texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const correspond = (u) => rechercheStaff === "" || enleverAccents(`${u.prenom} ${u.nom}`).includes(enleverAccents(rechercheStaff));

  const champHopitalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormHopital({ ...formHopital, [name]: type === "checkbox" ? checked : value });
  };

  const enregistrerHopital = async () => {
    await axios.put(`http://localhost:5000/api/hopitaux/${id}`, formHopital, enTetes);
    setModeEditionHopital(false);
    chargerHopital();
  };

  const supprimerHopital = async () => {
    if (!window.confirm(`Supprimer définitivement ${hopital.nom} ?`)) return;
    await axios.delete(`http://localhost:5000/api/hopitaux/${id}`, enTetes);
    navigate("/admin/hopitaux");
  };

  const changerPhoto = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;
    const fd = new FormData();
    fd.append("photo", fichier);
    await axios.post(`http://localhost:5000/api/hopitaux/${id}/photo`, fd, {
      headers: { ...enTetes.headers, "Content-Type": "multipart/form-data" },
    });
    chargerHopital();
  };

  const ouvrirModal = (type, specialiteId = null, donneesInit = {}) => {
    setModal({ type, specialiteId });
    setFormModal(donneesInit);
    setErreurModal("");
    setCompteCree(null);
  };

  const fermerModal = () => { setModal(null); setFormModal({}); setErreurModal(""); setCompteCree(null); };

  const champModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormModal({ ...formModal, [name]: type === "checkbox" ? checked : value });
  };

  const soumettreAjoutSpecialite = async () => {
    setErreurModal("");
    if (!formModal.specialiteId && !formModal.nomNouvelleSpecialite?.trim()) {
      setErreurModal("Choisissez une spécialité existante ou indiquez un nouveau nom.");
      return;
    }
    setEnregistrement(true);
    try {
      await axios.post(`http://localhost:5000/api/hopitaux/${id}/specialites`, formModal, enTetes);
      chargerHopital();
      chargerToutesSpecialites();
      fermerModal();
    } catch (erreur) {
      setErreurModal(erreur.response?.data?.message || "Erreur.");
    } finally { setEnregistrement(false); }
  };

  const soumettreModifSpecialite = async () => {
    setEnregistrement(true);
    try {
      await axios.put(`http://localhost:5000/api/hopitaux/${id}/specialites/${modal.specialiteId}`, formModal, enTetes);
      chargerHopital();
      fermerModal();
    } catch (erreur) {
      setErreurModal(erreur.response?.data?.message || "Erreur.");
    } finally { setEnregistrement(false); }
  };

  const retirerSpecialiteHopital = async (specialiteId, nom) => {
    if (!window.confirm(`Retirer "${nom}" de cet hôpital ?`)) return;
    await axios.delete(`http://localhost:5000/api/hopitaux/${id}/specialites/${specialiteId}`, enTetes);
    chargerHopital();
  };

  const soumettreStaff = async () => {
    setErreurModal("");
    if (!formModal.nom?.trim() || !formModal.prenom?.trim() || !formModal.email?.trim()) {
      setErreurModal("Nom, prénom et email sont obligatoires.");
      return;
    }
    setEnregistrement(true);
    try {
      const reponse = await axios.post("http://localhost:5000/api/admin/personnel", {
        ...formModal,
        hopitalId: id,
        specialiteId: modal.specialiteId,
        role: formModal.role,
      }, enTetes);
      setCompteCree(reponse.data);
      chargerPersonnel();
    } catch (erreur) {
      setErreurModal(erreur.response?.data?.message || "Erreur.");
    } finally { setEnregistrement(false); }
  };

  const supprimerStaff = async (idU, nomComplet) => {
    if (!window.confirm(`Supprimer le compte de ${nomComplet} ?`)) return;
    await axios.delete(`http://localhost:5000/api/admin/personnel/${idU}`, enTetes);
    chargerPersonnel();
  };

  if (chargement) return <p className="hda-message">Chargement...</p>;
  if (!hopital) return <p className="hda-message">Hôpital introuvable.</p>;

  const specialitesNonAjoutees = toutesSpecialites.filter(
    (s) => !hopital.specialitesAvecId.some((sa) => sa.id === s.id)
  );

  return (
    <div>
      <button className="hda-retour" onClick={() => navigate("/admin/hopitaux")}>← Tous les hôpitaux</button>

      {/* CARTE INFO HÔPITAL */}
      <div className="hda-carte-info">
        <div className="hda-photo-zone">
          <img src={hopital.photo || "https://via.placeholder.com/160x160?text=Photo"} alt={hopital.nom} className="hda-photo" />
          <label className="hda-btn-photo">
            <IconeAppareilPhoto taille={16} /> Changer
            <input type="file" accept="image/*" onChange={changerPhoto} hidden />
          </label>
        </div>

        <div className="hda-infos-principales">
          {!modeEditionHopital ? (
            <>
              <div className="hda-entete-info">
                <h1>{hopital.nom}</h1>
                <div className="hda-actions-info">
                  <button className="hda-btn-icone" onClick={() => setModeEditionHopital(true)}><IconeCrayon taille={18} /></button>
                  <button className="hda-btn-icone hda-btn-icone-danger" onClick={supprimerHopital}><IconeCorbeille taille={18} /></button>
                </div>
              </div>
              <p className="hda-adresse"><IconePin taille={16} /> {hopital.adresse}</p>
              {hopital.telephone && <p className="hda-detail"><IconeTelephone taille={16} /> {hopital.telephone}</p>}
              {hopital.urgences24h && <span className="hda-badge-urgence">Urgences 24h/24</span>}
            </>
          ) : (
            <>
              <label className="hda-label">Nom</label>
              <input type="text" name="nom" value={formHopital.nom || ""} onChange={champHopitalChange} className="hda-input" />
              <label className="hda-label">Adresse</label>
              <input type="text" name="adresse" value={formHopital.adresse || ""} onChange={champHopitalChange} className="hda-input" />
              <label className="hda-label">Téléphone</label>
              <input type="text" name="telephone" value={formHopital.telephone || ""} onChange={champHopitalChange} className="hda-input" />
              <label className="hda-checkbox-ligne">
                <input type="checkbox" name="urgences24h" checked={formHopital.urgences24h || false} onChange={champHopitalChange} />
                Urgences 24h/24
              </label>
              <div className="hda-boutons-edition">
                <button className="hda-btn-annuler" onClick={() => { setModeEditionHopital(false); setFormHopital(hopital); }}>Annuler</button>
                <button className="hda-btn-creer" onClick={enregistrerHopital}>Enregistrer</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SPÉCIALITÉS */}
      <div className="hda-section">
        <div className="hda-entete-section">
          <h2>Spécialités</h2>
          <button className="hda-btn-ajouter" onClick={() => ouvrirModal("ajouterSpecialite")}>+ Ajouter une spécialité</button>
        </div>

        <input
          type="text"
          placeholder="Rechercher un membre du personnel (médecin, responsable)..."
          value={rechercheStaff}
          onChange={(e) => setRechercheStaff(e.target.value)}
          className="hda-recherche"
        />

        {hopital.specialitesAvecId.length === 0 && <p className="hda-message">Aucune spécialité pour cet hôpital.</p>}

        {hopital.specialitesAvecId.map((spec) => {
          const medecinsSpec = personnel.medecins.filter((u) => u.Medecin?.specialiteId === spec.id && correspond(u));
          const responsablesSpec = personnel.responsables.filter((u) => u.ResponsableService?.specialiteId === spec.id && correspond(u));
          const aDesResultats = medecinsSpec.length > 0 || responsablesSpec.length > 0;
          const estOuverte = rechercheStaff !== "" ? aDesResultats : ouvertes[spec.id];

          return (
            <div key={spec.id} className="hda-carte-specialite">
              <button className="hda-entete-specialite" onClick={() => toggleSpecialite(spec.id)}>
                <span className="hda-nom-specialite">{spec.nom}</span>
                <IconeChevron taille={18} />
              </button>

              {estOuverte && (
                <div className="hda-contenu-specialite">
                  <div className="hda-ligne-actions-specialite">
                    <button className="hda-lien-supprimer" onClick={() => retirerSpecialiteHopital(spec.id, spec.nom)}>
                      Retirer cette spécialité de l'hôpital
                    </button>
                  </div>

                  <div className="hda-sous-groupe">
                    <div className="hda-sous-entete">
                      <h4>Responsable de service</h4>
                      {responsablesSpec.length === 0 && (
                        <button className="hda-btn-petit" onClick={() => ouvrirModal("ajouterStaff", spec.id, { role: "responsable" })}>+ Ajouter</button>
                      )}
                    </div>
                    {responsablesSpec.map((u) => (
                      <div key={u.id} className="hda-carte-staff">
                        <div className="hda-avatar-staff">{u.prenom?.[0]}{u.nom?.[0]}</div>
                        <div className="hda-infos-staff">
                          <p className="hda-nom-staff">{u.prenom} {u.nom}</p>
                          <p className="hda-email-staff">{u.email}</p>
                        </div>
                        <button className="hda-btn-supprimer-staff" onClick={() => supprimerStaff(u.id, `${u.prenom} ${u.nom}`)}>Supprimer</button>
                      </div>
                    ))}
                  </div>

                  <div className="hda-sous-groupe">
                    <div className="hda-sous-entete">
                      <h4>Médecins</h4>
                      <button className="hda-btn-petit" onClick={() => ouvrirModal("ajouterStaff", spec.id, { role: "medecin" })}>+ Ajouter</button>
                    </div>
                    {medecinsSpec.length === 0 && <p className="hda-message-petit">Aucun médecin pour l'instant.</p>}
                    {medecinsSpec.map((u) => (
                      <div key={u.id} className="hda-carte-staff">
                        <div className="hda-avatar-staff">{u.prenom?.[0]}{u.nom?.[0]}</div>
                        <div className="hda-infos-staff">
                          <p className="hda-nom-staff">{u.prenom} {u.nom}</p>
                          <p className="hda-email-staff">{u.email}{u.Medecin?.fonction ? ` • ${u.Medecin.fonction}` : ""}</p>
                        </div>
                        <button className="hda-btn-supprimer-staff" onClick={() => supprimerStaff(u.id, `${u.prenom} ${u.nom}`)}>Supprimer</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODALS */}
      {modal && (
        <div className="hda-modal-fond">
          <div className="hda-modal">
            {modal.type === "ajouterSpecialite" && (
              <>
                <h2>Ajouter une spécialité</h2>
                <label className="hda-label">Spécialité existante</label>
                <select name="specialiteId" value={formModal.specialiteId || ""} onChange={champModalChange} className="hda-input">
                  <option value="">— Ou créer une nouvelle ci-dessous —</option>
                  {specialitesNonAjoutees.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                <label className="hda-label">Nouvelle spécialité (si absente de la liste)</label>
                <input type="text" name="nomNouvelleSpecialite" value={formModal.nomNouvelleSpecialite || ""} onChange={champModalChange} className="hda-input" />
                <label className="hda-label">Quota journalier rendez-vous</label>
                <input type="number" name="quotaJournalier" value={formModal.quotaJournalier || ""} onChange={champModalChange} className="hda-input" />
                <label className="hda-label">Quota tickets du jour</label>
                <input type="number" name="quotaTickets" value={formModal.quotaTickets || ""} onChange={champModalChange} className="hda-input" />
                <label className="hda-label">Tarif consultation (FCFA)</label>
                <input type="number" name="tarifConsultation" value={formModal.tarifConsultation || ""} onChange={champModalChange} className="hda-input" />
                <div className="hda-ligne-champs">
                  <div>
                    <label className="hda-label">Heure début</label>
                    <input type="time" name="heureDebut" value={formModal.heureDebut || ""} onChange={champModalChange} className="hda-input" />
                  </div>
                  <div>
                    <label className="hda-label">Heure fin</label>
                    <input type="time" name="heureFin" value={formModal.heureFin || ""} onChange={champModalChange} className="hda-input" />
                  </div>
                </div>
                {erreurModal && <p className="hda-erreur">{erreurModal}</p>}
                <div className="hda-boutons-edition">
                  <button className="hda-btn-annuler" onClick={fermerModal}>Annuler</button>
                  <button className="hda-btn-creer" onClick={soumettreAjoutSpecialite} disabled={enregistrement}>{enregistrement ? "..." : "Ajouter"}</button>
                </div>
              </>
            )}

            {modal.type === "modifierSpecialite" && (
              <>
                <h2>Paramètres — {formModal.nom}</h2>
                <label className="hda-label">Quota journalier rendez-vous</label>
                <input type="number" name="quotaJournalier" value={formModal.quotaJournalier || ""} onChange={champModalChange} className="hda-input" />
                <label className="hda-label">Quota tickets du jour</label>
                <input type="number" name="quotaTickets" value={formModal.quotaTickets || ""} onChange={champModalChange} className="hda-input" />
                <label className="hda-label">Tarif consultation (FCFA)</label>
                <input type="number" name="tarifConsultation" value={formModal.tarifConsultation || ""} onChange={champModalChange} className="hda-input" />
                <label className="hda-label">Durée de validité du ticket (jours)</label>
                <input type="number" name="dureeValiditeJours" value={formModal.dureeValiditeJours || ""} onChange={champModalChange} className="hda-input" />
                <div className="hda-ligne-champs">
                  <div>
                    <label className="hda-label">Heure début</label>
                    <input type="time" name="heureDebut" value={formModal.heureDebut?.slice(0, 5) || ""} onChange={champModalChange} className="hda-input" />
                  </div>
                  <div>
                    <label className="hda-label">Heure fin</label>
                    <input type="time" name="heureFin" value={formModal.heureFin?.slice(0, 5) || ""} onChange={champModalChange} className="hda-input" />
                  </div>
                </div>
                {erreurModal && <p className="hda-erreur">{erreurModal}</p>}
                <div className="hda-boutons-edition">
                  <button className="hda-btn-annuler" onClick={fermerModal}>Annuler</button>
                  <button className="hda-btn-creer" onClick={soumettreModifSpecialite} disabled={enregistrement}>{enregistrement ? "..." : "Enregistrer"}</button>
                </div>
              </>
            )}

            {modal.type === "ajouterStaff" && !compteCree && (
              <>
                <h2>{formModal.role === "responsable" ? "Ajouter un responsable de service" : "Ajouter un médecin"}</h2>
                <div className="hda-ligne-champs">
                  <div>
                    <label className="hda-label">Prénom</label>
                    <input type="text" name="prenom" value={formModal.prenom || ""} onChange={champModalChange} className="hda-input" />
                  </div>
                  <div>
                    <label className="hda-label">Nom</label>
                    <input type="text" name="nom" value={formModal.nom || ""} onChange={champModalChange} className="hda-input" />
                  </div>
                </div>
                <label className="hda-label">Email</label>
                <input type="email" name="email" value={formModal.email || ""} onChange={champModalChange} className="hda-input" />
                <label className="hda-label">Téléphone (optionnel)</label>
                <input type="text" name="telephone" value={formModal.telephone || ""} onChange={champModalChange} className="hda-input" />
                {formModal.role === "medecin" && (
                  <>
                    <label className="hda-label">Fonction</label>
                    <input type="text" name="fonction" value={formModal.fonction || ""} onChange={champModalChange} className="hda-input" placeholder="Médecin généraliste, Sage-femme..." />
                  </>
                )}
                {erreurModal && <p className="hda-erreur">{erreurModal}</p>}
                <div className="hda-boutons-edition">
                  <button className="hda-btn-annuler" onClick={fermerModal}>Annuler</button>
                  <button className="hda-btn-creer" onClick={soumettreStaff} disabled={enregistrement}>{enregistrement ? "..." : "Créer le compte"}</button>
                </div>
              </>
            )}

            {compteCree && (
              <>
                <h2>Compte créé avec succès</h2>
                <p>Communiquez ces identifiants à <strong>{compteCree.utilisateur.prenom} {compteCree.utilisateur.nom}</strong> :</p>
                <div className="hda-identifiants">
                  <p>Email : <strong>{compteCree.utilisateur.email}</strong></p>
                  <p>Mot de passe : <strong>{compteCree.motDePasseTemporaire}</strong></p>
                </div>
                <button className="hda-btn-creer" onClick={fermerModal}>Fermer</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HopitalDetailAdmin;