import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
export async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    // Test database connection first
    console.log('Testing database connection...');
    const { rows } = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', rows[0]);

    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        class INTEGER,
        section VARCHAR(10)
      )
    `);
    console.log('Users table created successfully');

    // Create fees table
    console.log('Creating fees table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fees (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        type VARCHAR(255) NOT NULL,
        amount DECIMAL NOT NULL,
        due_date TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL,
        payment_date TIMESTAMP,
        receipt_url TEXT
      )
    `);
    console.log('Fees table created successfully');

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export const db = { schema };