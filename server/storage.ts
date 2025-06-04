import {
  users,
  events,
  aiAnalysis,
  venues,
  crowdMonitoring,
  safetyAdvisories,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type AIAnalysis,
  type Venue,
  type InsertVenue,
  type CrowdMonitoring,
  type SafetyAdvisory,
  type InsertSafetyAdvisory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Event operations
  createEvent(event: InsertEvent, organizerId: string): Promise<Event>;
  getEventById(id: number): Promise<Event | undefined>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  getEventsByStatus(status: string): Promise<Event[]>;
  updateEventStatus(eventId: number, status: string, approvedBy?: string, rejectionReason?: string): Promise<Event>;

  // AI Analysis operations
  createAIAnalysis(analysis: Omit<typeof aiAnalysis.$inferInsert, 'id' | 'createdAt'>): Promise<AIAnalysis>;
  getAIAnalysisByEventId(eventId: number): Promise<AIAnalysis | undefined>;

  // Venue operations
  createVenue(venue: InsertVenue): Promise<Venue>;
  getVenueByLocation(location: string): Promise<Venue | undefined>;
  getAllVenues(): Promise<Venue[]>;

  // Crowd monitoring operations
  createCrowdMonitoring(monitoring: Omit<typeof crowdMonitoring.$inferInsert, 'id' | 'timestamp'>): Promise<CrowdMonitoring>;
  getLatestCrowdMonitoring(eventId: number): Promise<CrowdMonitoring | undefined>;
  getCrowdMonitoringByEvent(eventId: number): Promise<CrowdMonitoring[]>;

  // Safety advisory operations
  createSafetyAdvisory(advisory: InsertSafetyAdvisory): Promise<SafetyAdvisory>;
  getActiveSafetyAdvisories(): Promise<SafetyAdvisory[]>;
  getAllSafetyAdvisories(): Promise<SafetyAdvisory[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations
  async createEvent(event: InsertEvent, organizerId: string): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({
        ...event,
        organizerId,
      })
      .returning();
    return newEvent;
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(desc(events.createdAt));
  }

  async getAllEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt));
  }

  async getEventsByStatus(status: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.status, status))
      .orderBy(desc(events.createdAt));
  }

  async updateEventStatus(
    eventId: number,
    status: string,
    approvedBy?: string,
    rejectionReason?: string
  ): Promise<Event> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'approved' && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId))
      .returning();
    
    return updatedEvent;
  }

  // AI Analysis operations
  async createAIAnalysis(analysis: Omit<typeof aiAnalysis.$inferInsert, 'id' | 'createdAt'>): Promise<AIAnalysis> {
    const [newAnalysis] = await db
      .insert(aiAnalysis)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getAIAnalysisByEventId(eventId: number): Promise<AIAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(aiAnalysis)
      .where(eq(aiAnalysis.eventId, eventId));
    return analysis;
  }

  // Venue operations
  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [newVenue] = await db
      .insert(venues)
      .values(venue)
      .returning();
    return newVenue;
  }

  async getVenueByLocation(location: string): Promise<Venue | undefined> {
    const [venue] = await db
      .select()
      .from(venues)
      .where(eq(venues.location, location));
    return venue;
  }

  async getAllVenues(): Promise<Venue[]> {
    return await db.select().from(venues);
  }

  // Crowd monitoring operations
  async createCrowdMonitoring(monitoring: Omit<typeof crowdMonitoring.$inferInsert, 'id' | 'timestamp'>): Promise<CrowdMonitoring> {
    const [newMonitoring] = await db
      .insert(crowdMonitoring)
      .values(monitoring)
      .returning();
    return newMonitoring;
  }

  async getLatestCrowdMonitoring(eventId: number): Promise<CrowdMonitoring | undefined> {
    const [monitoring] = await db
      .select()
      .from(crowdMonitoring)
      .where(eq(crowdMonitoring.eventId, eventId))
      .orderBy(desc(crowdMonitoring.timestamp))
      .limit(1);
    return monitoring;
  }

  async getCrowdMonitoringByEvent(eventId: number): Promise<CrowdMonitoring[]> {
    return await db
      .select()
      .from(crowdMonitoring)
      .where(eq(crowdMonitoring.eventId, eventId))
      .orderBy(desc(crowdMonitoring.timestamp));
  }

  // Safety advisory operations
  async createSafetyAdvisory(advisory: InsertSafetyAdvisory): Promise<SafetyAdvisory> {
    const [newAdvisory] = await db
      .insert(safetyAdvisories)
      .values(advisory)
      .returning();
    return newAdvisory;
  }

  async getActiveSafetyAdvisories(): Promise<SafetyAdvisory[]> {
    return await db
      .select()
      .from(safetyAdvisories)
      .where(eq(safetyAdvisories.isActive, true))
      .orderBy(desc(safetyAdvisories.createdAt));
  }

  async getAllSafetyAdvisories(): Promise<SafetyAdvisory[]> {
    return await db
      .select()
      .from(safetyAdvisories)
      .orderBy(desc(safetyAdvisories.createdAt));
  }
}

export const storage = new DatabaseStorage();
