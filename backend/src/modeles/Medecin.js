const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Utilisateur = require("./Utilisateur");
const Hopital = require("./Hopital");
const Specialite = require("./Specialite");

const Medecin = sequelize.define("Medecin", {
  matricule: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  fonction: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Médecin",
  },
});

Medecin.belongsTo(Utilisateur, { foreignKey: "utilisateurId", onDelete: "CASCADE" });
Utilisateur.hasOne(Medecin, { foreignKey: "utilisateurId" });

Medecin.belongsTo(Hopital, { foreignKey: "hopitalId" });
Medecin.belongsTo(Specialite, { foreignKey: "specialiteId" });

module.exports = Medecin;