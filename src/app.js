// src/app.js
const express = require('express');

const app = express();
app.use(express.json());

// Contestar algo generico para verificar que la API está funcionando
app.get('/', (req, res) => {
  res.send('API is running');
});


// Manejo de errores al final


module.exports = app;
