'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Invitees', 'numKidsTicketsConfirmed', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of kids tickets confirmed by the invitee'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Invitees', 'numKidsTicketsConfirmed');
  }
};
