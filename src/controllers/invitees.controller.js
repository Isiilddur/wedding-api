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
    const { hasKids, numOfTicketsConfirmed } = req.body;
    const inv = await InviteeService.findByPin(req.params.pin);
    if (!inv) return res.status(404).json({ error: 'Invitee not found' });

    const updated = await InviteeService.confirm(inv.id, {
      hasKids,
      numOfTicketsConfirmed
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
