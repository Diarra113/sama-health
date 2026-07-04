const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Patient = require("./Patient");
const Hopital = require("./Hopital");
const Specialite = require("./Specialite");

const Ticket = sequelize.define("Ticket", {
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  codeReservation: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  statut: {
    type: DataTypes.ENUM("en_attente", "valide", "termine"),
    defaultValue: "en_attente",
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  dateExpiration: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
});

Ticket.belongsTo(Patient, { foreignKey: "patientId" });
Ticket.belongsTo(Hopital, { foreignKey: "hopitalId" });
Ticket.belongsTo(Specialite, { foreignKey: "specialiteId" });

module.exports = Ticket;