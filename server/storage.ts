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
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return result.rows[0];
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    try {
      const result = await pool.query(
        "INSERT INTO users (username, password, role, name, class, section) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [user.username, user.password, user.role, user.name, user.class, user.section]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getFeesByStudent(studentId: number): Promise<Fee[]> {
    const result = await pool.query("SELECT * FROM fees WHERE student_id = $1", [studentId]);
    return result.rows;
  }

  async createFee(fee: Omit<Fee, "id">): Promise<Fee> {
    try {
      const result = await pool.query(
        "INSERT INTO fees (student_id, type, amount, due_date, status, payment_date, receipt_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [fee.student_id, fee.type, fee.amount, fee.due_date, fee.status, fee.payment_date, fee.receipt_url]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating fee:', error);
      throw error;
    }
  }

  async updateFeeStatus(feeId: number, status: string, paymentDate?: Date): Promise<Fee> {
    const result = await pool.query(
      "UPDATE fees SET status = $1, payment_date = $2 WHERE id = $3 RETURNING *",
      [status, paymentDate, feeId]
    );

    if (!result.rows[0]) {
      throw new Error("Fee not found");
    }

    return result.rows[0];
  }

  async getStudentsByClass(classNum: number, section: string): Promise<User[]> {
    const result = await pool.query(
      "SELECT * FROM users WHERE role = 'STUDENT' AND class = $1 AND section = $2",
      [classNum, section]
    );
    return result.rows;
  }
}

export const storage = new DatabaseStorage();