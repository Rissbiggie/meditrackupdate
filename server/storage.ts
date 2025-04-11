import {
  User, InsertUser, EmergencyRequest, InsertEmergencyRequest,
  ResponseTeam, InsertResponseTeam, MedicalService, InsertMedicalService,
  SystemStatus, InsertSystemStatus, Activity, InsertActivity,
  Notification, InsertNotification, Setting, InsertSetting,
  Stats, InsertStats
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface for the application
export interface IStorage {
  // Session storage
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Emergency requests
  getEmergencyRequest(id: number): Promise<EmergencyRequest | undefined>;
  getEmergencyRequestsByUserId(userId: number): Promise<EmergencyRequest[]>;
  getAllEmergencyRequests(): Promise<EmergencyRequest[]>;
  createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest>;
  updateEmergencyRequest(id: number, request: Partial<EmergencyRequest>): Promise<EmergencyRequest | undefined>;
  
  // Response teams
  getResponseTeam(id: number): Promise<ResponseTeam | undefined>;
  getAllResponseTeams(): Promise<ResponseTeam[]>;
  getAvailableResponseTeams(): Promise<ResponseTeam[]>;
  createResponseTeam(team: InsertResponseTeam): Promise<ResponseTeam>;
  updateResponseTeam(id: number, team: Partial<ResponseTeam>): Promise<ResponseTeam | undefined>;
  
  // Medical services
  getMedicalService(id: number): Promise<MedicalService | undefined>;
  getAllMedicalServices(): Promise<MedicalService[]>;
  getMedicalServicesByType(type: string): Promise<MedicalService[]>;
  createMedicalService(service: InsertMedicalService): Promise<MedicalService>;
  
  // System status
  getSystemStatus(id: number): Promise<SystemStatus | undefined>;
  getAllSystemStatuses(): Promise<SystemStatus[]>;
  createSystemStatus(status: InsertSystemStatus): Promise<SystemStatus>;
  updateSystemStatus(id: number, status: Partial<SystemStatus>): Promise<SystemStatus | undefined>;
  
  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Settings
  getUserSettings(userId: number): Promise<Setting | undefined>;
  createUserSettings(settings: InsertSetting): Promise<Setting>;
  updateUserSettings(userId: number, settings: Partial<Setting>): Promise<Setting | undefined>;
  
  // Stats
  getStats(): Promise<Stats | undefined>;
  updateStats(stats: Partial<Stats>): Promise<Stats | undefined>;
  
  // Initialize demo data
  initializeDemoData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emergencyRequests: Map<number, EmergencyRequest>;
  private responseTeams: Map<number, ResponseTeam>;
  private medicalServices: Map<number, MedicalService>;
  private systemStatuses: Map<number, SystemStatus>;
  private activities: Map<number, Activity>;
  private notifications: Map<number, Notification>;
  private settings: Map<number, Setting>;
  private stats: Stats | undefined;
  
  public sessionStore: session.Store;
  
  private userId: number;
  private emergencyRequestId: number;
  private responseTeamId: number;
  private medicalServiceId: number;
  private systemStatusId: number;
  private activityId: number;
  private notificationId: number;
  private settingId: number;
  
  constructor() {
    this.users = new Map();
    this.emergencyRequests = new Map();
    this.responseTeams = new Map();
    this.medicalServices = new Map();
    this.systemStatuses = new Map();
    this.activities = new Map();
    this.notifications = new Map();
    this.settings = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.userId = 1;
    this.emergencyRequestId = 1;
    this.responseTeamId = 1;
    this.medicalServiceId = 1;
    this.systemStatusId = 1;
    this.activityId = 1;
    this.notificationId = 1;
    this.settingId = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Emergency request methods
  async getEmergencyRequest(id: number): Promise<EmergencyRequest | undefined> {
    return this.emergencyRequests.get(id);
  }
  
  async getEmergencyRequestsByUserId(userId: number): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values()).filter(
      (request) => request.userId === userId,
    );
  }
  
  async getAllEmergencyRequests(): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values());
  }
  
  async createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const id = this.emergencyRequestId++;
    const now = new Date();
    const newRequest: EmergencyRequest = { 
      ...request, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    this.emergencyRequests.set(id, newRequest);
    
    // Update stats
    await this.updateEmergencyStats();
    
    return newRequest;
  }
  
  async updateEmergencyRequest(id: number, requestData: Partial<EmergencyRequest>): Promise<EmergencyRequest | undefined> {
    const request = await this.getEmergencyRequest(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      ...requestData, 
      updatedAt: new Date() 
    };
    this.emergencyRequests.set(id, updatedRequest);
    
    // Update stats
    await this.updateEmergencyStats();
    
    return updatedRequest;
  }
  
  // Response team methods
  async getResponseTeam(id: number): Promise<ResponseTeam | undefined> {
    return this.responseTeams.get(id);
  }
  
  async getAllResponseTeams(): Promise<ResponseTeam[]> {
    return Array.from(this.responseTeams.values());
  }
  
  async getAvailableResponseTeams(): Promise<ResponseTeam[]> {
    return Array.from(this.responseTeams.values()).filter(
      (team) => team.status === "available",
    );
  }
  
  async createResponseTeam(team: InsertResponseTeam): Promise<ResponseTeam> {
    const id = this.responseTeamId++;
    const newTeam: ResponseTeam = { ...team, id, createdAt: new Date() };
    this.responseTeams.set(id, newTeam);
    
    // Update stats
    await this.updateResponseTeamStats();
    
    return newTeam;
  }
  
  async updateResponseTeam(id: number, teamData: Partial<ResponseTeam>): Promise<ResponseTeam | undefined> {
    const team = await this.getResponseTeam(id);
    if (!team) return undefined;
    
    const updatedTeam = { ...team, ...teamData };
    this.responseTeams.set(id, updatedTeam);
    return updatedTeam;
  }
  
  // Medical service methods
  async getMedicalService(id: number): Promise<MedicalService | undefined> {
    return this.medicalServices.get(id);
  }
  
  async getAllMedicalServices(): Promise<MedicalService[]> {
    return Array.from(this.medicalServices.values());
  }
  
  async getMedicalServicesByType(type: string): Promise<MedicalService[]> {
    return Array.from(this.medicalServices.values()).filter(
      (service) => service.type === type,
    );
  }
  
  async createMedicalService(service: InsertMedicalService): Promise<MedicalService> {
    const id = this.medicalServiceId++;
    const newService: MedicalService = { ...service, id, createdAt: new Date() };
    this.medicalServices.set(id, newService);
    return newService;
  }
  
  // System status methods
  async getSystemStatus(id: number): Promise<SystemStatus | undefined> {
    return this.systemStatuses.get(id);
  }
  
  async getAllSystemStatuses(): Promise<SystemStatus[]> {
    return Array.from(this.systemStatuses.values());
  }
  
  async createSystemStatus(status: InsertSystemStatus): Promise<SystemStatus> {
    const id = this.systemStatusId++;
    const now = new Date();
    const newStatus: SystemStatus = { 
      ...status, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.systemStatuses.set(id, newStatus);
    return newStatus;
  }
  
  async updateSystemStatus(id: number, statusData: Partial<SystemStatus>): Promise<SystemStatus | undefined> {
    const status = await this.getSystemStatus(id);
    if (!status) return undefined;
    
    const updatedStatus = { 
      ...status, 
      ...statusData, 
      updatedAt: new Date() 
    };
    this.systemStatuses.set(id, updatedStatus);
    return updatedStatus;
  }
  
  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const newActivity: Activity = { 
      ...activity, 
      id, 
      timestamp: new Date() 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt: new Date() 
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  // Settings methods
  async getUserSettings(userId: number): Promise<Setting | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId,
    );
  }
  
  async createUserSettings(setting: InsertSetting): Promise<Setting> {
    const id = this.settingId++;
    const newSetting: Setting = { 
      ...setting, 
      id, 
      updatedAt: new Date() 
    };
    this.settings.set(id, newSetting);
    return newSetting;
  }
  
  async updateUserSettings(userId: number, settingData: Partial<Setting>): Promise<Setting | undefined> {
    const setting = await this.getUserSettings(userId);
    if (!setting) return undefined;
    
    const updatedSetting = { 
      ...setting, 
      ...settingData, 
      updatedAt: new Date() 
    };
    this.settings.set(setting.id, updatedSetting);
    return updatedSetting;
  }
  
  // Stats methods
  async getStats(): Promise<Stats | undefined> {
    return this.stats;
  }
  
  async updateStats(statsData: Partial<Stats>): Promise<Stats | undefined> {
    if (!this.stats) {
      this.stats = {
        id: 1,
        responseTeams: 0,
        resolvedCases: 0,
        pendingCases: 0,
        criticalCases: 0,
        updatedAt: new Date(),
        ...statsData
      };
    } else {
      this.stats = {
        ...this.stats,
        ...statsData,
        updatedAt: new Date()
      };
    }
    
    return this.stats;
  }
  
  // Helper methods for updating stats
  private async updateEmergencyStats(): Promise<void> {
    const allRequests = await this.getAllEmergencyRequests();
    
    const pendingCases = allRequests.filter(r => r.status === 'pending').length;
    const resolvedCases = allRequests.filter(r => r.status === 'resolved').length;
    const criticalCases = allRequests.filter(r => r.status === 'critical').length;
    
    await this.updateStats({
      pendingCases,
      resolvedCases,
      criticalCases
    });
  }
  
  private async updateResponseTeamStats(): Promise<void> {
    const allTeams = await this.getAllResponseTeams();
    await this.updateStats({
      responseTeams: allTeams.length
    });
  }
  
  // Initialize demo data for development/testing
  async initializeDemoData(): Promise<void> {
    // Create demo user
    const demoUser = await this.createUser({
      username: "demo_user",
      password: "password123",
      email: "user@example.com",
      phone: "(555) 123-4567",
      fullName: "John Smith",
      userType: "user",
      profilePhoto: ""
    });
    
    // Create demo admin
    await this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@example.com",
      phone: "(555) 987-6543",
      fullName: "Admin User",
      userType: "admin",
      profilePhoto: ""
    });
    
    // Create demo response team member
    await this.createUser({
      username: "responder",
      password: "responder123",
      email: "responder@example.com",
      phone: "(555) 456-7890",
      fullName: "Response Team Member",
      userType: "response_team",
      profilePhoto: ""
    });
    
    // Create demo response teams
    await this.createResponseTeam({
      name: "Team Alpha",
      status: "available",
      latitude: "40.7128",
      longitude: "-74.0060"
    });
    
    await this.createResponseTeam({
      name: "Team Bravo",
      status: "busy",
      latitude: "40.7282",
      longitude: "-73.9942"
    });
    
    await this.createResponseTeam({
      name: "Team Charlie",
      status: "available",
      latitude: "40.7300",
      longitude: "-74.0200"
    });
    
    // Create demo emergency requests
    await this.createEmergencyRequest({
      userId: demoUser.id,
      status: "critical",
      latitude: "40.7128",
      longitude: "-74.0060",
      description: "Critical emergency situation",
      responseTeamId: 1
    });
    
    await this.createEmergencyRequest({
      userId: demoUser.id,
      status: "in_progress",
      latitude: "40.7282",
      longitude: "-73.9942",
      description: "In progress emergency",
      responseTeamId: 2
    });
    
    await this.createEmergencyRequest({
      userId: demoUser.id,
      status: "in_progress",
      latitude: "40.7300",
      longitude: "-74.0200",
      description: "Another in progress emergency",
      responseTeamId: 3
    });
    
    // Create demo medical services
    await this.createMedicalService({
      name: "City General Hospital",
      type: "hospital",
      address: "123 Main St, New York",
      latitude: "40.7128",
      longitude: "-74.0060",
      rating: "4.5",
      reviewCount: 428,
      phone: "555-123-4567",
      openingHours: "Open 24/7",
      distance: "1.2"
    });
    
    await this.createMedicalService({
      name: "Wellness Urgent Care",
      type: "clinic",
      address: "456 Broadway, New York",
      latitude: "40.7282",
      longitude: "-73.9942",
      rating: "4.0",
      reviewCount: 156,
      phone: "555-234-5678",
      openingHours: "Open until 10 PM",
      distance: "0.8"
    });
    
    await this.createMedicalService({
      name: "HealthPlus Pharmacy",
      type: "pharmacy",
      address: "789 5th Ave, New York",
      latitude: "40.7300",
      longitude: "-74.0200",
      rating: "4.8",
      reviewCount: 312,
      phone: "555-345-6789",
      openingHours: "Open until 9 PM",
      distance: "0.3"
    });
    
    // Create demo system statuses
    await this.createSystemStatus({
      name: "Emergency Response",
      status: "operational",
      icon: "fa-ambulance"
    });
    
    await this.createSystemStatus({
      name: "Location Services",
      status: "operational",
      icon: "fa-location-dot"
    });
    
    await this.createSystemStatus({
      name: "Notifications",
      status: "partial",
      icon: "fa-bell"
    });
    
    await this.createSystemStatus({
      name: "Medical Database",
      status: "operational",
      icon: "fa-database"
    });
    
    // Create demo activities
    await this.createActivity({
      title: "System maintenance completed",
      description: "Yesterday, 11:30 PM",
      icon: "fa-check",
      iconBg: "bg-primary-100"
    });
    
    await this.createActivity({
      title: "Updated hospital directory",
      description: "3 days ago, 9:15 AM",
      icon: "fa-hospital",
      iconBg: "bg-success-50"
    });
    
    await this.createActivity({
      title: "Emergency alert test conducted",
      description: "5 days ago, 2:45 PM",
      icon: "fa-exclamation-triangle",
      iconBg: "bg-danger-50"
    });
    
    // Create user settings
    await this.createUserSettings({
      userId: demoUser.id,
      emergencyAlerts: true,
      emailNotifications: true,
      smsNotifications: false,
      locationSharing: true,
      anonymousDataCollection: false
    });
    
    // Initialize stats
    await this.updateStats({
      responseTeams: 12,
      resolvedCases: 28,
      pendingCases: 3,
      criticalCases: 1
    });
  }
}

export const storage = new MemStorage();
// Initialize demo data
storage.initializeDemoData();
