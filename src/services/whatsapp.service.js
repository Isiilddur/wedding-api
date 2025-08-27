// src/services/whatsapp.service.js
const twilio = require('twilio');
const config = require('../config');

const client = twilio(config.twilioAccountSid, config.twilioAuthToken);
const from = config.twilioWhatsappFrom;
const messagingServiceSid = config.twilioMessagingServiceSid;

class WhatsAppService {
  /**
   * Send a plain-text WhatsApp message via Twilio (only works within 24-hour customer service window)
   * @param {string} to     E.164 with 'whatsapp:' prefix, e.g. 'whatsapp:+5215512345678'
   * @param {string} body   Text to send
   */
  static async sendText(to, body) {
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    try {
      const response = await client.messages.create({ 
        from, 
        to: toNumber, 
        body 
      });
      console.log(`Text message sent to ${toNumber} - Message SID: ${response.sid}`);
      return response;
    } catch (error) {
      console.error('Error sending text message via Twilio:', error.message);
      throw error;
    }
  }

  /**
   * Send WhatsApp message using a Content Template
   * @param {string} to - Phone number with whatsapp: prefix
   * @param {string} contentSid - Content Template SID (HX...)
   * @param {Object} contentVariables - Variables for template placeholders
   */
  static async sendTemplate(to, contentSid, contentVariables = {}) {
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    try {
      const response = await client.messages.create({
        from,
        to: toNumber,
        contentSid: contentSid,
        contentVariables: JSON.stringify(contentVariables),
        messagingServiceSid: messagingServiceSid
      });
      
      console.log(`Template message sent to ${toNumber} - Message SID: ${response.sid}`);
      return response;
    } catch (error) {
      console.error('Error sending template message via Twilio:', error.message);
      throw error;
    }
  }

  /**
   * Send wedding invitation using approved WhatsApp template
   * @param {Object} invitee - Invitee object from database
   * @param {string} websiteUrl - Wedding website URL (optional, uses config default)
   */
  static async sendWeddingInvitation(invitee, websiteUrl) {
    const contentSid = config.weddingInvitationContentSid;
    
    if (!contentSid) {
      throw new Error('Wedding invitation Content SID not configured. Please set WEDDING_INVITATION_CONTENT_SID in environment variables.');
    }

    const fullName = `${invitee.firstName} ${invitee.lastName}`.trim();
    const ticketText = invitee.numOfTickets === 1 ? 'boleto' : 'boletos';
    const siteUrl = websiteUrl || config.weddingWebsiteUrl;
    const invitationUrl = `${siteUrl}/${invitee.pin}`;

    // Content Variables for the template
    // Template should be created with placeholders like {{1}}, {{2}}, etc.
    const contentVariables = {
      "1": fullName,                    // Guest name
      "2": invitee.numOfTickets.toString(), // Number of tickets
      "3": ticketText,                  // "boleto" or "boletos"
      "4": invitee.pin,                 // PIN code
      "5": invitationUrl,               // Full invitation URL
      "6": invitee.hasKids ? "👶 ¡Los niños son bienvenidos! No olvides incluirlos en tu confirmación." : ""
    };

    const toNumber = invitee.phone.startsWith('whatsapp:') 
      ? invitee.phone 
      : `whatsapp:${invitee.phone}`;

    try {
      const response = await this.sendTemplate(toNumber, contentSid, contentVariables);
      console.log(`Wedding invitation sent to ${fullName} (${toNumber}) - Message SID: ${response.sid}`);
      return response;
    } catch (error) {
      console.error(`Error sending wedding invitation to ${fullName}:`, error.message);
      throw error;
    }
  }

  /**
   * Send a reminder message using template
   * @param {string} to - Phone number with whatsapp: prefix
   * @param {string} reminderContentSid - Content Template SID for reminders
   * @param {Object} variables - Template variables
   */
  static async sendReminder(to, reminderContentSid, variables = {}) {
    return this.sendTemplate(to, reminderContentSid, variables);
  }

  /**
   * Send confirmation message using template
   * @param {string} to - Phone number with whatsapp: prefix
   * @param {string} confirmationContentSid - Content Template SID for confirmations
   * @param {Object} variables - Template variables
   */
  static async sendConfirmation(to, confirmationContentSid, variables = {}) {
    return this.sendTemplate(to, confirmationContentSid, variables);
  }

  /**
   * Legacy method for compatibility - now uses templates
   * @param {string} to - Phone number with whatsapp: prefix
   * @param {string} templateName - Template name (for logging purposes)
   * @param {Array} parameters - Template parameters (converted to variables)
   */
  static async sendLegacyTemplate(to, templateName, parameters = []) {
    console.warn('sendLegacyTemplate is deprecated. Use sendTemplate with contentSid instead.');
    
    // Convert array parameters to object variables for new template system
    const contentVariables = {};
    parameters.forEach((param, index) => {
      contentVariables[(index + 1).toString()] = param;
    });

    // This would need a default template or specific mapping
    // For now, fall back to text message if within customer service window
    const message = `Template: ${templateName}\nData: ${parameters.join(', ')}`;
    return this.sendText(to, message);
  }
}

module.exports = WhatsAppService;
