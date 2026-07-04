const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HopitalSpecialite = sequelize.define(
  "HopitalSpecialite",
  {
    quotaJournalier: { type: DataTypes.INTEGER, allowNull: true },
    quotaTickets: { type: DataTypes.INTEGER, allowNull: true },
    heureDebut: { type: DataTypes.TIME, allowNull: true },
    heureFin: { type: DataTypes.TIME, allowNull: true },
    tarifConsultation: { type: DataTypes.INTEGER, allowNull: true },
    dureeValiditeJours: { type: DataTypes.INTEGER, allowNull: true },
    dureeMoyenneConsultation: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 15 },
    joursOuverture: { type: DataTypes.JSON, allowNull: true, defaultValue: [1, 2, 3, 4, 5] },
    heurePauseDebut: { type: DataTypes.TIME, allowNull: true },
    heurePauseFin: { type: DataTypes.TIME, allowNull: true },
  },
  { tableName: "HopitalSpecialite" }
);

module.exports = HopitalSpecialite;