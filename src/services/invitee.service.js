// src/services/invitee.service.js
const { Invitee, Event, sequelize } = require('../models');
const { Op } = require('sequelize');

class InviteeService {
  /**
   * Find a single invitee by PIN (and include its Event if you need)
   */
  static async findByPin(pin) {
    return Invitee.findOne({
      where: { pin },
      include: [{ model: Event, attributes: ['id','name','date','time','location','type'] }]
    });
  }

  /**
   * Find all invitees, optionally filtering by confirmation status
   * @param {{ isConfirmed?: boolean }} filter 
   */
  static async findAll({ isConfirmed } = {}) {
    const where = {};
    if (typeof isConfirmed === 'boolean') where.isConfirmed = isConfirmed;
    return Invitee.findAll({ where });
  }

  /**
   * Mark an invitee’s invitationSent = true
   */
  static async markSent(inviteeId) {
    return Invitee.update(
      { invitationSent: true },
      { where: { id: inviteeId } }
    );
  }

  /**
   * Confirm an invitee: set hasKids and numOfTicketsConfirmed atomically
   */
  static async confirm(inviteeId, { hasKids, numOfTicketsConfirmed }) {
    return sequelize.transaction(async t => {
      const inv = await Invitee.findByPk(inviteeId, { transaction: t });
      if (numOfTicketsConfirmed > inv.numOfTickets) {
        const err = new Error('Confirmed tickets exceed allocation');
        err.status = 400;
        throw err;
      }
      inv.hasKids = hasKids;
      inv.numOfTicketsConfirmed = numOfTicketsConfirmed;
      inv.isConfirmed = true;
      await inv.save({ transaction: t });
      return inv;
    });
  }
}

module.exports = InviteeService;
