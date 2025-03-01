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

    // Add test data if not exists
    const testStudents = [
      { email: 'schoolkid@somemail.com', name: 'John Doe', class: 5, section: 'A' },
      { email: 'alice@somemail.com', name: 'Alice Smith', class: 5, section: 'A' },
      { email: 'bob@somemail.com', name: 'Bob Johnson', class: 5, section: 'B' },
      { email: 'carol@somemail.com', name: 'Carol Williams', class: 5, section: 'B' },
      { email: 'david@somemail.com', name: 'David Brown', class: 6, section: 'A' },
      { email: 'emma@somemail.com', name: 'Emma Davis', class: 6, section: 'A' },
      { email: 'frank@somemail.com', name: 'Frank Wilson', class: 6, section: 'B' },
      { email: 'grace@somemail.com', name: 'Grace Taylor', class: 6, section: 'B' },
      { email: 'henry@somemail.com', name: 'Henry Anderson', class: 7, section: 'A' },
      { email: 'isabel@somemail.com', name: 'Isabel Martinez', class: 7, section: 'A' },
    ];

    // Insert admin user if not exists
    const adminExists = await pool.query("SELECT * FROM users WHERE username = $1", ['admin@somemail.com']);
    if (adminExists.rows.length === 0) {
      console.log('Creating test admin user...');
      await pool.query(
        "INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4)",
        ['admin@somemail.com', '12345', 'ADMIN', 'Admin User']
      );
    }

    // Insert test students and their fees
    for (const student of testStudents) {
      const studentExists = await pool.query("SELECT * FROM users WHERE username = $1", [student.email]);
      if (studentExists.rows.length === 0) {
        console.log(`Creating test student: ${student.name}...`);
        const result = await pool.query(
          "INSERT INTO users (username, password, role, name, class, section) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [student.email, '12345', 'STUDENT', student.name, student.class, student.section]
        );

        // Create fee entries for each student
        const feeTypes = ['Annual Fee', 'Library Fee', 'Computer Lab Fee'];
        const statuses = ['PAID', 'UNPAID'];

        for (const feeType of feeTypes) {
          const amount = Math.floor(Math.random() * (10000 - 2000) + 2000);
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const dueDate = new Date('2024-03-31');
          const paymentDate = status === 'PAID' ? new Date('2024-02-15') : null;

          console.log(`Creating ${feeType} for ${student.name}...`);
          await pool.query(
            "INSERT INTO fees (student_id, type, amount, due_date, status, payment_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [result.rows[0].id, feeType, amount, dueDate, status, paymentDate]
          );
        }
      }
    }

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export const db = { schema };