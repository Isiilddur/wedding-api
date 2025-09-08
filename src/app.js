// src/app.js
const express = require('express');
const inviteesRouter = require('./routes/invitees.routes').router;
//const errorHandler = require('./middlewares/error.middleware');

const app = express();

// CORS middleware - Permissive configuration for debugging
app.use((req, res, next) => {
  // Log incoming requests for debugging
  console.log(`${req.method} ${req.url} from origin: ${req.headers.origin || 'no-origin'}`);
  
  // Allow all origins for now (fix CORS issues)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

app.use('/api/invitees', inviteesRouter);

//app.use(errorHandler);

module.exports = app;
