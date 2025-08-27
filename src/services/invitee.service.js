// src/services/invitee.service.js
const { Invitee, Event, sequelize } = require('../../models');
const { Op } = require('sequelize');

class InviteeService {
  /**
   * Find a single invitee by PIN (and include its Event if you need)
   */
  static async findByPin(pin) {
    return Invitee.findOne({
      where: { pin },
      include: [{ model: Event, as: 'event', attributes: ['id','name','date','time','location','type'] }]
    });
  }

  /**
   * Find all invitees, optionally filtering by confirmation status
   * @param {{ isConfirmed?: boolean, invitationSent?: boolean }} filter 
   */
  static async findAll(filter = {}) {
    const where = {};
    if (typeof filter.isConfirmed === 'boolean') where.isConfirmed = filter.isConfirmed;
    if (typeof filter.invitationSent === 'boolean') where.invitationSent = filter.invitationSent;
    return Invitee.findAll({ where });
  }

  /**
   * Mark an invitee's invitationSent = true
   */
  static async markSent(inviteeId) {
    return Invitee.update(
      { invitationSent: true },
      { where: { id: inviteeId } }
    );
  }

  /**
   * Confirm an invitee: set hasKids, numOfTicketsConfirmed and numKidsTicketsConfirmed atomically
   */
  static async confirm(inviteeId, { hasKids, numOfTicketsConfirmed, numKidsTicketsConfirmed = 0 }) {
    return sequelize.transaction(async t => {
      const inv = await Invitee.findByPk(inviteeId, { transaction: t });
      if (numOfTicketsConfirmed > inv.numOfTickets) {
        const err = new Error('Confirmed tickets exceed allocation');
        err.status = 400;
        throw err;
      }
      inv.hasKids = hasKids;
      inv.numOfTicketsConfirmed = numOfTicketsConfirmed;
      inv.numKidsTicketsConfirmed = numKidsTicketsConfirmed;
      inv.isConfirmed = true;
      inv.isRejected = false;
      await inv.save({ transaction: t });
      return inv;
    });
  }

  /**
   * Reject an invitee
   */
  static async reject(inviteeId) {
    return sequelize.transaction(async t => {
      const inv = await Invitee.findByPk(inviteeId, { transaction: t });
      inv.isRejected = true;
      inv.isConfirmed = false;
      inv.numOfTicketsConfirmed = 0;
      inv.numKidsTicketsConfirmed = 0;
      await inv.save({ transaction: t });
      return inv;
    });
  }
}

module.exports = InviteeService;
