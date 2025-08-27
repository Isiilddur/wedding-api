# Sistema de Invitaciones con PIN

Este sistema conecta el frontend (sitio web de boda) con el backend (API) para pre-cargar y manejar confirmaciones de invitados usando un PIN único.

## Cómo Funciona

### 1. Estructura de URLs
El sistema lee el PIN desde la URL de dos maneras:
- **Path-based**: `https://tu-sitio.com/PIN001` (recomendado)
- **Query parameter**: `https://tu-sitio.com/?pin=PIN001`

### 2. Flujo de Funcionamiento
1. El invitado accede a la URL con su PIN
2. El frontend extrae el PIN de la URL
3. Se hace una petición GET al backend: `/api/invitees/{PIN}`
4. Los datos del invitado pre-llenan el formulario
5. El invitado puede modificar/confirmar su asistencia
6. Se envía una petición PATCH al backend: `/api/invitees/{PIN}/confirm`

## Configuración

### Backend (wedding-api)
1. Asegúrate de que el servidor esté corriendo en el puerto 3000
2. El backend ya incluye CORS configurado
3. Endpoints disponibles:
   - `GET /api/invitees/:pin` - Obtener datos del invitado
   - `PATCH /api/invitees/:pin/confirm` - Confirmar asistencia

### Frontend (Wedding)
1. Actualiza la variable `API_BASE_URL` en `index.html` con la URL de tu backend:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000'; // Cambia esto por tu URL
   ```

## Campos del Formulario

El formulario ahora incluye:
- ✅ **Nombre completo** (se pre-llena con firstName + lastName, NO modificable)
- ✅ **Email** (se pre-llena desde la base de datos)
- ✅ **Teléfono** (campo requerido, se pre-llena desde BD)
- ✅ **¿Asistirás?** (se pre-llena según isConfirmed)
- ✅ **Boletos disponibles** (se muestra sin posibilidad de modificar)
- ✅ **Número de adultos** (campo requerido, mínimo 1)
- ✅ **¿Traerás niños?** (checkbox que habilita/deshabilita campo de cantidad)
- ✅ **Número de niños** (solo se muestra si se marca el checkbox)

## Datos que se Envían al Backend

Cuando se confirma la asistencia, se envía:
```json
{
  "hasKids": true/false,
  "numOfTicketsConfirmed": número_total_personas,
  "numKidsTickets": número_de_niños,
  "email": "email@ejemplo.com",
  "phone": "+52 55 1234 5678"
}
```

### Validaciones Automáticas:
- ✅ **Adultos + Niños ≤ Boletos Disponibles**
- ✅ **Mínimo 1 adulto si se confirma asistencia**
- ✅ **El checkbox de niños habilita/deshabilita el campo de cantidad**
- ✅ **Validación en tiempo real mientras se llenan los campos**

## Ejemplos de Uso

### 1. Invitación Individual
URL: `https://tu-boda.com/PIN001`
- Carga automáticamente los datos de la persona con PIN001
- Pre-llena el formulario con sus datos

### 2. Sin PIN (Modo Manual)
URL: `https://tu-boda.com/`
- El formulario funciona en modo manual
- Los invitados pueden llenar todos los campos manualmente

## Testing

### Probar con un PIN específico:
1. Asegúrate de que tienes un invitado con PIN en la base de datos
2. Accede a: `http://localhost:8080/PIN001` (o tu dominio)
3. Verifica que el formulario se pre-llene automáticamente

### Verificar en Consola del Navegador:
- `PIN extracted from URL: PIN001`
- `Invitee data loaded: {datos...}`
- `Confirmation successful: {resultado...}`

## Estructura de Base de Datos

El modelo Invitee debe tener estos campos:
- `pin` - STRING (único, ej: "PIN001")
- `firstName` - STRING
- `lastName` - STRING
- `email` - STRING
- `phone` - STRING
- `hasKids` - BOOLEAN
- `numOfTickets` - INTEGER (boletos asignados total)
- `numOfTicketsConfirmed` - INTEGER (boletos confirmados total: adultos + niños)
- `numKidsTickets` - INTEGER (boletos específicos para niños)
- `isConfirmed` - BOOLEAN

### Migración Nueva:
Se agregó el campo `numKidsTickets` para llevar un control específico de cuántos boletos son para niños. Ejecuta la migración:
```bash
npx sequelize-cli db:migrate
```

## Notas de Producción

1. **CORS**: En producción, cambia `*` por tu dominio específico en `app.js`
2. **HTTPS**: Asegúrate de usar HTTPS en producción
3. **URL del Backend**: Actualiza `API_BASE_URL` con tu dominio de producción
4. **Validación**: El sistema valida que no se confirmen más boletos de los asignados

## Personalización

### Cambiar Patrón de PIN
Si quieres usar un patrón diferente, modifica esta línea en `index.html`:
```javascript
if (segment.match(/^PIN\d+$/i)) {
  return segment.toUpperCase();
}
```

### Agregar Campos Adicionales
1. Agrega el campo HTML en el formulario
2. Incluye el campo en el objeto `confirmationData`
3. Actualiza el backend si necesitas persistir el dato 
