const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Specialite = require("./Specialite");
const HopitalSpecialite = require("./HopitalSpecialite");

const Hopital = sequelize.define("Hopital", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  horaireOuverture: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  horaireFermeture: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  numFixe: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numeroCaisse: {
    type: DataTypes.STRING,
    allowNull: true,
 },
  siteWeb: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  presentation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  urgences24h: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Hopital.belongsToMany(Specialite, { through: HopitalSpecialite });
Specialite.belongsToMany(Hopital, { through: HopitalSpecialite });

module.exports = Hopital;