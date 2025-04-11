import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "meditrack-super-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register user
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, fullName, phone, userType = "user" } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !fullName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
        phone,
        userType,
        profilePhoto: ""
      });

      // Create default settings
      await storage.createUserSettings({
        userId: user.id,
        emergencyAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        locationSharing: true,
        anonymousDataCollection: false
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login user
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user as UserType;
    res.json(userWithoutPassword);
  });

  // Logout user
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Authentication middleware
  app.use((req, res, next) => {
    // Add auth middleware to protected routes
    if (req.path.startsWith('/api/') && 
        !req.path.startsWith('/api/user') && 
        !req.path.startsWith('/api/login') && 
        !req.path.startsWith('/api/register') && 
        !req.path.startsWith('/api/logout') && 
        !req.path.startsWith('/api/system-status') && 
        !req.path.startsWith('/api/medical-services') && 
        !req.path.startsWith('/api/activities') && 
        !req.path.startsWith('/api/response-teams')) {
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
    }
    
    next();
  });
}