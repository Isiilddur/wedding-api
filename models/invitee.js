'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invitee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un invitado pertenece a un evento
      Invitee.belongsTo(models.Event, {
        foreignKey: 'eventId',
        as: 'event'
      });
    }
  }
  Invitee.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    hasKids: DataTypes.BOOLEAN,
    numOfTickets: DataTypes.INTEGER,
    isConfirmed: DataTypes.BOOLEAN,
    isRejected: DataTypes.BOOLEAN,
    numOfTicketsConfirmed: DataTypes.INTEGER,
    numKidsTicketsConfirmed: DataTypes.INTEGER,
    table: DataTypes.STRING,
    pin: DataTypes.STRING,
    invitationSent: DataTypes.BOOLEAN,
    eventId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Invitee',
  });
  return Invitee;
};
