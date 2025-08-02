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

  static async sendWeddingInvitation(invitee, websiteUrl = 'https://your-wedding-website.com') {
    const message = this.generateWeddingInvitationMessage(invitee, websiteUrl);
    
    const payload = {
      messaging_product: 'whatsapp',
      to: invitee.phone,
      type: 'text',
      text: {
        body: message,
        preview_url: true
      }
    };

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending wedding invitation:', error.response?.data || error.message);
      throw error;
    }
  }

  static generateWeddingInvitationMessage(invitee, websiteUrl) {
    const fullName = `${invitee.firstName} ${invitee.lastName}`.trim();
    const ticketText = invitee.numOfTickets === 1 ? 'boleto' : 'boletos';
    const invitationUrl = `${websiteUrl}/${invitee.pin}`;

    return `💍✨ *¡Queremos compartir contigo nuestra felicidad!* ✨💍

Hola *${fullName}*,

Con mucha alegría queremos invitarte a celebrar con nosotros el día más especial de nuestras vidas:

💒 *_Boda de Ioanna y Luis_* 💒

📅 *Fecha:* 8 de noviembre del 2025
📍 *Lugar:* Jardín Amatus, Xochitepec, Morelos

⏰ *Programa del día:*
🙏 *1:30 PM* - Ceremonia Religiosa
🎉 *3:00 PM* - Recepción

🎫 Tienes reservado(s) *${invitee.numOfTickets} ${ticketText}* para este evento especial.

👗👔 *Código de vestimenta:* Formal

Para confirmar tu asistencia y conocer más detalles, visita nuestro sitio web:
🌐 ${invitationUrl}

_Tu PIN de acceso es: *${invitee.pin}*_

${invitee.hasKids ? '👶 ¡Los niños son bienvenidos! No olvides incluirlos en tu confirmación.' : ''}

¡Esperamos contar con tu presencia para hacer de este día un momento inolvidable! 💕

Con amor,
*Ioanna & Luis* 💕

---
_Por favor confirma tu asistencia lo antes posible. ¡Gracias!_ 🙏`;
  }
}

module.exports = WhatsAppService;
