const { Pool } = require("pg");
const { initializeDatabase } = require('./dbInit');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


module.exports = { pool, initializeDatabase };
