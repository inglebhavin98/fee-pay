import { users, fees, type User, type InsertUser, type Fee, type InsertFee } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getFeesByStudent(studentId: number): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getFeesByStudent(studentId: number): Promise<Fee[]> {
    return db.select().from(fees).where(eq(fees.studentId, studentId));
  }

  async createFee(fee: InsertFee): Promise<Fee> {
    const [newFee] = await db.insert(fees).values(fee).returning();
    return newFee;
  }

  async updateFeeStatus(
    feeId: number,
    status: string,
    paymentDate?: Date,
  ): Promise<Fee> {
    const [updatedFee] = await db
      .update(fees)
      .set({ status, paymentDate })
      .where(eq(fees.id, feeId))
      .returning();

    if (!updatedFee) {
      throw new Error("Fee not found");
    }

    return updatedFee;
  }

  async getStudentsByClass(classNum: number, section: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.class, classNum))
      .where(eq(users.section, section))
      .where(eq(users.role, "STUDENT"));
  }
}

export const storage = new DatabaseStorage();