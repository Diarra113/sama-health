const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Medecin = require("./Medecin");

const PresenceJour = sequelize.define("PresenceJour", {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  present: { type: DataTypes.BOOLEAN, defaultValue: true },
});

PresenceJour.belongsTo(Medecin, { foreignKey: "medecinId" });
Medecin.hasMany(PresenceJour, { foreignKey: "medecinId" });

module.exports = PresenceJour;