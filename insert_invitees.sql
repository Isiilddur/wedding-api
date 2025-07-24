-- Script to insert two sample invitees for the wedding
-- Make sure to run migrations first: npx sequelize-cli db:migrate

-- First, let's insert a sample event if it doesn't exist
INSERT IGNORE INTO Events (id, name, date, time, location, type, createdAt, updatedAt) 
VALUES (
    1,
    'Boda de Ricardo y María',
    '2024-12-15',
    '18:00',
    'Jardín San Patricio',
    'wedding',
    NOW(),
    NOW()
);

-- Insert two invitees
INSERT INTO Invitees (
    firstName,
    lastName,
    email,
    phone,
    hasKids,
    numOfTickets,
    isConfirmed,
    numOfTicketsConfirmed,
    `table`,
    pin,
    invitationSent,
    eventId,
    createdAt,
    updatedAt
) VALUES 
-- Invitee 1: Family with kids
(
    'Carlos',
    'García',
    'carlos.garcia@email.com',
    '+525525008170',
    true,
    4,
    true,
    4,
    'Mesa 1',
    'PIN001',
    true,
    '1',
    NOW(),
    NOW()
),
-- Invitee 2: Couple without kids
(
    'Ana',
    'López',
    'ana.lopez@email.com',
    '+525520679840',
    false,
    2,
    false,
    0,
    'Mesa 2',
    'PIN002',
    false,
    '1',
    NOW(),
    NOW()
);

-- Verify the insertions
SELECT 
    id,
    firstName,
    lastName,
    email,
    phone,
    hasKids,
    numOfTickets,
    isConfirmed,
    numOfTicketsConfirmed,
    `table`,
    pin,
    invitationSent,
    eventId
FROM Invitees 
ORDER BY id; 
