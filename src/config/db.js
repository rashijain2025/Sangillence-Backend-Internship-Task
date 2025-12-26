const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: "127.0.0.1",
  password: process.env.DB_PASSWORD,
  port: 5000,
  database: process.env.DB_NAME,
});

module.exports = pool;
