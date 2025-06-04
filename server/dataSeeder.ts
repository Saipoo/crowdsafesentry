import { storage } from "./storage";

export async function seedInitialData() {
  try {
    console.log("Seeding initial data...");

    // Seed venues
    const venues = [
      {
        name: "Brigade Road Event Ground",
        location: "Brigade Road, Bengaluru",
        maxCapacity: 15000,
        safeCapacity: 12000,
        venueType: "outdoor",
        facilities: ["parking", "medical_station", "security_booth", "restrooms"]
      },
      {
        name: "MG Road Stadium",
        location: "MG Road, Bengaluru",
        maxCapacity: 25000,
        safeCapacity: 20000,
        venueType: "stadium",
        facilities: ["parking", "medical_station", "security_booth", "restrooms", "food_court"]
      },
      {
        name: "Chinnaswamy Stadium",
        location: "Cubbon Park, Bengaluru",
        maxCapacity: 40000,
        safeCapacity: 35000,
        venueType: "stadium",
        facilities: ["parking", "medical_station", "security_booth", "restrooms", "food_court", "vip_lounge"]
      },
      {
        name: "Palace Grounds",
        location: "Palace Grounds, Bengaluru",
        maxCapacity: 50000,
        safeCapacity: 40000,
        venueType: "fairground",
        facilities: ["parking", "medical_station", "security_booth", "restrooms", "multiple_stages"]
      },
      {
        name: "Koramangala Community Hall",
        location: "Koramangala, Bengaluru",
        maxCapacity: 2000,
        safeCapacity: 1500,
        venueType: "indoor",
        facilities: ["parking", "medical_station", "restrooms", "air_conditioning"]
      }
    ];

    for (const venue of venues) {
      try {
        const existingVenue = await storage.getVenueByLocation(venue.location);
        if (!existingVenue) {
          await storage.createVenue(venue);
          console.log(`Created venue: ${venue.name}`);
        }
      } catch (error) {
        console.log(`Venue ${venue.name} already exists or error occurred`);
      }
    }

    // Seed safety advisories
    const safetyAdvisories = [
      {
        title: "Traffic Advisory for Brigade Road Events",
        description: "Heavy traffic expected on Brigade Road during events. Use alternate routes via MG Road or Richmond Circle.",
        type: "travel",
        severity: "info",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      {
        title: "Emergency Contact Information",
        description: "Police: 100, Ambulance: 108, Fire: 101. Event emergency helpline: +91-80-2222-3333",
        type: "emergency",
        severity: "info",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        title: "Weather Alert for Outdoor Events",
        description: "Monsoon season active. Outdoor events may be affected by rain. Check weather updates before attending.",
        type: "route",
        severity: "warning",
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      }
    ];

    for (const advisory of safetyAdvisories) {
      try {
        await storage.createSafetyAdvisory(advisory);
        console.log(`Created safety advisory: ${advisory.title}`);
      } catch (error) {
        console.log(`Safety advisory ${advisory.title} already exists or error occurred`);
      }
    }

    console.log("Initial data seeding completed successfully");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}

export async function createSampleEvents() {
  try {
    console.log("Creating sample events for testing...");

    const sampleEvents = [
      {
        title: "Rajinikanth Movie Premiere",
        eventType: "movie",
        date: new Date("2025-01-15"),
        startTime: "18:00",
        endTime: "21:00",
        location: "Brigade Road Event Ground",
        expectedAttendance: 8000,
        celebrityName: "Rajinikanth",
        specialRequirements: "VIP security, media coordination"
      },
      {
        title: "Virat Kohli Cricket Academy Launch",
        eventType: "sports",
        date: new Date("2025-01-20"),
        startTime: "16:00",
        endTime: "19:00",
        location: "Chinnaswamy Stadium",
        expectedAttendance: 25000,
        celebrityName: "Virat Kohli",
        specialRequirements: "Sports equipment display, youth coordination"
      },
      {
        title: "Karnataka Folk Music Festival",
        eventType: "cultural",
        date: new Date("2025-01-25"),
        startTime: "17:00",
        endTime: "22:00",
        location: "Palace Grounds",
        expectedAttendance: 15000,
        celebrityName: "Various Local Artists",
        specialRequirements: "Traditional stage setup, cultural protocols"
      }
    ];

    // Create with a dummy organizer ID for testing
    const dummyOrganizerId = "test-organizer-123";

    for (const event of sampleEvents) {
      try {
        const createdEvent = await storage.createEvent(event, dummyOrganizerId);
        console.log(`Created sample event: ${event.title} with ID: ${createdEvent.id}`);
        
        // Create AI analysis for the event
        const aiAnalysisData = {
          eventId: createdEvent.id,
          predictedCrowdMin: Math.floor(event.expectedAttendance * 0.8),
          predictedCrowdMax: Math.floor(event.expectedAttendance * 1.2),
          riskScore: event.eventType === 'movie' ? 65 : event.eventType === 'sports' ? 55 : 45,
          riskLevel: event.eventType === 'movie' ? 'medium' as const : 'low' as const,
          venueCapacity: 15000,
          trafficImpact: 'medium' as const,
          weatherConditions: 'clear',
          recommendations: [
            "Deploy adequate security personnel",
            "Set up emergency medical stations",
            "Monitor crowd density regularly",
            "Ensure clear evacuation routes"
          ]
        };
        
        await storage.createAIAnalysis(aiAnalysisData);
        console.log(`Created AI analysis for event: ${event.title}`);
        
      } catch (error) {
        console.log(`Sample event ${event.title} creation failed or already exists`);
      }
    }

    console.log("Sample events creation completed");
  } catch (error) {
    console.error("Error creating sample events:", error);
  }
}