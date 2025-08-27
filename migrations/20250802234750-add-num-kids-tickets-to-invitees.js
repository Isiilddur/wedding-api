'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Invitees', 'numKidsTickets', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of tickets confirmed for children'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Invitees', 'numKidsTickets');
  }
};
