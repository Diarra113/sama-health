const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Utilisateur = require("./Utilisateur");

const Administrateur = sequelize.define("Administrateur", {
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Administrateur.belongsTo(Utilisateur, { foreignKey: "utilisateurId", onDelete: "CASCADE" });
Utilisateur.hasOne(Administrateur, { foreignKey: "utilisateurId" });

module.exports = Administrateur;