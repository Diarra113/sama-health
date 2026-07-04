require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");

require("./src/modeles/Utilisateur");
require("./src/modeles/Patient");
require("./src/modeles/Hopital");
require("./src/modeles/Specialite");
require("./src/modeles/HopitalSpecialite");
require("./src/modeles/RendezVous");
require("./src/modeles/Ticket");
require("./src/modeles/Paiement");
require("./src/modeles/Administrateur");
require("./src/modeles/Medecin");
require("./src/modeles/ResponsableService");
require("./src/modeles/PresenceJour");
require("./src/modeles/Planning");

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Connexion à la base de données réussie ✅");
    return sequelize.sync();
  })
  .then(() => {
    console.log("Tables synchronisées avec la base de données ✅");
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur de connexion ou de synchronisation ❌", err);
  });