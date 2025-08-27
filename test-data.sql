-- Datos de prueba para el sistema de invitaciones
-- Ejecuta este SQL después de las migraciones

-- Primero, crear un evento de ejemplo (si no existe)
INSERT INTO Events (id, name, date, time, location, type, createdAt, updatedAt) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Boda de Ioanna & Luis',
  '2025-11-07',
  '17:00:00',
  'Hacienda Xochitepec, Morelos',
  'wedding',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE name = name;

-- Insertar invitados de prueba
INSERT INTO Invitees (firstName, lastName, email, phone, hasKids, numOfTickets, 
  isConfirmed, numOfTicketsConfirmed, numKidsTickets, pin, invitationSent, eventId, 
  createdAt, updatedAt
) VALUES
-- Invitado 1: Juan Pérez (confirmado, con niños)
( 'Juan',
  'Pérez',
  'juan.perez@email.com',
  '+5215525008170',
  true,
  4,
  true,
  4,
  2,
  'PIN001',
  false,
  '550e8400-e29b-41d4-a716-446655440000',
  NOW(),
  NOW()
),

-- Invitado 2: María García (no confirmado aún)
(
  '550e8400-e29b-41d4-a716-446655440002',
  'María',
  'García',
  'maria.garcia@email.com',
  '+52 55 9876 5432',
  false,
  2,
  null,
  null,
  0,
  'PIN002',
  false,
  '550e8400-e29b-41d4-a716-446655440000',
  NOW(),
  NOW()
),

-- Invitado 3: Carlos López (confirmado, sin niños)
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Carlos',
  'López',
  'carlos.lopez@email.com',
  '+52 55 5555 1234',
  false,
  2,
  true,
  2,
  0,
  'PIN003',
  false,
  '550e8400-e29b-41d4-a716-446655440000',
  NOW(),
  NOW()
),

-- Invitado 4: Ana Martínez (no ha respondido)
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Ana',
  'Martínez',
  'ana.martinez@email.com',
  '+52 55 7777 8888',
  null,
  3,
  null,
  null,
  0,
  'PIN004',
  false,
  '550e8400-e29b-41d4-a716-446655440000',
  NOW(),
  NOW()
),

-- Invitado 5: Luis Rodríguez (rechazó la invitación)
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Luis',
  'Rodríguez',
  'luis.rodriguez@email.com',
  '+52 55 3333 4444',
  false,
  1,
  false,
  0,
  0,
  'PIN005',
  false,
  '550e8400-e29b-41d4-a716-446655440000',
  NOW(),
  NOW()
);

-- Verificar que se insertaron correctamente
SELECT 
  pin,
  CONCAT(firstName, ' ', lastName) as nombre,
  email,
  phone,
  numOfTickets as boletos_asignados,
  isConfirmed as confirmado,
  numOfTicketsConfirmed as boletos_confirmados,
  hasKids as tiene_ninos,
  numKidsTickets as boletos_ninos
FROM Invitees 
ORDER BY pin; 
