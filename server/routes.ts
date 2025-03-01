import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Student routes
  app.get("/api/student/fees", async (req, res) => {
    if (!req.isAuthenticated() || req.session.user.role !== "STUDENT") {
      return res.sendStatus(401);
    }
    const fees = await storage.getFeesByStudent(req.session.user.id);
    res.json(fees);
  });

  app.post("/api/student/fees/:feeId/pay", async (req, res) => {
    if (!req.isAuthenticated() || req.session.user.role !== "STUDENT") {
      return res.sendStatus(401);
    }

    const fee = await storage.updateFeeStatus(
      parseInt(req.params.feeId),
      "PAID",
      new Date(),
    );
    res.json(fee);
  });

  // Admin routes
  app.get("/api/admin/students/:class/:section", async (req, res) => {
    if (!req.isAuthenticated() || req.session.user.role !== "ADMIN") {
      return res.sendStatus(401);
    }

    const students = await storage.getStudentsByClass(
      parseInt(req.params.class),
      req.params.section,
    );
    res.json(students);
  });

  app.post("/api/admin/fees", async (req, res) => {
    if (!req.isAuthenticated() || req.session.user.role !== "ADMIN") {
      return res.sendStatus(401);
    }

    const fee = await storage.createFee(req.body);
    res.json(fee);
  });

  const httpServer = createServer(app);
  return httpServer;
}