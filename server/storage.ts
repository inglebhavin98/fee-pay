import { InsertUser, User, Fee, type InsertFee } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private fees: Map<number, Fee>;
  private currentUserId: number;
  private currentFeeId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.fees = new Map();
    this.currentUserId = 1;
    this.currentFeeId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed initial users
    this.seedUsers();
  }

  private seedUsers() {
    // Create admin
    this.createUser({
      username: "admin@somemail.com",
      password: "12345",
      role: "ADMIN",
      name: "Admin User",
      class: null,
      section: null,
    });

    // Create student
    const student = this.createUser({
      username: "schoolkid@somemail.com",
      password: "12345",
      role: "STUDENT",
      name: "John Doe",
      class: 5,
      section: "A",
    });

    // Create fee for student
    this.createFee({
      studentId: student.id,
      type: "Annual Fee",
      amount: "5000",
      dueDate: new Date("2024-03-31"),
      status: "UNPAID",
      paymentDate: null,
      receiptUrl: null,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFeesByStudent(studentId: number): Promise<Fee[]> {
    return Array.from(this.fees.values()).filter(
      (fee) => fee.studentId === studentId,
    );
  }

  async createFee(fee: InsertFee): Promise<Fee> {
    const id = this.currentFeeId++;
    const newFee = { ...fee, id };
    this.fees.set(id, newFee);
    return newFee;
  }

  async updateFeeStatus(
    feeId: number,
    status: string,
    paymentDate?: Date,
  ): Promise<Fee> {
    const fee = this.fees.get(feeId);
    if (!fee) throw new Error("Fee not found");

    const updatedFee = {
      ...fee,
      status,
      paymentDate: paymentDate || null,
    };
    this.fees.set(feeId, updatedFee);
    return updatedFee;
  }

  async getStudentsByClass(classNum: number, section: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) =>
        user.role === "STUDENT" &&
        user.class === classNum &&
        user.section === section,
    );
  }
}

export const storage = new MemStorage();
