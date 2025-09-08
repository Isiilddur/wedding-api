// src/app.js
const express = require('express');
const inviteesRouter = require('./routes/invitees.routes').router;
//const errorHandler = require('./middlewares/error.middleware');

const app = express();

// CORS middleware - Improved configuration
app.use((req, res, next) => {
  // Allow specific origins or all origins for development
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://localhost:4173',
    'https://ioanna-y-luis.com',
    'https://www.ioanna-y-luis.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

app.use('/api/invitees', inviteesRouter);

//app.use(errorHandler);

module.exports = app;
