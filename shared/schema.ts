import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  class: integer("class"),
  section: text("section"),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  type: text("type").notNull(),
  amount: decimal("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull(), // "PAID" | "UNPAID" | "ISSUE"
  paymentDate: timestamp("payment_date"),
  receiptUrl: text("receipt_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  class: true,
  section: true,
});

export const insertFeeSchema = createInsertSchema(fees);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Fee = typeof fees.$inferSelect;
