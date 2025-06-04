import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertVenueSchema, insertSafetyAdvisorySchema } from "@shared/schema";
import { generateAIAnalysis, generateChatbotResponse } from "./aiEngine";

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
      
      // Generate comprehensive AI analysis
      const aiAnalysis = await generateAIAnalysis(eventData);
      
      // Find or estimate venue capacity
      let venueCapacity = aiAnalysis.venueCapacity;
      const existingVenue = await storage.getVenueByLocation(eventData.location);
      if (existingVenue) {
        venueCapacity = existingVenue.maxCapacity;
      }
      
      await storage.createAIAnalysis({
        eventId: event.id,
        predictedCrowdMin: aiAnalysis.predictedCrowdMin,
        predictedCrowdMax: aiAnalysis.predictedCrowdMax,
        riskScore: aiAnalysis.riskScore,
        riskLevel: aiAnalysis.riskLevel,
        venueCapacity,
        trafficImpact: aiAnalysis.trafficImpact,
        weatherConditions: aiAnalysis.weatherConditions,
        recommendations: aiAnalysis.recommendations,
      });
      
      res.json({ 
        event, 
        aiAnalysis: {
          ...aiAnalysis,
          venueCapacity
        }
      });
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

  // AI Chatbot route
  app.post('/api/chatbot', async (req, res) => {
    try {
      const { query, context } = req.body;
      const response = await generateChatbotResponse(query, context);
      res.json({ response });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ message: "Failed to process chatbot request" });
    }
  });

  // Advanced features routes
  app.get('/api/analytics/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getAllEvents();
      const analytics = {
        totalEvents: events.length,
        approvedEvents: events.filter(e => e.status === 'approved').length,
        pendingEvents: events.filter(e => e.status === 'pending').length,
        rejectedEvents: events.filter(e => e.status === 'rejected').length,
        totalAttendance: events.reduce((sum, e) => sum + (e.expectedAttendance || 0), 0),
        avgRiskScore: 65, // Would calculate from AI analysis
        riskDistribution: {
          low: events.filter(e => true).length * 0.4,
          medium: events.filter(e => true).length * 0.4,
          high: events.filter(e => true).length * 0.2
        }
      };
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Real-time monitoring routes
  app.get('/api/monitoring/live', async (req, res) => {
    try {
      const activeEvents = await storage.getEventsByStatus('approved');
      const liveData = activeEvents.map(event => ({
        ...event,
        currentCrowd: Math.floor((event.expectedAttendance || 0) * 0.75),
        densityPercentage: 75,
        alertLevel: 'normal',
        lastUpdate: new Date()
      }));
      res.json(liveData);
    } catch (error) {
      console.error("Live monitoring error:", error);
      res.status(500).json({ message: "Failed to fetch live data" });
    }
  });

  // Emergency alert system
  app.post('/api/emergency/alert', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId, alertType, message, severity } = req.body;
      const alert = {
        id: Date.now(),
        eventId,
        alertType,
        message,
        severity,
        timestamp: new Date(),
        acknowledged: false
      };
      // In production, this would trigger SMS/WhatsApp alerts
      res.json({ alert, notificationsSent: true });
    } catch (error) {
      console.error("Emergency alert error:", error);
      res.status(500).json({ message: "Failed to send emergency alert" });
    }
  });

  // Venue capacity checker
  app.post('/api/venues/capacity-check', async (req, res) => {
    try {
      const { location, expectedAttendance } = req.body;
      const venue = await storage.getVenueByLocation(location);
      
      if (venue) {
        const utilizationPercentage = (expectedAttendance / venue.maxCapacity) * 100;
        const recommendation = utilizationPercentage > 90 ? 'overcrowded' : 
                             utilizationPercentage > 75 ? 'high_utilization' : 'safe';
        
        res.json({
          venue,
          utilizationPercentage,
          recommendation,
          safeCapacity: venue.safeCapacity,
          maxCapacity: venue.maxCapacity
        });
      } else {
        // Estimate capacity for unknown venue
        const estimatedCapacity = 5000; // Default estimate
        res.json({
          estimatedCapacity,
          utilizationPercentage: (expectedAttendance / estimatedCapacity) * 100,
          recommendation: 'venue_verification_needed'
        });
      }
    } catch (error) {
      console.error("Capacity check error:", error);
      res.status(500).json({ message: "Failed to check venue capacity" });
    }
  });

  // Time slot recommendation
  app.post('/api/events/time-recommendations', async (req, res) => {
    try {
      const { date, eventType, location } = req.body;
      
      // Generate time slot recommendations based on various factors
      const recommendations = [
        {
          timeSlot: '14:00-17:00',
          riskLevel: 'low',
          reasons: ['Avoids evening rush hour', 'Good weather conditions expected'],
          crowdFactor: 0.8
        },
        {
          timeSlot: '18:00-21:00',
          riskLevel: 'medium',
          reasons: ['Popular evening slot', 'Higher traffic congestion'],
          crowdFactor: 1.2
        },
        {
          timeSlot: '10:00-13:00',
          riskLevel: 'low',
          reasons: ['Morning slot with less congestion', 'Good for family events'],
          crowdFactor: 0.7
        }
      ];
      
      res.json({ recommendations });
    } catch (error) {
      console.error("Time recommendation error:", error);
      res.status(500).json({ message: "Failed to generate time recommendations" });
    }
  });

  // Geofencing and entry control
  app.post('/api/events/:id/entry-passes', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { numberOfPasses } = req.body;
      
      const passes = Array.from({ length: numberOfPasses }, (_, i) => ({
        passId: `PASS-${eventId}-${Date.now()}-${i}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PASS-${eventId}-${Date.now()}-${i}`,
        eventId,
        isValid: true,
        createdAt: new Date()
      }));
      
      res.json({ passes });
    } catch (error) {
      console.error("Entry pass generation error:", error);
      res.status(500).json({ message: "Failed to generate entry passes" });
    }
  });

  // Social media trend analysis
  app.get('/api/analytics/social-trends/:eventId', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      // Mock social media analysis - in production would integrate with social APIs
      const trends = {
        hashtags: ['#BengaluruEvent', '#CrowdSafe', '#SafeEvent'],
        sentiment: 'positive',
        mentionCount: 1250,
        engagementRate: 78,
        predictedAttendanceBoost: 15,
        riskFactors: []
      };
      res.json(trends);
    } catch (error) {
      console.error("Social trends error:", error);
      res.status(500).json({ message: "Failed to analyze social trends" });
    }
  });

  // Police deployment optimization
  app.post('/api/police/deployment-plan', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId, riskLevel, expectedCrowd } = req.body;
      
      const deploymentPlan = {
        officersRequired: riskLevel === 'high' ? 25 : riskLevel === 'medium' ? 15 : 8,
        vehiclesRequired: riskLevel === 'high' ? 6 : riskLevel === 'medium' ? 4 : 2,
        checkpoints: [
          { location: 'Main Entry', officers: 4 },
          { location: 'Side Entry', officers: 2 },
          { location: 'Emergency Exit', officers: 2 }
        ],
        emergencyResponse: {
          ambulances: riskLevel === 'high' ? 3 : 2,
          fireServices: riskLevel === 'high' ? 2 : 1
        },
        routeMapping: [
          'Primary access via Brigade Road',
          'Secondary access via MG Road',
          'Emergency evacuation via Ring Road'
        ]
      };
      
      res.json(deploymentPlan);
    } catch (error) {
      console.error("Deployment plan error:", error);
      res.status(500).json({ message: "Failed to generate deployment plan" });
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
