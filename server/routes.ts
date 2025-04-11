import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertEmergencyRequestSchema,
  insertResponseTeamSchema,
  insertMedicalServiceSchema,
  insertSystemStatusSchema,
  insertActivitySchema,
  insertNotificationSchema,
  insertSettingsSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (error: ZodError, res: Response) => {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors
    });
  };

  // Authentication check middleware (simplified for demo)
  const authenticateUser = async (req: Request, res: Response, next: Function) => {
    // For a real app, implement proper authentication with sessions/JWT
    // Here we're just checking if user exists as a simple validation
    const userId = parseInt(req.headers['user-id'] as string);
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.body.userId = userId;
    next();
  };

  /*
   * User Routes
   */
  
  // Register user
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Create default settings for the user
      await storage.createUserSettings({
        userId: user.id,
        emergencyAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        locationSharing: true,
        anonymousDataCollection: false
      });
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        userType: user.userType 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Login user (simplified for demo)
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.status(200).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        userType: user.userType 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Get current user
  app.get("/api/users/me", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        profilePhoto: user.profilePhoto,
        phone: user.phone
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Update user
  app.patch("/api/users/me", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const userData = req.body;
      
      // Remove userId from the update data
      delete userData.userId;
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        id: updatedUser.id, 
        username: updatedUser.username, 
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        userType: updatedUser.userType,
        profilePhoto: updatedUser.profilePhoto,
        phone: updatedUser.phone
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  /*
   * Emergency Request Routes
   */
  
  // Create emergency request
  app.post("/api/emergency-requests", authenticateUser, async (req, res) => {
    try {
      const requestData = insertEmergencyRequestSchema.parse({
        ...req.body,
        userId: req.body.userId
      });
      
      const request = await storage.createEmergencyRequest(requestData);
      
      // Create activity for the emergency request
      await storage.createActivity({
        title: "Emergency request created",
        description: `Emergency request #EM-${request.id} has been created`,
        icon: "fa-exclamation-circle",
        iconBg: "bg-danger-50"
      });
      
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create emergency request" });
    }
  });
  
  // Get all emergency requests (admin/response team only)
  app.get("/api/emergency-requests", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storage.getUser(userId);
      
      if (!user || (user.userType !== "admin" && user.userType !== "response_team")) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const requests = await storage.getAllEmergencyRequests();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get emergency requests" });
    }
  });
  
  // Get emergency requests for current user
  app.get("/api/emergency-requests/me", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const requests = await storage.getEmergencyRequestsByUserId(userId);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get emergency requests" });
    }
  });
  
  // Update emergency request (admin/response team only)
  app.patch("/api/emergency-requests/:id", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storage.getUser(userId);
      
      if (!user || (user.userType !== "admin" && user.userType !== "response_team")) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const requestId = parseInt(req.params.id);
      const requestData = req.body;
      
      // Remove userId from the update data
      delete requestData.userId;
      
      const updatedRequest = await storage.updateEmergencyRequest(requestId, requestData);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      
      // Create activity for the request update
      await storage.createActivity({
        title: "Emergency request updated",
        description: `Emergency request #EM-${updatedRequest.id} has been updated to ${updatedRequest.status}`,
        icon: "fa-check-circle",
        iconBg: "bg-success-50"
      });
      
      res.status(200).json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update emergency request" });
    }
  });
  
  /*
   * Response Team Routes
   */
  
  // Get all response teams
  app.get("/api/response-teams", async (req, res) => {
    try {
      const teams = await storage.getAllResponseTeams();
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get response teams" });
    }
  });
  
  // Get available response teams
  app.get("/api/response-teams/available", async (req, res) => {
    try {
      const teams = await storage.getAvailableResponseTeams();
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get available response teams" });
    }
  });
  
  // Create response team (admin only)
  app.post("/api/response-teams", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const teamData = insertResponseTeamSchema.parse(req.body);
      const team = await storage.createResponseTeam(teamData);
      
      // Create activity for the new team
      await storage.createActivity({
        title: "Response team created",
        description: `New response team "${team.name}" has been created`,
        icon: "fa-user-md",
        iconBg: "bg-primary-100"
      });
      
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create response team" });
    }
  });
  
  // Update response team (admin/response team only)
  app.patch("/api/response-teams/:id", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storage.getUser(userId);
      
      if (!user || (user.userType !== "admin" && user.userType !== "response_team")) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const teamId = parseInt(req.params.id);
      const teamData = req.body;
      
      // Remove userId from the update data
      delete teamData.userId;
      
      const updatedTeam = await storage.updateResponseTeam(teamId, teamData);
      
      if (!updatedTeam) {
        return res.status(404).json({ message: "Response team not found" });
      }
      
      res.status(200).json(updatedTeam);
    } catch (error) {
      res.status(500).json({ message: "Failed to update response team" });
    }
  });
  
  /*
   * Medical Service Routes
   */
  
  // Get all medical services
  app.get("/api/medical-services", async (req, res) => {
    try {
      const services = await storage.getAllMedicalServices();
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to get medical services" });
    }
  });
  
  // Get medical services by type
  app.get("/api/medical-services/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const services = await storage.getMedicalServicesByType(type);
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to get medical services" });
    }
  });
  
  // Create medical service (admin only)
  app.post("/api/medical-services", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const serviceData = insertMedicalServiceSchema.parse(req.body);
      const service = await storage.createMedicalService(serviceData);
      
      // Create activity for the new service
      await storage.createActivity({
        title: "Medical service added",
        description: `New medical service "${service.name}" has been added`,
        icon: "fa-hospital",
        iconBg: "bg-success-50"
      });
      
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create medical service" });
    }
  });
  
  /*
   * System Status Routes
   */
  
  // Get all system statuses
  app.get("/api/system-status", async (req, res) => {
    try {
      const statuses = await storage.getAllSystemStatuses();
      res.status(200).json(statuses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get system statuses" });
    }
  });
  
  // Update system status (admin only)
  app.patch("/api/system-status/:id", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const statusId = parseInt(req.params.id);
      const statusData = req.body;
      
      // Remove userId from the update data
      delete statusData.userId;
      
      const updatedStatus = await storage.updateSystemStatus(statusId, statusData);
      
      if (!updatedStatus) {
        return res.status(404).json({ message: "System status not found" });
      }
      
      res.status(200).json(updatedStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to update system status" });
    }
  });
  
  /*
   * Activity Routes
   */
  
  // Get all activities
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllActivities();
      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });
  
  /*
   * Notification Routes
   */
  
  // Get notifications for current user
  app.get("/api/notifications", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });
  
  // Mark notification as read
  app.patch("/api/notifications/:id/read", authenticateUser, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(200).json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  /*
   * Settings Routes
   */
  
  // Get user settings
  app.get("/api/settings", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });
  
  // Update user settings
  app.patch("/api/settings", authenticateUser, async (req, res) => {
    try {
      const userId = req.body.userId;
      const settingsData = req.body;
      
      // Remove userId from the update data
      delete settingsData.userId;
      
      let settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Create settings if they don't exist
        settings = await storage.createUserSettings({
          userId,
          ...settingsData
        });
      } else {
        // Update existing settings
        settings = await storage.updateUserSettings(userId, settingsData);
      }
      
      if (!settings) {
        return res.status(404).json({ message: "Failed to update settings" });
      }
      
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  
  /*
   * Stats Routes
   */
  
  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      
      if (!stats) {
        return res.status(404).json({ message: "Stats not found" });
      }
      
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
