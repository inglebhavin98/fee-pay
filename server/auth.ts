import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      isAuthenticated(): boolean;
    }
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  app.use((req, _res, next) => {
    req.isAuthenticated = () => !!req.session.user;
    next();
  });

  app.post("/api/register", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser(req.body);
      req.session.user = user;
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.user = user;
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    res.json(req.session.user);
  });
}