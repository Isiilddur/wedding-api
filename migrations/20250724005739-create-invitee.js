'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invitees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      hasKids: {
        type: Sequelize.BOOLEAN
      },
      numOfTickets: {
        type: Sequelize.INTEGER
      },
      isConfirmed: {
        type: Sequelize.BOOLEAN
      },
      numOfTicketsConfirmed: {
        type: Sequelize.INTEGER
      },
      table: {
        type: Sequelize.STRING
      },
      pin: {
        type: Sequelize.STRING
      },
      invitationSent: {
        type: Sequelize.BOOLEAN
      },
      eventId: {
        type: Sequelize.UUID
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Invitees');
  }
};