// src/config/index.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,

  // Twilio Configuration
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
  twilioMessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, // Required for templates

  // WhatsApp Template Configuration
  weddingInvitationContentSid: process.env.WEDDING_INVITATION_CONTENT_SID,
  
  // Wedding Website
  weddingWebsiteUrl: process.env.WEDDING_WEBSITE_URL || 'https://your-wedding-website.com',

  // … otras vars
};
