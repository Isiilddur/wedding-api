// src/app.js
const express = require('express');
const inviteesRouter = require('./routes/invitees.routes').router;
//const errorHandler = require('./middlewares/error.middleware');

const app = express();

// CORS middleware - Configure this based on your frontend URL
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // In production, replace * with your frontend domain
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

app.use('/api/invitees', inviteesRouter);

//app.use(errorHandler);

module.exports = app;
