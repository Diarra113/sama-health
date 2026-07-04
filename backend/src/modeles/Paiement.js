const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const RendezVous = require("./RendezVous");
const Ticket = require("./Ticket");

const Paiement = sequelize.define("Paiement", {
  montant: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  modePaiement: {
    type: DataTypes.ENUM("wave", "orange_money"),
    allowNull: false,
  },
  dateTransaction: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  refTransaction: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  statut: {
    type: DataTypes.ENUM("en_attente", "reussi", "echoue"),
    defaultValue: "en_attente",
  },
});

// Un paiement concerne soit un RendezVous, soit un Ticket — jamais les deux à la fois
Paiement.belongsTo(RendezVous, { foreignKey: "rendezVousId", allowNull: true });
Paiement.belongsTo(Ticket, { foreignKey: "ticketId", allowNull: true });

module.exports = Paiement;