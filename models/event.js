'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un evento puede tener muchos invitados
      Event.hasMany(models.Invitee, {
        foreignKey: 'eventId',
        as: 'invitees'
      });
    }
  }
  Event.init({
    name: DataTypes.STRING,
    date: DataTypes.DATE,
    time: DataTypes.STRING,
    location: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
