const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Medecin = require("./Medecin");

const Planning = sequelize.define("Planning", {
  dateDebut: { type: DataTypes.DATEONLY, allowNull: false },
  dateFin: { type: DataTypes.DATEONLY, allowNull: false },
  commentaire: { type: DataTypes.TEXT, allowNull: true },
  statut: { type: DataTypes.ENUM("en_attente", "valide", "rejete"), defaultValue: "en_attente" },
  motifRejet: { type: DataTypes.STRING, allowNull: true },
});

Planning.belongsTo(Medecin, { foreignKey: "medecinId" });
Medecin.hasMany(Planning, { foreignKey: "medecinId" });

module.exports = Planning;