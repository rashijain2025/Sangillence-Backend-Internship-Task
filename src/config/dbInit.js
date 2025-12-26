const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  try {
    console.log(' Checking database setup...');

    // Step 1: Create admins table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(' Admins table ready');

    // Step 2: Create other tables (add as needed)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(' Users table ready');

    // Step 3: Check if admin exists
    const adminCheck = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      ['admin']
    );

    // Step 4: Create default admin if doesn't exist
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO admins (username, password, email) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin@example.com']
      );
      console.log(' Default admin created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log(' Admin already exists');
    }

    console.log(' Database initialization complete!');
  } catch (error) {
    console.error(' Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = { pool, initializeDatabase };