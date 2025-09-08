// src/controllers/invitees.controller.js
const InviteeService = require('../services/invitee.service');
const WhatsAppService = require('../services/whatsapp.service');

exports.getByPin = async (req, res, next) => {
  try {
    const invitee = await InviteeService.findByPin(req.params.pin);
    if (!invitee) return res.status(404).json({ error: 'Invitee not found' });
    res.json(invitee);
  } catch (err) {
    next(err);
  }
};

exports.sendMessageToOne = async (req, res, next) => {
  try {
    const invitee = await InviteeService.findByPin(req.params.pin);
    if (!invitee) return res.status(404).json({ error: 'Invitee not found' });

    await WhatsAppService.sendTemplate(
      invitee.phone,
      req.body.templateName,
      req.body.parameters
    );
    await InviteeService.markSent(invitee.id);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.sendWeddingInvitation = async (req, res, next) => {
  try {
    const invitee = await InviteeService.findByPin(req.params.pin);
    if (!invitee) return res.status(404).json({ error: 'Invitee not found' });

    // Obtener la URL del sitio web desde el body o usar la predeterminada
    const websiteUrl = req.body.websiteUrl || process.env.WEDDING_WEBSITE_URL || 'https://your-wedding-website.com';

    await WhatsAppService.sendWeddingInvitation(invitee, websiteUrl);
    await InviteeService.markSent(invitee.id);

    // Formatear el número para mostrar el formato de Twilio en la respuesta
    const formattedPhone = invitee.phone.startsWith('whatsapp:') 
      ? invitee.phone 
      : `whatsapp:${invitee.phone}`;

    res.json({ 
      success: true, 
      message: `Wedding invitation sent to ${invitee.firstName} ${invitee.lastName}`,
      sentTo: formattedPhone
    });
  } catch (err) {
    next(err);
  }
};

exports.sendWeddingInvitationBulk = async (req, res, next) => {
  try {
    const confirmed = req.query.confirmed === 'true';
    const notSent = req.query.notSent === 'true';
    
    const filters = {};
    if (confirmed !== undefined) filters.isConfirmed = confirmed;
    if (notSent) filters.invitationSent = false;

    const list = await InviteeService.findAll(filters);
    
    if (list.length === 0) {
      return res.json({ message: 'No invitees found matching the criteria', sentCount: 0 });
    }

    // Obtener la URL del sitio web desde el body o usar la predeterminada
    const websiteUrl = req.body.websiteUrl || process.env.WEDDING_WEBSITE_URL || 'https://your-wedding-website.com';

    const results = await Promise.allSettled(
      list.map(async (invitee) => {
        try {
          await WhatsAppService.sendWeddingInvitation(invitee, websiteUrl);
          await InviteeService.markSent(invitee.id);
          
          // Formatear el número para mostrar el formato de Twilio en la respuesta
          const formattedPhone = invitee.phone.startsWith('whatsapp:') 
            ? invitee.phone 
            : `whatsapp:${invitee.phone}`;
            
          return { success: true, invitee: `${invitee.firstName} ${invitee.lastName}`, phone: formattedPhone };
        } catch (error) {
          return { success: false, invitee: `${invitee.firstName} ${invitee.lastName}`, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

    res.json({ 
      totalInvitees: list.length,
      sentCount: successful.length,
      failedCount: failed.length,
      successful: successful.map(r => r.value),
      failed: failed.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
    });
  } catch (err) {
    next(err);
  }
};

exports.sendMessageBulk = async (req, res, next) => {
  try {
    const confirmed = req.query.confirmed === 'true';
    const list = await InviteeService.findAll({
      isConfirmed: confirmed ? true : undefined
    });

    await Promise.all(list.map(i =>
      WhatsAppService
        .sendTemplate(i.phone, req.body.templateName, req.body.parameters)
        .then(() => InviteeService.markSent(i.id))
    ));

    res.json({ sentCount: list.length });
  } catch (err) {
    next(err);
  }
};

exports.confirmInvitee = async (req, res, next) => {
  try {
    const { hasKids, numOfTicketsConfirmed, numKidsTicketsConfirmed, email, phone } = req.body;
    const inv = await InviteeService.findByPin(req.params.pin);
    if (!inv) return res.status(404).json({ error: 'Invitee not found' });

    const updated = await InviteeService.confirm(inv.id, {
      hasKids,
      numOfTicketsConfirmed,
      numKidsTicketsConfirmed,
      email,
      phone
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.rejectInvitee = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const inv = await InviteeService.findByPin(req.params.pin);
    if (!inv) return res.status(404).json({ error: 'Invitee not found' });

    const updated = await InviteeService.reject(inv.id, { email, phone });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ===== BACKOFFICE ENDPOINTS =====

/**
 * GET /api/invitees/backoffice/list
 * Lista todos los invitados con filtros opcionales
 */
exports.listInvitees = async (req, res, next) => {
  try {
    const { 
      confirmed, 
      rejected, 
      sent, 
      hasKids, 
      search,
      page = 1, 
      limit = 50,
      sortBy = 'firstName',
      sortOrder = 'ASC'
    } = req.query;

    const filters = {};
    
    // Aplicar filtros
    if (confirmed !== undefined) filters.isConfirmed = confirmed === 'true';
    if (rejected !== undefined) filters.isRejected = rejected === 'true';
    if (sent !== undefined) filters.invitationSent = sent === 'true';
    if (hasKids !== undefined) filters.hasKids = hasKids === 'true';
    
    const result = await InviteeService.findAllPaginated({
      filters,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    });

    res.json({
      invitees: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/invitees/backoffice/stats
 * Obtiene estadísticas generales de invitados
 */
exports.getInviteeStats = async (req, res, next) => {
  try {
    const stats = await InviteeService.getStats();
    
    res.json({
      total: {
        invitees: stats.totalInvitees,
        adultTickets: stats.totalAdultTickets,
        kidsTickets: stats.totalKidsTickets,
        allTickets: stats.totalAdultTickets + stats.totalKidsTickets
      },
      confirmed: {
        invitees: stats.confirmedInvitees,
        adultTickets: stats.confirmedAdultTickets,
        kidsTickets: stats.confirmedKidsTickets,
        allTickets: stats.confirmedAdultTickets + stats.confirmedKidsTickets
      },
      rejected: {
        invitees: stats.rejectedInvitees
      },
      pending: {
        invitees: stats.totalInvitees - stats.confirmedInvitees - stats.rejectedInvitees,
        adultTickets: stats.totalAdultTickets - stats.confirmedAdultTickets,
        kidsTickets: stats.totalKidsTickets - stats.confirmedKidsTickets
      },
      invitations: {
        sent: stats.invitationsSent,
        pending: stats.totalInvitees - stats.invitationsSent
      },
      families: {
        withKids: stats.familiesWithKids,
        withoutKids: stats.totalInvitees - stats.familiesWithKids
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/invitees/backoffice/summary
 * Resumen ejecutivo para dashboard
 */
exports.getInviteeSummary = async (req, res, next) => {
  try {
    const stats = await InviteeService.getStats();
    
    const confirmationRate = stats.totalInvitees > 0 
      ? Math.round((stats.confirmedInvitees / stats.totalInvitees) * 100) 
      : 0;
    
    const invitationsSentRate = stats.totalInvitees > 0 
      ? Math.round((stats.invitationsSent / stats.totalInvitees) * 100) 
      : 0;

    res.json({
      summary: {
        totalInvitees: stats.totalInvitees,
        confirmedInvitees: stats.confirmedInvitees,
        rejectedInvitees: stats.rejectedInvitees,
        pendingInvitees: stats.totalInvitees - stats.confirmedInvitees - stats.rejectedInvitees,
        confirmationRate: `${confirmationRate}%`,
        invitationsSentRate: `${invitationsSentRate}%`
      },
      tickets: {
        totalAdultTickets: stats.totalAdultTickets,
        confirmedAdultTickets: stats.confirmedAdultTickets,
        totalKidsTickets: stats.totalKidsTickets,
        confirmedKidsTickets: stats.confirmedKidsTickets,
        totalAllTickets: stats.totalAdultTickets + stats.totalKidsTickets,
        confirmedAllTickets: stats.confirmedAdultTickets + stats.confirmedKidsTickets
      }
    });
  } catch (err) {
    next(err);
  }
};
