const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Utilisateur = require("./Utilisateur");

const Patient = sequelize.define("Patient", {
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateNaissance: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  lieuDeNaissance: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sexe: {
    type: DataTypes.ENUM("homme", "femme"),
    allowNull: true,
  },
});

Patient.belongsTo(Utilisateur, { foreignKey: "utilisateurId", onDelete: "CASCADE" });
Utilisateur.hasOne(Patient, { foreignKey: "utilisateurId" });

module.exports = Patient;