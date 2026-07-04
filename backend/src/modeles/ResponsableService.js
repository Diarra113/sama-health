const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Utilisateur = require("./Utilisateur");
const Hopital = require("./Hopital");
const Specialite = require("./Specialite");

const ResponsableService = sequelize.define("ResponsableService", {
  matricule: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

ResponsableService.belongsTo(Utilisateur, { foreignKey: "utilisateurId", onDelete: "CASCADE" });
Utilisateur.hasOne(ResponsableService, { foreignKey: "utilisateurId" });

ResponsableService.belongsTo(Hopital, { foreignKey: "hopitalId" });
ResponsableService.belongsTo(Specialite, { foreignKey: "specialiteId" });

module.exports = ResponsableService;