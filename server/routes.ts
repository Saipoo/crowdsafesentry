import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertVenueSchema, insertSafetyAdvisorySchema } from "@shared/schema";
import { generateCrowdPrediction, calculateRiskScore, generateRecommendations } from "./aiEngine";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Event routes
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse(req.body);
      
      // Create the event
      const event = await storage.createEvent(eventData, userId);
      
      // Generate AI analysis
      const crowdPrediction = generateCrowdPrediction(eventData);
      const riskScore = calculateRiskScore(crowdPrediction, eventData);
      const riskLevel = riskScore >= 80 ? 'high' : riskScore >= 50 ? 'medium' : 'low';
      
      // Find or estimate venue capacity
      let venueCapacity = 10000; // Default capacity
      const existingVenue = await storage.getVenueByLocation(eventData.location);
      if (existingVenue) {
        venueCapacity = existingVenue.maxCapacity;
      }
      
      const recommendations = generateRecommendations(riskScore, crowdPrediction, venueCapacity);
      
      await storage.createAIAnalysis({
        eventId: event.id,
        predictedCrowdMin: crowdPrediction.min,
        predictedCrowdMax: crowdPrediction.max,
        riskScore,
        riskLevel,
        venueCapacity,
        trafficImpact: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
        weatherConditions: 'clear', // Mock data - would integrate with weather API
        recommendations,
      });
      
      res.json({ event, riskScore, riskLevel, crowdPrediction, venueCapacity });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/approved', async (req, res) => {
    try {
      const events = await storage.getEventsByStatus('approved');
      res.json(events);
    } catch (error) {
      console.error("Error fetching approved events:", error);
      res.status(500).json({ message: "Failed to fetch approved events" });
    }
  });

  app.get('/api/events/pending', isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getEventsByStatus('pending');
      
      // Fetch AI analysis for each event
      const eventsWithAnalysis = await Promise.all(
        events.map(async (event) => {
          const analysis = await storage.getAIAnalysisByEventId(event.id);
          return { ...event, aiAnalysis: analysis };
        })
      );
      
      res.json(eventsWithAnalysis);
    } catch (error) {
      console.error("Error fetching pending events:", error);
      res.status(500).json({ message: "Failed to fetch pending events" });
    }
  });

  app.get('/api/events/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getEventsByOrganizer(userId);
      
      // Fetch AI analysis for each event
      const eventsWithAnalysis = await Promise.all(
        events.map(async (event) => {
          const analysis = await storage.getAIAnalysisByEventId(event.id);
          return { ...event, aiAnalysis: analysis };
        })
      );
      
      res.json(eventsWithAnalysis);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.patch('/api/events/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      
      // Check if user has police role
      const user = await storage.getUser(userId);
      if (user?.role !== 'police') {
        return res.status(403).json({ message: "Only police can approve events" });
      }
      
      const updatedEvent = await storage.updateEventStatus(eventId, 'approved', userId);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error approving event:", error);
      res.status(500).json({ message: "Failed to approve event" });
    }
  });

  app.patch('/api/events/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      const { reason } = req.body;
      
      // Check if user has police role
      const user = await storage.getUser(userId);
      if (user?.role !== 'police') {
        return res.status(403).json({ message: "Only police can reject events" });
      }
      
      const updatedEvent = await storage.updateEventStatus(eventId, 'rejected', undefined, reason);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error rejecting event:", error);
      res.status(500).json({ message: "Failed to reject event" });
    }
  });

  // Safety advisory routes
  app.get('/api/safety-advisories', async (req, res) => {
    try {
      const advisories = await storage.getActiveSafetyAdvisories();
      res.json(advisories);
    } catch (error) {
      console.error("Error fetching safety advisories:", error);
      res.status(500).json({ message: "Failed to fetch safety advisories" });
    }
  });

  app.post('/api/safety-advisories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user has police role
      const user = await storage.getUser(userId);
      if (user?.role !== 'police') {
        return res.status(403).json({ message: "Only police can create safety advisories" });
      }
      
      const advisoryData = insertSafetyAdvisorySchema.parse(req.body);
      const advisory = await storage.createSafetyAdvisory(advisoryData);
      res.json(advisory);
    } catch (error) {
      console.error("Error creating safety advisory:", error);
      res.status(500).json({ message: "Failed to create safety advisory" });
    }
  });

  // Crowd monitoring routes
  app.post('/api/crowd-monitoring', isAuthenticated, async (req, res) => {
    try {
      const { eventId, currentCrowd, densityPercentage, alertLevel } = req.body;
      
      const monitoring = await storage.createCrowdMonitoring({
        eventId,
        currentCrowd,
        densityPercentage,
        alertLevel,
      });
      
      res.json(monitoring);
    } catch (error) {
      console.error("Error creating crowd monitoring data:", error);
      res.status(500).json({ message: "Failed to create crowd monitoring data" });
    }
  });

  app.get('/api/crowd-monitoring/:eventId', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const monitoring = await storage.getLatestCrowdMonitoring(eventId);
      res.json(monitoring);
    } catch (error) {
      console.error("Error fetching crowd monitoring data:", error);
      res.status(500).json({ message: "Failed to fetch crowd monitoring data" });
    }
  });

  // User role update route
  app.patch('/api/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!['public', 'organizer', 'police'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.upsertUser({
        ...user,
        role,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// AI Engine functions
function generateCrowdPrediction(eventData: any): { min: number; max: number } {
  // Basic crowd prediction algorithm
  let basePrediction = eventData.expectedAttendance;
  
  // Adjust based on event type
  const eventTypeMultipliers: { [key: string]: number } = {
    concert: 1.3,
    movie: 1.1,
    political: 1.5,
    sports: 1.2,
    cultural: 1.0,
    other: 1.0,
  };
  
  const multiplier = eventTypeMultipliers[eventData.eventType] || 1.0;
  basePrediction *= multiplier;
  
  // Add variability
  const variance = 0.2; // 20% variance
  const min = Math.floor(basePrediction * (1 - variance));
  const max = Math.floor(basePrediction * (1 + variance));
  
  return { min, max };
}

function calculateRiskScore(crowdPrediction: { min: number; max: number }, eventData: any): number {
  let riskScore = 0;
  
  // Base risk from crowd size
  const avgCrowd = (crowdPrediction.min + crowdPrediction.max) / 2;
  if (avgCrowd > 20000) riskScore += 40;
  else if (avgCrowd > 10000) riskScore += 25;
  else if (avgCrowd > 5000) riskScore += 15;
  else riskScore += 5;
  
  // Event type risk
  const eventTypeRisk: { [key: string]: number } = {
    concert: 20,
    political: 30,
    sports: 15,
    movie: 10,
    cultural: 5,
    other: 10,
  };
  
  riskScore += eventTypeRisk[eventData.eventType] || 10;
  
  // Time-based risk (evening events are riskier)
  const hour = parseInt(eventData.startTime.split(':')[0]);
  if (hour >= 18) riskScore += 15;
  else if (hour >= 15) riskScore += 10;
  else riskScore += 5;
  
  // Weekend risk
  const eventDate = new Date(eventData.date);
  const dayOfWeek = eventDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) riskScore += 10;
  
  return Math.min(riskScore, 100);
}

function generateRecommendations(riskScore: number, crowdPrediction: { min: number; max: number }, venueCapacity: number): string[] {
  const recommendations: string[] = [];
  
  if (riskScore >= 80) {
    recommendations.push("Deploy additional 25+ officers for crowd control");
    recommendations.push("Set up 3+ emergency medical stations");
    recommendations.push("Implement traffic diversions on major routes");
    recommendations.push("Consider limiting entry after 85% capacity");
    recommendations.push("Deploy emergency response teams on standby");
  } else if (riskScore >= 50) {
    recommendations.push("Deploy additional 15 officers for crowd control");
    recommendations.push("Set up 2 emergency medical stations");
    recommendations.push("Monitor traffic flow and prepare diversions");
    recommendations.push("Consider limiting entry after 90% capacity");
  } else {
    recommendations.push("Deploy standard security personnel");
    recommendations.push("Set up 1 emergency medical station");
    recommendations.push("Monitor crowd density regularly");
  }
  
  // Capacity-based recommendations
  const avgCrowd = (crowdPrediction.min + crowdPrediction.max) / 2;
  if (avgCrowd > venueCapacity * 0.9) {
    recommendations.push("Venue approaching maximum capacity - implement strict entry controls");
  }
  
  return recommendations;
}
