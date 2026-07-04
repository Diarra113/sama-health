const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Utilisateur = sequelize.define("Utilisateur", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  motDePasse: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("patient", "medecin", "responsable", "accueil", "administrateur"),
    allowNull: false,
    defaultValue: "patient",
  },
});

module.exports = Utilisateur;