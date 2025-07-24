// src/routes/invitees.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/invitees.controller');

router.get('/:pin', ctrl.getByPin);
router.post('/:pin/send-message', ctrl.sendMessageToOne);
router.post('/send-message', ctrl.sendMessageBulk);
router.patch('/:pin/confirm', ctrl.confirmInvitee);

module.exports = { router };
