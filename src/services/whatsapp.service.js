// src/services/whatsapp.service.js
const axios = require('axios');
const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
const apiUrl = `https://graph.facebook.com/v16.0/${phoneNumberId}/messages`;

class WhatsAppService {
  static async sendTemplate(to, templateName, parameters = []) {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en_US' },
        components: parameters.length
          ? [{ type: 'body', parameters: parameters.map(p => ({ type: 'text', text: p })) }]
          : []
      }
    };
    await axios.post(apiUrl, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

module.exports = WhatsAppService;
