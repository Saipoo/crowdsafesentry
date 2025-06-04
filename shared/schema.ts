import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("public").notNull(), // public, organizer, police
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  eventType: varchar("event_type").notNull(),
  date: timestamp("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  location: text("location").notNull(),
  expectedAttendance: integer("expected_attendance").notNull(),
  celebrityName: varchar("celebrity_name").notNull(),
  specialRequirements: text("special_requirements"),
  organizerId: varchar("organizer_id").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Analysis table
export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  predictedCrowdMin: integer("predicted_crowd_min").notNull(),
  predictedCrowdMax: integer("predicted_crowd_max").notNull(),
  riskScore: integer("risk_score").notNull(), // 0-100
  riskLevel: varchar("risk_level").notNull(), // low, medium, high
  venueCapacity: integer("venue_capacity").notNull(),
  trafficImpact: varchar("traffic_impact").notNull(), // low, medium, high
  weatherConditions: varchar("weather_conditions").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Venues table for capacity analysis
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  location: text("location").notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  safeCapacity: integer("safe_capacity").notNull(),
  venueType: varchar("venue_type").notNull(),
  facilities: jsonb("facilities"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time monitoring data
export const crowdMonitoring = pgTable("crowd_monitoring", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  currentCrowd: integer("current_crowd").notNull(),
  densityPercentage: decimal("density_percentage", { precision: 5, scale: 2 }).notNull(),
  alertLevel: varchar("alert_level").notNull(), // normal, warning, critical
  timestamp: timestamp("timestamp").defaultNow(),
});

// Safety advisories
export const safetyAdvisories = pgTable("safety_advisories", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // travel, route, emergency
  severity: varchar("severity").notNull(), // info, warning, alert
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Emergency alerts
export const emergencyAlerts = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  alertType: varchar("alert_type").notNull(), // crowd_surge, capacity_warning, emergency
  message: text("message").notNull(),
  severity: varchar("severity").notNull(), // low, medium, high, critical
  acknowledged: boolean("acknowledged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Entry passes for geofencing
export const entryPasses = pgTable("entry_passes", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  passId: varchar("pass_id").notNull().unique(),
  qrCode: text("qr_code").notNull(),
  isValid: boolean("is_valid").default(true),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Police deployment plans
export const deploymentPlans = pgTable("deployment_plans", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  officersRequired: integer("officers_required").notNull(),
  vehiclesRequired: integer("vehicles_required").notNull(),
  checkpoints: jsonb("checkpoints").notNull(),
  emergencyResponse: jsonb("emergency_response").notNull(),
  routeMapping: jsonb("route_mapping").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social media trends
export const socialTrends = pgTable("social_trends", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  hashtags: jsonb("hashtags").notNull(),
  sentiment: varchar("sentiment").notNull(),
  mentionCount: integer("mention_count").default(0),
  engagementRate: integer("engagement_rate").default(0),
  predictedAttendanceBoost: integer("predicted_attendance_boost").default(0),
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

// Historical event data
export const eventHistory = pgTable("event_history", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  actualAttendance: integer("actual_attendance"),
  incidentCount: integer("incident_count").default(0),
  crowdBehavior: text("crowd_behavior"),
  weatherActual: varchar("weather_actual"),
  policeFeedback: text("police_feedback"),
  organizerFeedback: text("organizer_feedback"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Panic button incidents
export const panicIncidents = pgTable("panic_incidents", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),
  userId: varchar("user_id").notNull(),
  location: text("location"),
  incidentType: varchar("incident_type").notNull(), // medical, security, crowd_issue
  description: text("description"),
  resolved: boolean("resolved").default(false),
  responseTime: integer("response_time_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI predictions tracking
export const aiPredictions = pgTable("ai_predictions", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  predictedCrowd: integer("predicted_crowd").notNull(),
  actualCrowd: integer("actual_crowd"),
  accuracyScore: decimal("accuracy_score", { precision: 5, scale: 2 }),
  modelVersion: varchar("model_version").default("1.0"),
  predictionDate: timestamp("prediction_date").defaultNow(),
});

// Officer locations for tracking
export const officerLocations = pgTable("officer_locations", {
  id: serial("id").primaryKey(),
  officerId: varchar("officer_id").notNull(),
  eventId: integer("event_id"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  status: varchar("status").default("on_duty"), // on_duty, off_duty, responding, break
  lastUpdate: timestamp("last_update").defaultNow(),
});

// Blacklisted entities
export const blacklist = pgTable("blacklist", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type").notNull(), // venue, organizer, celebrity
  entityName: varchar("entity_name").notNull(),
  reason: text("reason").notNull(),
  severity: varchar("severity").notNull(), // warning, banned
  addedBy: varchar("added_by").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  aiAnalysis: one(aiAnalysis),
  crowdMonitoring: many(crowdMonitoring),
}));

export const aiAnalysisRelations = relations(aiAnalysis, ({ one }) => ({
  event: one(events, {
    fields: [aiAnalysis.eventId],
    references: [events.id],
  }),
}));

export const crowdMonitoringRelations = relations(crowdMonitoring, ({ one }) => ({
  event: one(events, {
    fields: [crowdMonitoring.eventId],
    references: [events.id],
  }),
}));

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  organizerId: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
});

export const insertSafetyAdvisorySchema = createInsertSchema(safetyAdvisories).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type AIAnalysis = typeof aiAnalysis.$inferSelect;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type CrowdMonitoring = typeof crowdMonitoring.$inferSelect;
export type SafetyAdvisory = typeof safetyAdvisories.$inferSelect;
export type InsertSafetyAdvisory = z.infer<typeof insertSafetyAdvisorySchema>;
