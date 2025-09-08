// config/database.js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "wedding_user",
    password: process.env.DB_PASSWORD || "wedding_password", 
    database: process.env.DB_NAME || "wedding_invitation_db",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    port: process.env.DB_PORT || 3306
  },
  test: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "rootpassword",
    database: process.env.DB_NAME || "database_test", 
    host: process.env.DB_HOST || "mysql",
    dialect: "mysql",
    port: process.env.DB_PORT || 3306
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
