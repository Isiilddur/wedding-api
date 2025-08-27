# 💍 API de Invitaciones de Boda - Ioanna & Luis

## Descripción
Esta API permite enviar invitaciones de boda personalizadas por WhatsApp usando **Twilio Content Templates** aprobados por WhatsApp. Los templates garantizan entregas confiables fuera de la ventana de 24 horas de servicio al cliente.

## ⚠️ IMPORTANTE: Migración a Templates
**Este proyecto ahora usa WhatsApp Content Templates oficiales de Twilio.** Para configurar correctamente, lee primero: [**WHATSAPP_TEMPLATES_SETUP.md**](./WHATSAPP_TEMPLATES_SETUP.md)

## Nuevos Endpoints

### 1. Enviar Invitación Individual
**POST** `/api/invitees/{pin}/send-wedding-invitation`

Envía una invitación de boda a un invitado específico usando su PIN con template aprobado.

#### Request Body (opcional):
```json
{
  "websiteUrl": "https://ioanna-y-luis.com"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Wedding invitation sent to María González",
  "sentTo": "whatsapp:+521234567890"
}
```

#### Ejemplo de uso:
```bash
curl -X POST \
  http://localhost:3000/api/invitees/ABC123/send-wedding-invitation \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://ioanna-y-luis.com"}'
```

### 2. Enviar Invitaciones Masivas
**POST** `/api/invitees/send-wedding-invitations`

Envía invitaciones de boda a múltiples invitados usando templates.

#### Query Parameters:
- `confirmed=true`: Solo enviar a invitados confirmados
- `notSent=true`: Solo enviar a quienes no se les ha enviado invitación

#### Request Body (opcional):
```json
{
  "websiteUrl": "https://ioanna-y-luis.com"
}
```

#### Response:
```json
{
  "totalInvitees": 50,
  "sentCount": 48,
  "failedCount": 2,
  "successful": [
    {
      "success": true,
      "invitee": "María González",
      "phone": "whatsapp:+521234567890"
    }
  ],
  "failed": [
    {
      "success": false,
      "invitee": "Juan Pérez",
      "error": "Template not approved"
    }
  ]
}
```

## 🎭 WhatsApp Content Template

### Template aprobado que se usa:
```
💍✨ *¡Queremos compartir contigo nuestra felicidad!* ✨💍

Hola *{{1}}*,

Con mucha alegría queremos invitarte a celebrar con nosotros el día más especial de nuestras vidas:

💒 *_Boda de Ioanna y Luis_* 💒

📅 *Fecha:* 8 de noviembre del 2025
📍 *Lugar:* Jardín Amatus, Xochitepec, Morelos

⏰ *Programa del día:*
🙏 *1:30 PM* - Ceremonia Religiosa
🎉 *3:00 PM* - Recepción

🎫 Tienes reservado(s) *{{2}} {{3}}* para este evento especial.

👗👔 *Código de vestimenta:* Formal

Para confirmar tu asistencia y conocer más detalles, visita nuestro sitio web:
🌐 {{5}}

_Tu PIN de acceso es: *{{4}}*_

{{6}}

¡Esperamos contar con tu presencia para hacer de este día un momento inolvidable! 💕

Con amor,
*Ioanna & Luis* 💕

---
_Por favor confirma tu asistencia lo antes posible. ¡Gracias!_ 🙏
```

### 📱 Mensaje generado final:
```
💍✨ *¡Queremos compartir contigo nuestra felicidad!* ✨💍

Hola *María González*,

Con mucha alegría queremos invitarte a celebrar con nosotros el día más especial de nuestras vidas:

💒 *_Boda de Ioanna y Luis_* 💒

📅 *Fecha:* 8 de noviembre del 2025
📍 *Lugar:* Jardín Amatus, Xochitepec, Morelos

⏰ *Programa del día:*
🙏 *1:30 PM* - Ceremonia Religiosa
🎉 *3:00 PM* - Recepción

🎫 Tienes reservados *2 boletos* para este evento especial.

👗👔 *Código de vestimenta:* Formal

Para confirmar tu asistencia y conocer más detalles, visita nuestro sitio web:
🌐 https://ioanna-y-luis.com/ABC123

_Tu PIN de acceso es: *ABC123*_

👶 ¡Los niños son bienvenidos! No olvides incluirlos en tu confirmación.

¡Esperamos contar con tu presencia para hacer de este día un momento inolvidable! 💕

Con amor,
*Ioanna & Luis* 💕

---
_Por favor confirma tu asistencia lo antes posible. ¡Gracias!_ 🙏
```

