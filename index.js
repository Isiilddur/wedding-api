// index.js
const app = require('./src/app');
const config = require('./src/config');

const port = process.env.PORT || config.port || 3000;
app.listen(port, () =>
  console.log(`API escuchando en puerto ${port}`)
);
