import { pool } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  name: string;
  class?: number;
  section?: string;
}

export interface Fee {
  id: number;
  student_id: number;
  type: string;
  amount: string;
  due_date: Date;
  status: string;
  payment_date?: Date;
  receipt_url?: string;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  getFeesByStudent(studentId: number): Promise<Fee[]>;
  createFee(fee: Omit<Fee, "id">): Promise<Fee>;
  updateFeeStatus(feeId: number, status: string, paymentDate?: Date): Promise<Fee>;
  getStudentsByClass(classNum: number, section: string): Promise<User[]>;
  getAllStudents(): Promise<User[]>; // Added getAllStudents method
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "INSERT INTO users (username, password, role, name, class, section) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [user.username, user.password, user.role, user.name, user.class, user.section]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getFeesByStudent(studentId: number): Promise<Fee[]> {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM fees WHERE student_id = $1", [studentId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createFee(fee: Omit<Fee, "id">): Promise<Fee> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "INSERT INTO fees (student_id, type, amount, due_date, status, payment_date, receipt_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [fee.student_id, fee.type, fee.amount, fee.due_date, fee.status, fee.payment_date, fee.receipt_url]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateFeeStatus(feeId: number, status: string, paymentDate?: Date): Promise<Fee> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "UPDATE fees SET status = $1, payment_date = $2 WHERE id = $3 RETURNING *",
        [status, paymentDate, feeId]
      );
      if (!result.rows[0]) {
        throw new Error("Fee not found");
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getStudentsByClass(classNum: number, section: string): Promise<User[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM users WHERE role = 'STUDENT' AND class = $1 AND section = $2",
        [classNum, section]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getAllStudents(classNum: number, section: string): Promise<User[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT users.*, fees.*
        FROM users
        JOIN fees ON users.id = fees.student_id
        WHERE users.role = 'STUDENT' AND users.class = $classNum AND users.section = $section
      `);
      console.log('---', result);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

export const storage = new DatabaseStorage();