// src/services/invitee.service.js
const { Invitee, Event, sequelize } = require('../../models');
const { Op } = require('sequelize');

const EXCLUDED_PINS = [
  '4rFm9L', // Israel Vázquez
  'KfcY6F', // Carlos Jiménez
  'LhxF8r', // Xóchitl Torres
  'cO28GD', // Pamela y Fernando
  'ydB3LE', // Uriel Fernández
  'cH452j', // María Fernanda Figueroa
  'JZ3NBS'  // Danahe Ribera
];

// Helper to always exclude pins
function excludePins(where = {}) {
  return { ...where, pin: { [Op.notIn]: EXCLUDED_PINS } };
}

class InviteeService {
  /**
   * Find a single invitee by PIN (and include its Event if you need)
   */
  static async findByPin(pin) {
    if (EXCLUDED_PINS.includes(pin)) return null;
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
    const where = excludePins(filter);
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
   * Confirm an invitee: set hasKids, numOfTicketsConfirmed, numKidsTicketsConfirmed, email and phone atomically
   */
  static async confirm(inviteeId, { hasKids, numOfTicketsConfirmed, numKidsTicketsConfirmed = 0, email, phone }) {
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
      
      // Update email and phone if provided
      if (email !== undefined) inv.email = email;
      if (phone !== undefined) inv.phone = phone;
      
      await inv.save({ transaction: t });
      return inv;
    });
  }

  /**
   * Reject an invitee and optionally update email and phone
   */
  static async reject(inviteeId, { email, phone } = {}) {
    return sequelize.transaction(async t => {
      const inv = await Invitee.findByPk(inviteeId, { transaction: t });
      inv.isRejected = true;
      inv.isConfirmed = false;
      inv.numOfTicketsConfirmed = 0;
      inv.numKidsTicketsConfirmed = 0;
      
      // Update email and phone if provided
      if (email !== undefined) inv.email = email;
      if (phone !== undefined) inv.phone = phone;
      
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
    const where = excludePins(filters);
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
    const exclude = excludePins();
    const [
      totalInvitees,
      confirmedInvitees,
      rejectedInvitees,
      invitationsSent,
      familiesWithKids,
      ticketStats
    ] = await Promise.all([
      Invitee.count({ where: exclude }),
      Invitee.count({ where: { ...exclude, isConfirmed: true } }),
      Invitee.count({ where: { ...exclude, isRejected: true } }),
      Invitee.count({ where: { ...exclude, invitationSent: true } }),
      Invitee.count({ where: { ...exclude, hasKids: true } }),
      Invitee.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('numOfTickets')), 'totalAdultTickets'],
          [sequelize.fn('SUM', sequelize.col('numKidsTickets')), 'totalKidsTickets'],
          [sequelize.fn('SUM', sequelize.col('numOfTicketsConfirmed')), 'confirmedAdultTickets'],
          [sequelize.fn('SUM', sequelize.col('numKidsTicketsConfirmed')), 'confirmedKidsTickets']
        ],
        where: exclude,
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
