// src/routes/invitees.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/invitees.controller');

router.get('/:pin', ctrl.getByPin);
router.post('/:pin/send-message', ctrl.sendMessageToOne);
router.post('/:pin/send-wedding-invitation', ctrl.sendWeddingInvitation);
router.post('/send-message', ctrl.sendMessageBulk);
router.post('/send-wedding-invitations', ctrl.sendWeddingInvitationBulk);
router.patch('/:pin/confirm', ctrl.confirmInvitee);
router.patch('/:pin/reject', ctrl.rejectInvitee);

// ===== BACKOFFICE ROUTES =====
router.get('/backoffice/list', ctrl.listInvitees);
router.get('/backoffice/stats', ctrl.getInviteeStats);
router.get('/backoffice/summary', ctrl.getInviteeSummary);

module.exports = { router };
