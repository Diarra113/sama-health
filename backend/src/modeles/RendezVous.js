const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Patient = require("./Patient");
const Hopital = require("./Hopital");
const Specialite = require("./Specialite");

const RendezVous = sequelize.define("RendezVous", {
  dateRDV: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  heureRDV: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM("en_attente", "confirme", "rejete", "termine"),
    defaultValue: "en_attente",
  },
  motifRejet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

RendezVous.belongsTo(Patient, { foreignKey: "patientId" });
RendezVous.belongsTo(Hopital, { foreignKey: "hopitalId" });
RendezVous.belongsTo(Specialite, { foreignKey: "specialiteId" });

module.exports = RendezVous;