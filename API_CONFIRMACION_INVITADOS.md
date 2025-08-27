# 👶 API de Confirmación de Invitados - Con Boletos para Niños

## Descripción
Endpoint para confirmar la asistencia de invitados incluyendo el número de boletos para adultos y niños por separado.

## 📋 Nuevos Campos en la Base de Datos

### Campo Agregado: `numKidsTicketsConfirmed`
- **Tipo**: INTEGER
- **Descripción**: Número de boletos confirmados específicamente para niños
- **Valor por defecto**: 0
- **Nullable**: Sí

### Estructura Completa de Boletos:
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `numOfTickets` | Total de boletos asignados | 4 |
| `numOfTicketsConfirmed` | Boletos confirmados para adultos | 2 |
| `numKidsTicketsConfirmed` | Boletos confirmados para niños | 2 |
| `hasKids` | Indica si la familia trae niños | true |

## 🔄 Endpoint de Confirmación Actualizado

### **PATCH** `/api/invitees/{pin}/confirm`

Confirma la asistencia de un invitado especificando boletos para adultos y niños.

#### Request Body:
```json
{
  "hasKids": true,
  "numOfTicketsConfirmed": 2,
  "numKidsTicketsConfirmed": 2
}
```

#### Campos del Request:
- **`hasKids`** (boolean): Indica si la familia trae niños
- **`numOfTicketsConfirmed`** (integer): Número de boletos confirmados para adultos
- **`numKidsTicketsConfirmed`** (integer, opcional): Número de boletos confirmados para niños (default: 0)

#### Response Exitoso:
```json
{
  "id": 1,
  "firstName": "María",
  "lastName": "González",
  "email": "maria@email.com",
  "phone": "whatsapp:+5215512345678",
  "hasKids": true,
  "numOfTickets": 4,
  "isConfirmed": true,
  "numOfTicketsConfirmed": 2,
  "numKidsTicketsConfirmed": 2,
  "table": null,
  "pin": "ABC123",
  "invitationSent": true,
  "eventId": "event-uuid",
  "createdAt": "2025-01-27T12:00:00.000Z",
  "updatedAt": "2025-01-27T13:30:00.000Z"
}
```

## 🎯 Ejemplos de Uso

### 1. **Familia con Niños** (2 adultos + 2 niños):
```bash
curl -X PATCH \
  http://localhost:3000/api/invitees/ABC123/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "hasKids": true,
    "numOfTicketsConfirmed": 2,
    "numKidsTicketsConfirmed": 2
  }'
```

### 2. **Solo Adultos** (2 adultos, sin niños):
```bash
curl -X PATCH \
  http://localhost:3000/api/invitees/ABC123/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "hasKids": false,
    "numOfTicketsConfirmed": 2,
    "numKidsTicketsConfirmed": 0
  }'
```

### 3. **Un Solo Adulto** (sin niños):
```bash
curl -X PATCH \
  http://localhost:3000/api/invitees/ABC123/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "hasKids": false,
    "numOfTicketsConfirmed": 1
  }'
```

### 4. **Pareja con Un Niño**:
```bash
curl -X PATCH \
  http://localhost:3000/api/invitees/ABC123/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "hasKids": true,
    "numOfTicketsConfirmed": 2,
    "numKidsTicketsConfirmed": 1
  }'
```

## ✅ Validaciones del Sistema

### 1. **Validación de Boletos Totales**:
```javascript
if (numOfTicketsConfirmed > inv.numOfTickets) {
  throw new Error('Confirmed tickets exceed allocation');
}
```
- El total de boletos confirmados no puede exceder la asignación original

### 2. **Lógica de Negocio**:
- Si `hasKids: false`, se recomienda que `numKidsTicketsConfirmed: 0`
- Si `hasKids: true`, `numKidsTicketsConfirmed` puede ser > 0
- El campo `isConfirmed` se establece automáticamente en `true`

### 3. **Transaccionalidad**:
- La confirmación se ejecuta en una transacción de base de datos
- Si falla alguna validación, se revierten todos los cambios

## 📊 Consultas Útiles

### Ver confirmaciones por categoría:
```sql
-- Invitados confirmados con niños
SELECT firstName, lastName, numOfTicketsConfirmed, numKidsTicketsConfirmed 
FROM Invitees 
WHERE isConfirmed = true AND hasKids = true;

-- Total de boletos confirmados
SELECT 
  SUM(numOfTicketsConfirmed) as total_adultos,
  SUM(numKidsTicketsConfirmed) as total_niños,
  COUNT(*) as familias_confirmadas
FROM Invitees 
WHERE isConfirmed = true;

-- Familias pendientes de confirmación
SELECT firstName, lastName, numOfTickets, pin
FROM Invitees 
WHERE isConfirmed = false;
```

## 🎨 Frontend Integration

### Ejemplo de formulario para el frontend:
```html
<form id="confirmationForm">
  <h3>Confirmar Asistencia</h3>
  
  <label>
    <input type="checkbox" id="hasKids" name="hasKids">
    ¿Asistirán niños?
  </label>
  
  <div>
    <label>Número de adultos:</label>
    <input type="number" id="adults" name="numOfTicketsConfirmed" min="0" max="4">
  </div>
  
  <div id="kidsSection" style="display: none;">
    <label>Número de niños:</label>
    <input type="number" id="kids" name="numKidsTicketsConfirmed" min="0" max="4">
  </div>
  
  <button type="submit">Confirmar Asistencia</button>
</form>

<script>
document.getElementById('hasKids').addEventListener('change', function() {
  const kidsSection = document.getElementById('kidsSection');
  kidsSection.style.display = this.checked ? 'block' : 'none';
  if (!this.checked) {
    document.getElementById('kids').value = 0;
  }
});
</script>
```

## 🎯 Casos de Uso Comunes

### 1. **Familia Completa** (4 boletos asignados):
- Confirman: 2 adultos + 2 niños = 4 boletos ✅
- `numOfTicketsConfirmed: 2, numKidsTicketsConfirmed: 2`

### 2. **Pareja Sin Niños** (2 boletos asignados):
- Confirman: 2 adultos + 0 niños = 2 boletos ✅
- `numOfTicketsConfirmed: 2, numKidsTicketsConfirmed: 0`

### 3. **No Pueden Asistir Todos** (4 boletos asignados):
- Confirman: 1 adulto + 1 niño = 2 boletos de 4 ✅
- `numOfTicketsConfirmed: 1, numKidsTicketsConfirmed: 1`

### 4. **Solo Un Invitado** (1 boleto asignado):
- Confirma: 1 adulto + 0 niños = 1 boleto ✅
- `numOfTicketsConfirmed: 1, numKidsTicketsConfirmed: 0`

---

🎉 **¡Ahora puedes gestionar confirmaciones detalladas para adultos y niños por separado!** 👶👨‍👩‍👧‍👦 