## 🔧 Configuración de Twilio Templates

### Variables de Entorno Requeridas
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Content Template SIDs (obtener después de crear templates)
WEDDING_INVITATION_CONTENT_SID=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Wedding Website
WEDDING_WEBSITE_URL=https://ioanna-y-luis.com
```

### 📋 Setup Checklist
1. ✅ **Crear Messaging Service** en Twilio Console
2. ✅ **Crear Content Template** para invitaciones ([Ver guía completa](./WHATSAPP_TEMPLATES_SETUP.md))
3. ✅ **Esperar aprobación** de WhatsApp (usualmente minutos)
4. ✅ **Configurar variables** de entorno con Content SID
5. ✅ **Probar endpoint** individual antes del envío masivo

## 🎯 Template Variables Mapping

| Variable | Código | Descripción | Ejemplo |
|----------|--------|-------------|---------|
| `{{1}}` | `fullName` | Nombre completo | "María González" |
| `{{2}}` | `numOfTickets` | Cantidad de boletos | "2" |
| `{{3}}` | `ticketText` | Boleto/boletos | "boletos" |
| `{{4}}` | `pin` | PIN de acceso | "ABC123" |
| `{{5}}` | `invitationUrl` | URL completa | "https://sitio.com/ABC123" |
| `{{6}}` | `kidsMessage` | Mensaje condicional | "👶 ¡Los niños son..." |

## 🚀 Ejemplos de Uso

### Envío Individual
```bash
curl -X POST \
  http://localhost:3000/api/invitees/ABC123/send-wedding-invitation \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://ioanna-y-luis.com"}'
```

### Envío Masivo - Solo no enviados
```bash
curl -X POST \
  "http://localhost:3000/api/invitees/send-wedding-invitations?notSent=true" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://ioanna-y-luis.com"}'
```

### Usar Template Directamente
```javascript
const WhatsAppService = require('./src/services/whatsapp.service');

await WhatsAppService.sendTemplate(
  'whatsapp:+5215512345678',
  'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Content SID
  {
    "1": "María González",
    "2": "2", 
    "3": "boletos",
    "4": "ABC123",
    "5": "https://ioanna-y-luis.com/ABC123",
    "6": "👶 ¡Los niños son bienvenidos!"
  }
);
```

## ✅ Ventajas de Content Templates

### 🎯 **Confiabilidad**:
- ✅ **Entrega garantizada**: Funciona fuera de la ventana de 24h
- ✅ **Aprobado por WhatsApp**: Sin riesgo de spam
- ✅ **Rate limits altos**: Mejor para envíos masivos

### 🎨 **Personalización**:
- ✅ **Variables dinámicas**: Nombres, pins, URLs personalizadas
- ✅ **Formato rico**: Negrita, cursiva, emojis
- ✅ **Contenido condicional**: Mensaje para niños opcional

### 📊 **Monitoreo**:
- ✅ **Message SIDs**: Trazabilidad completa
- ✅ **Twilio Debugger**: Logs detallados
- ✅ **Status tracking**: Entregado, leído, fallido

## ⚠️ Limitaciones y Consideraciones

### 1. **Template debe estar aprobado**
- Error si template está pendiente o rechazado
- Verificar status en Twilio Console

### 2. **Variables deben coincidir exactamente**
- Template usa `{{1}}, {{2}}, etc.`
- Enviar como string: `{"1": "valor", "2": "valor"}`

### 3. **Messaging Service requerido**
- No funciona sin `TWILIO_MESSAGING_SERVICE_SID`
- Debe estar configurado en Twilio Console

### 4. **Formato de números**
- Usar prefijo `whatsapp:+número`
- Automáticamente formateado por el servicio

## 🔍 Debugging

### Si el template falla:
1. **Verificar Content SID** existe y está aprobado
2. **Verificar variables** coinciden con template
3. **Revisar logs** en Twilio Console > Monitor > Messaging
4. **Probar en sandbox** primero

### Errores comunes:
- `63016`: No hay ventana de servicio y template no aprobado
- `63040`: Template rechazado por WhatsApp
- `63041`: Template pausado por reportes de spam

---

🎉 **¡Con Content Templates tienes un sistema empresarial robusto para las invitaciones de Ioanna & Luis!** 💍 
