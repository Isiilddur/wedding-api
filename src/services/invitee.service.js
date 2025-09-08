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

  /**
   * Find all invitees with pagination and search
   * @param {Object} options - Query options
   * @param {Object} options.filters - Filter criteria
   * @param {string} options.search - Search term
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order (ASC/DESC)
   */
  static async findAllPaginated({ filters = {}, search, page = 1, limit = 50, sortBy = 'firstName', sortOrder = 'ASC' }) {
    const where = { ...filters };
    
    // Add search functionality
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { pin: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    return Invitee.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [{ 
        model: Event, 
        as: 'event', 
        attributes: ['id', 'name', 'date', 'time', 'location', 'type'] 
      }]
    });
  }

  /**
   * Get comprehensive statistics for backoffice
   */
  static async getStats() {
    const [
      totalInvitees,
      confirmedInvitees,
      rejectedInvitees,
      invitationsSent,
      familiesWithKids,
      ticketStats
    ] = await Promise.all([
      // Total invitees
      Invitee.count(),
      
      // Confirmed invitees
      Invitee.count({ where: { isConfirmed: true } }),
      
      // Rejected invitees
      Invitee.count({ where: { isRejected: true } }),
      
      // Invitations sent
      Invitee.count({ where: { invitationSent: true } }),
      
      // Families with kids
      Invitee.count({ where: { hasKids: true } }),
      
      // Ticket statistics
      Invitee.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('numOfTickets')), 'totalAdultTickets'],
          [sequelize.fn('SUM', sequelize.col('numKidsTickets')), 'totalKidsTickets'],
          [sequelize.fn('SUM', sequelize.col('numOfTicketsConfirmed')), 'confirmedAdultTickets'],
          [sequelize.fn('SUM', sequelize.col('numKidsTicketsConfirmed')), 'confirmedKidsTickets']
        ],
        raw: true
      })
    ]);

    const stats = ticketStats[0] || {};
    
    return {
      totalInvitees,
      confirmedInvitees,
      rejectedInvitees,
      invitationsSent,
      familiesWithKids,
      totalAdultTickets: parseInt(stats.totalAdultTickets) || 0,
      totalKidsTickets: parseInt(stats.totalKidsTickets) || 0,
      confirmedAdultTickets: parseInt(stats.confirmedAdultTickets) || 0,
      confirmedKidsTickets: parseInt(stats.confirmedKidsTickets) || 0
    };
  }
}

module.exports = InviteeService;
