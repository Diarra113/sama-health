const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Specialite = sequelize.define("Specialite", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Specialite;