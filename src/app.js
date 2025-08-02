// src/app.js
const express = require('express');
const inviteesRouter = require('./routes/invitees.routes').router;
//const errorHandler = require('./middlewares/error.middleware');

const app = express();
app.use(express.json());

app.use('/api/invitees', inviteesRouter);

//app.use(errorHandler);

module.exports = app;
