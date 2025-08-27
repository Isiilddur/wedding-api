# 🎭 WhatsApp Templates Setup - Twilio Content Templates

## Descripción
Guía completa para configurar **WhatsApp Content Templates** en Twilio Console para enviar invitaciones de boda fuera de la ventana de 24 horas de servicio al cliente.

## 📋 Prerrequisitos

### 1. Configurar Messaging Service
1. Ve a **Twilio Console > Messaging > Services**
2. Crea un nuevo Messaging Service o usa uno existente
3. Copia el `Service SID` (empieza con `MG...`)

### 2. Variables de Entorno
Agrega estas variables a tu archivo `.env`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Content Template SIDs (obtenidos después de crear templates)
WEDDING_INVITATION_CONTENT_SID=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Wedding Website
WEDDING_WEBSITE_URL=https://ioanna-y-luis.com
```

## 🎨 Crear Wedding Invitation Template

### 1. Ir al Content Template Builder
1. Ve a **Twilio Console > Messaging > Content Editor**
2. Click en **"Create new template"**

### 2. Configuración del Template

**Basic Information:**
- **Template Name**: `wedding_invitation_ioanna_luis`
- **Channel**: WhatsApp
- **Category**: Utility (recommended) or Marketing
- **Language**: Spanish (es)

**Template Content:**
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

### 3. Template Variables Mapping

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{1}}` | Nombre completo del invitado | "María González" |
| `{{2}}` | Número de boletos | "2" |
| `{{3}}` | Texto de boletos (singular/plural) | "boletos" |
| `{{4}}` | PIN del invitado | "ABC123" |
| `{{5}}` | URL completa de invitación | "https://ioanna-y-luis.com/ABC123" |
| `{{6}}` | Mensaje condicional para niños | "👶 ¡Los niños son bienvenidos!..." (opcional) |

### 4. Enviar para Aprobación
1. Click en **"Submit for Approval"**
2. Esperar aprobación de WhatsApp (usualmente minutos)
3. Una vez aprobado, copiar el **Content SID** (`HX...`)

## 🎯 Templates Adicionales Recomendados

### 1. Reminder Template
**Name**: `wedding_reminder_ioanna_luis`
**Content**:
```
⏰ *Recordatorio de Boda* 💍

Hola {{1}},

Te recordamos que la boda de Ioanna y Luis es {{2}}.

📍 Jardín Amatus, Xochitepec, Morelos
🕐 1:30 PM - Ceremonia | 3:00 PM - Recepción

¿Ya confirmaste tu asistencia? Visita: {{3}}

¡Te esperamos! 💕
*Ioanna & Luis*
```

### 2. Confirmation Template  
**Name**: `wedding_confirmation_ioanna_luis`
**Content**:
```
✅ *¡Confirmación Recibida!* 🎉

Gracias {{1}},

Hemos recibido tu confirmación para {{2}} persona(s).

📋 Detalles confirmados:
• Invitado: {{1}}
• Boletos: {{2}}
{{3}}

¡Nos vemos el 8 de noviembre! 💍

Con amor,
*Ioanna & Luis*
```

## 🔧 Uso en el Código

### Enviar Invitación Individual
```javascript
// POST /api/invitees/{pin}/send-wedding-invitation
{
  "websiteUrl": "https://ioanna-y-luis.com" // opcional
}
```

### Enviar Invitaciones Masivas
```javascript
// POST /api/invitees/send-wedding-invitations?notSent=true
{
  "websiteUrl": "https://ioanna-y-luis.com" // opcional
}
```

### Usar Template Personalizado (desde código)
```javascript
const WhatsAppService = require('../services/whatsapp.service');

// Enviar template personalizado
await WhatsAppService.sendTemplate(
  'whatsapp:+5215512345678',
  'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Content SID
  {
    "1": "María González",
    "2": "2",
    "3": "boletos",
    "4": "ABC123",
    "5": "https://ioanna-y-luis.com/ABC123",
    "6": "👶 ¡Los niños son bienvenidos! No olvides incluirlos en tu confirmación."
  }
);
```

## ⚠️ Consideraciones Importantes

### 1. **Categorías de Templates**
- **Utility**: Mensajes transaccionales (confirmaciones, recordatorios)
- **Marketing**: Mensajes promocionales (más restricciones)
- **Authentication**: Solo para códigos de verificación

### 2. **Limitaciones**
- Templates deben ser aprobados por WhatsApp
- No se pueden enviar mensajes libres fuera de la ventana de 24h
- Máximo 6000 templates por cuenta

### 3. **Mejores Prácticas**
- Usar categoría "Utility" para invitaciones de boda
- Incluir información clara de opt-out
- Evitar contenido demasiado promocional
- Usar variables para personalización

### 4. **Debugging**
Si el template falla:
1. Verificar que el Content SID sea correcto
2. Verificar que las variables coincidan con el template
3. Verificar que el template esté aprobado (status: APPROVED)
4. Revisar Twilio Debugger para errores específicos

## 🎨 Formato de WhatsApp Soportado

| Formato | Syntax | Ejemplo |
|---------|--------|---------|
| Negrita | `*texto*` | `*Boda de Ioanna y Luis*` |
| Cursiva | `_texto_` | `_Tu PIN de acceso_` |
| Negrita + Cursiva | `*_texto_*` | `*_Boda de Ioanna y Luis_*` |
| Strikethrough | `~texto~` | `~precio anterior~` |
| Monospace | ```texto``` | ```ABC123``` |

## 📊 Monitoreo

### Verificar Estado del Template
```bash
curl -X GET "https://content.twilio.com/v1/Content/HXxxxxx" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

### Ver Mensajes Enviados
Ve a **Twilio Console > Monitor > Logs > Messaging** para ver el estado de los mensajes enviados.

---

¡Con esta configuración tendrás un sistema robusto de invitaciones de boda usando WhatsApp Templates aprobados! 🎉💍 
