import { z } from "zod";

// User validation schema
export const insertUserSchema = z.object({
  username: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  role: z.enum(["ADMIN", "STUDENT"]),
  name: z.string().min(1, "Name is required"),
  class: z.number().optional(),
  section: z.string().optional(),
});

// Fee validation schema
export const insertFeeSchema = z.object({
  student_id: z.number(),
  type: z.string(),
  amount: z.string(),
  due_date: z.date(),
  status: z.string(),
  payment_date: z.date().optional(),
  receipt_url: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
  name: string;
  class: number | null;
  section: string | null;
};

export type Fee = {
  id: number;
  studentId: number;
  type: string;
  amount: number;
  dueDate: Date;
  status: string;
  paymentDate: Date | null;
  receiptUrl: string | null;
};