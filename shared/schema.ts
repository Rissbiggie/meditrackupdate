import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  fullName: text("full_name").notNull(),
  userType: text("user_type").notNull().default("user"), // user, admin, response_team
  profilePhoto: text("profile_photo"),
  createdAt: timestamp("created_at").defaultNow()
});

// Emergency requests schema
export const emergencyRequests = pgTable("emergency_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, resolved, cancelled
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  description: text("description"),
  responseTeamId: integer("response_team_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Response teams schema
export const responseTeams = pgTable("response_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("available"), // available, busy, offline
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow()
});

// Medical services schema
export const medicalServices = pgTable("medical_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hospital, clinic, pharmacy, dentist, optician, etc.
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  rating: text("rating"),
  reviewCount: integer("review_count"),
  phone: text("phone"),
  openingHours: text("opening_hours"),
  distance: text("distance"),
  createdAt: timestamp("created_at").defaultNow()
});

// System status schema
export const systemStatus = pgTable("system_status", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(), // operational, partial, offline
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Activities schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  iconBg: text("icon_bg"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  emergencyAlerts: boolean("emergency_alerts").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  locationSharing: boolean("location_sharing").default(true),
  anonymousDataCollection: boolean("anonymous_data_collection").default(false),
  updatedAt: timestamp("updated_at")
});

// Stats schema
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  responseTeams: integer("response_teams").default(0),
  resolvedCases: integer("resolved_cases").default(0),
  pendingCases: integer("pending_cases").default(0),
  criticalCases: integer("critical_cases").default(0),
  updatedAt: timestamp("updated_at")
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertResponseTeamSchema = createInsertSchema(responseTeams).omit({ id: true, createdAt: true });
export const insertMedicalServiceSchema = createInsertSchema(medicalServices).omit({ id: true, createdAt: true });
export const insertSystemStatusSchema = createInsertSchema(systemStatus).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });
export const insertStatsSchema = createInsertSchema(stats).omit({ id: true, updatedAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type EmergencyRequest = typeof emergencyRequests.$inferSelect;
export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;

export type ResponseTeam = typeof responseTeams.$inferSelect;
export type InsertResponseTeam = z.infer<typeof insertResponseTeamSchema>;

export type MedicalService = typeof medicalServices.$inferSelect;
export type InsertMedicalService = z.infer<typeof insertMedicalServiceSchema>;

export type SystemStatus = typeof systemStatus.$inferSelect;
export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

export type Stats = typeof stats.$inferSelect;
export type InsertStats = z.infer<typeof insertStatsSchema>;

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  emergencyRequests: many(emergencyRequests),
  notifications: many(notifications),
  settings: one(settings, {
    fields: [users.id],
    references: [settings.userId],
  }),
}));

export const emergencyRequestsRelations = relations(emergencyRequests, ({ one }) => ({
  user: one(users, {
    fields: [emergencyRequests.userId],
    references: [users.id],
  }),
  responseTeam: one(responseTeams, {
    fields: [emergencyRequests.responseTeamId],
    references: [responseTeams.id],
  }),
}));

export const responseTeamsRelations = relations(responseTeams, ({ many }) => ({
  emergencyRequests: many(emergencyRequests),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id],
  }),
}));
