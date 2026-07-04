import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexte/AuthContext";
import { IconeEmail, IconeTelephone, IconePin, IconeCalendrier, IconeCrayon } from "../../composants/commun/Icones";
import "./MonProfil.css";

function MonProfil() {
  const { token, mettreAJourUtilisateur } = useAuth();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);

  const [editionIdentite, setEditionIdentite] = useState(false);
  const [editionCoordonnees, setEditionCoordonnees] = useState(false);
  const [editionEtatCivil, setEditionEtatCivil] = useState(false);

  const [formIdentite, setFormIdentite] = useState({});
  const [formCoordonnees, setFormCoordonnees] = useState({});
  const [formEtatCivil, setFormEtatCivil] = useState({});

  const [enregistrement, setEnregistrement] = useState(false);
  const [messageSucces, setMessageSucces] = useState("");

  useEffect(() => {
    async function chargerProfil() {
      try {
        const reponse = await axios.get("http://localhost:5000/api/patient/mon-profil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfil(reponse.data);
        setFormIdentite({ nom: reponse.data.nom, prenom: reponse.data.prenom });
        setFormCoordonnees({ adresse: reponse.data.adresse });
        setFormEtatCivil({
          dateNaissance: reponse.data.dateNaissance,
          lieuDeNaissance: reponse.data.lieuDeNaissance,
          sexe: reponse.data.sexe,
        });
      } catch (erreur) {
        console.error(erreur);
      } finally {
        setChargement(false);
      }
    }
    chargerProfil();
  }, [token]);

  const enregistrerIdentite = async () => {
    setEnregistrement(true);
    try {
      const reponse = await axios.put(
        "http://localhost:5000/api/patient/mon-identite",
        formIdentite,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfil({ ...profil, ...formIdentite });
      mettreAJourUtilisateur(reponse.data.utilisateur);
      setEditionIdentite(false);
      setMessageSucces("Identité mise à jour avec succès.");
    } catch (erreur) {
      console.error(erreur);
    } finally {
      setEnregistrement(false);
    }
  };

  const enregistrerCoordonnees = async () => {
    setEnregistrement(true);
    try {
      await axios.put(
        "http://localhost:5000/api/patient/mon-profil",
        { ...formEtatCivil, adresse: formCoordonnees.adresse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfil({ ...profil, adresse: formCoordonnees.adresse });
      setEditionCoordonnees(false);
      setMessageSucces("Coordonnées mises à jour avec succès.");
    } catch (erreur) {
      console.error(erreur);
    } finally {
      setEnregistrement(false);
    }
  };

  const enregistrerEtatCivil = async () => {
    setEnregistrement(true);
    try {
      await axios.put(
        "http://localhost:5000/api/patient/mon-profil",
        { ...formEtatCivil, adresse: formCoordonnees.adresse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfil({ ...profil, ...formEtatCivil });
      setEditionEtatCivil(false);
      setMessageSucces("État civil mis à jour avec succès.");
    } catch (erreur) {
      console.error(erreur);
    } finally {
      setEnregistrement(false);
    }
  };

  if (chargement) return <p>Chargement de votre profil...</p>;

  return (
    <div>
      <div className="profil-banniere">
        <div className="forme-decorative forme-1"></div>
        <div className="forme-decorative forme-2"></div>
        <div className="profil-avatar-grand">
          {profil.prenom?.[0]}{profil.nom?.[0]}
        </div>
        <div>
          <h1 className="profil-nom-complet">{profil.prenom} {profil.nom}</h1>
          <span className="profil-badge-role">Patient</span>
        </div>
      </div>

      {messageSucces && <p className="profil-message-succes">{messageSucces}</p>}

      <div className="profil-grille">
        {/* BLOC IDENTITÉ */}
        <div className="profil-bloc">
          <div className="profil-bloc-entete">
            <h3 className="profil-bloc-titre">Identité</h3>
            {!editionIdentite && (
              <button className="profil-btn-crayon" onClick={() => setEditionIdentite(true)}>
                <IconeCrayon taille={18} />
              </button>
            )}
          </div>

          {!editionIdentite ? (
            <>
              <div className="profil-ligne">
                <div>
                  <p className="profil-label">Prénom</p>
                  <p className="profil-valeur">{profil.prenom}</p>
                </div>
              </div>
              <div className="profil-ligne">
                <div>
                  <p className="profil-label">Nom</p>
                  <p className="profil-valeur">{profil.nom}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <label className="profil-label-edition">Prénom</label>
              <input type="text" value={formIdentite.prenom || ""} onChange={(e) => setFormIdentite({ ...formIdentite, prenom: e.target.value })} className="profil-input" />
              <label className="profil-label-edition">Nom</label>
              <input type="text" value={formIdentite.nom || ""} onChange={(e) => setFormIdentite({ ...formIdentite, nom: e.target.value })} className="profil-input" />
              <div className="profil-boutons-edition">
                <button className="profil-btn-annuler" onClick={() => { setEditionIdentite(false); setFormIdentite({ nom: profil.nom, prenom: profil.prenom }); }}>Annuler</button>
                <button className="profil-btn-enregistrer" onClick={enregistrerIdentite} disabled={enregistrement}>
                  {enregistrement ? "..." : "Enregistrer"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* BLOC COORDONNÉES */}
        <div className="profil-bloc">
          <div className="profil-bloc-entete">
            <h3 className="profil-bloc-titre">Coordonnées</h3>
            {!editionCoordonnees && (
              <button className="profil-btn-crayon" onClick={() => setEditionCoordonnees(true)}>
                <IconeCrayon taille={18} />
              </button>
            )}
          </div>

          <div className="profil-ligne">
            <IconeEmail taille={20} />
            <div>
              <p className="profil-label">Email</p>
              <p className="profil-valeur">{profil.email || "Non renseigné"}</p>
            </div>
          </div>
          <div className="profil-ligne">
            <IconeTelephone taille={20} />
            <div>
              <p className="profil-label">Téléphone</p>
              <p className="profil-valeur">{profil.telephone || "Non renseigné"}</p>
            </div>
          </div>

          {!editionCoordonnees ? (
            <div className="profil-ligne">
              <IconePin taille={20} />
              <div>
                <p className="profil-label">Adresse</p>
                <p className="profil-valeur">{profil.adresse || "Non renseignée"}</p>
              </div>
            </div>
          ) : (
            <>
              <label className="profil-label-edition">Adresse</label>
              <input type="text" value={formCoordonnees.adresse || ""} onChange={(e) => setFormCoordonnees({ ...formCoordonnees, adresse: e.target.value })} className="profil-input" placeholder="Ex : Sicap Liberté 6, Dakar" />
              <p className="profil-note">Email et téléphone ne peuvent pas être modifiés ici pour des raisons de sécurité.</p>
              <div className="profil-boutons-edition">
                <button className="profil-btn-annuler" onClick={() => { setEditionCoordonnees(false); setFormCoordonnees({ adresse: profil.adresse }); }}>Annuler</button>
                <button className="profil-btn-enregistrer" onClick={enregistrerCoordonnees} disabled={enregistrement}>
                  {enregistrement ? "..." : "Enregistrer"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* BLOC ÉTAT CIVIL */}
        <div className="profil-bloc">
          <div className="profil-bloc-entete">
            <h3 className="profil-bloc-titre">État civil</h3>
            {!editionEtatCivil && (
              <button className="profil-btn-crayon" onClick={() => setEditionEtatCivil(true)}>
                <IconeCrayon taille={18} />
              </button>
            )}
          </div>

          {!editionEtatCivil ? (
            <>
              <div className="profil-ligne">
                <IconeCalendrier taille={20} />
                <div>
                  <p className="profil-label">Date de naissance</p>
                  <p className="profil-valeur">{profil.dateNaissance || "Non renseignée"}</p>
                </div>
              </div>
              <div className="profil-ligne">
                <IconePin taille={20} />
                <div>
                  <p className="profil-label">Lieu de naissance</p>
                  <p className="profil-valeur">{profil.lieuDeNaissance || "Non renseigné"}</p>
                </div>
              </div>
              <div className="profil-ligne">
                <div>
                  <p className="profil-label">Sexe</p>
                  <p className="profil-valeur">{profil.sexe || "Non renseigné"}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <label className="profil-label-edition">Date de naissance</label>
              <input type="date" value={formEtatCivil.dateNaissance || ""} onChange={(e) => setFormEtatCivil({ ...formEtatCivil, dateNaissance: e.target.value })} className="profil-input" />
              <label className="profil-label-edition">Lieu de naissance</label>
              <input type="text" value={formEtatCivil.lieuDeNaissance || ""} onChange={(e) => setFormEtatCivil({ ...formEtatCivil, lieuDeNaissance: e.target.value })} className="profil-input" placeholder="Ex : Dakar" />
              <label className="profil-label-edition">Sexe</label>
              <select value={formEtatCivil.sexe || ""} onChange={(e) => setFormEtatCivil({ ...formEtatCivil, sexe: e.target.value })} className="profil-input">
                <option value="">Sélectionner</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
              <div className="profil-boutons-edition">
                <button className="profil-btn-annuler" onClick={() => { setEditionEtatCivil(false); setFormEtatCivil({ dateNaissance: profil.dateNaissance, lieuDeNaissance: profil.lieuDeNaissance, sexe: profil.sexe }); }}>Annuler</button>
                <button className="profil-btn-enregistrer" onClick={enregistrerEtatCivil} disabled={enregistrement}>
                  {enregistrement ? "..." : "Enregistrer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonProfil;