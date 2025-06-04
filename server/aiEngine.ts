import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CrowdAnalysisData {
  eventType: string;
  expectedAttendance: number;
  celebrityName: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  specialRequirements?: string;
}

export interface AIAnalysisResult {
  predictedCrowdMin: number;
  predictedCrowdMax: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  venueCapacity: number;
  trafficImpact: 'low' | 'medium' | 'high';
  weatherConditions: string;
  recommendations: string[];
  timeSlotRecommendations: string[];
  socialMediaTrends: string[];
  crowdBehaviorPrediction: string;
  emergencyPreparedness: string[];
  transportationLoad: string;
}

export async function generateAIAnalysis(eventData: CrowdAnalysisData): Promise<AIAnalysisResult> {
  try {
    const prompt = `
    Analyze this event for crowd safety and provide comprehensive recommendations:
    
    Event Details:
    - Type: ${eventData.eventType}
    - Expected Attendance: ${eventData.expectedAttendance}
    - Celebrity/VIP: ${eventData.celebrityName}
    - Location: ${eventData.location}
    - Date: ${eventData.date}
    - Time: ${eventData.startTime} - ${eventData.endTime}
    - Special Requirements: ${eventData.specialRequirements || 'None'}
    
    Please provide a detailed analysis in JSON format with the following structure:
    {
      "predictedCrowdMin": number,
      "predictedCrowdMax": number,
      "riskScore": number (0-100),
      "riskLevel": "low|medium|high",
      "venueCapacity": number,
      "trafficImpact": "low|medium|high",
      "weatherConditions": "clear|cloudy|rainy|stormy",
      "recommendations": ["recommendation1", "recommendation2", ...],
      "timeSlotRecommendations": ["suggestion1", "suggestion2", ...],
      "socialMediaTrends": ["trend1", "trend2", ...],
      "crowdBehaviorPrediction": "detailed prediction text",
      "emergencyPreparedness": ["measure1", "measure2", ...],
      "transportationLoad": "expected impact description"
    }
    
    Consider factors like:
    - Celebrity popularity and fanbase behavior
    - Event type and typical crowd patterns
    - Location accessibility and capacity
    - Time of day and day of week
    - Historical crowd data for similar events
    - Traffic and transportation impact
    - Weather considerations
    - Emergency response requirements
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert crowd safety analyst specializing in event risk assessment and crowd management. Provide detailed, actionable analysis based on the event data provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and sanitize the response
    return {
      predictedCrowdMin: analysis.predictedCrowdMin || Math.floor(eventData.expectedAttendance * 0.8),
      predictedCrowdMax: analysis.predictedCrowdMax || Math.floor(eventData.expectedAttendance * 1.2),
      riskScore: Math.min(100, Math.max(0, analysis.riskScore || 50)),
      riskLevel: ['low', 'medium', 'high'].includes(analysis.riskLevel) ? analysis.riskLevel : 'medium',
      venueCapacity: analysis.venueCapacity || 10000,
      trafficImpact: ['low', 'medium', 'high'].includes(analysis.trafficImpact) ? analysis.trafficImpact : 'medium',
      weatherConditions: analysis.weatherConditions || 'clear',
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      timeSlotRecommendations: Array.isArray(analysis.timeSlotRecommendations) ? analysis.timeSlotRecommendations : [],
      socialMediaTrends: Array.isArray(analysis.socialMediaTrends) ? analysis.socialMediaTrends : [],
      crowdBehaviorPrediction: analysis.crowdBehaviorPrediction || 'Normal crowd behavior expected',
      emergencyPreparedness: Array.isArray(analysis.emergencyPreparedness) ? analysis.emergencyPreparedness : [],
      transportationLoad: analysis.transportationLoad || 'Moderate transportation impact expected'
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Fallback to rule-based analysis
    return generateFallbackAnalysis(eventData);
  }
}

export async function generateChatbotResponse(query: string, context?: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for the CrowdSafe platform. You help users with questions about event safety, crowd management, and platform features. Keep responses concise but informative. Always prioritize safety."
        },
        {
          role: "user",
          content: context ? `Context: ${context}\n\nQuestion: ${query}` : query
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your request. Please try again.";
  } catch (error) {
    console.error('Chatbot Error:', error);
    return "I'm currently experiencing technical difficulties. Please contact support for assistance.";
  }
}

function generateFallbackAnalysis(eventData: CrowdAnalysisData): AIAnalysisResult {
  const baseAttendance = eventData.expectedAttendance;
  
  // Event type multipliers
  const eventMultipliers: Record<string, number> = {
    concert: 1.3,
    movie: 1.1,
    political: 1.5,
    sports: 1.2,
    cultural: 1.0,
    other: 1.0
  };
  
  const multiplier = eventMultipliers[eventData.eventType] || 1.0;
  const predictedMin = Math.floor(baseAttendance * multiplier * 0.8);
  const predictedMax = Math.floor(baseAttendance * multiplier * 1.2);
  
  // Calculate risk score
  let riskScore = 20; // Base risk
  if (predictedMax > 20000) riskScore += 40;
  else if (predictedMax > 10000) riskScore += 25;
  else if (predictedMax > 5000) riskScore += 15;
  
  // Add event type risk
  const eventRisk: Record<string, number> = {
    concert: 20,
    political: 30,
    sports: 15,
    movie: 10,
    cultural: 5,
    other: 10
  };
  riskScore += eventRisk[eventData.eventType] || 10;
  
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  
  return {
    predictedCrowdMin: predictedMin,
    predictedCrowdMax: predictedMax,
    riskScore: Math.min(100, riskScore),
    riskLevel,
    venueCapacity: 10000,
    trafficImpact: riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
    weatherConditions: 'clear',
    recommendations: [
      'Deploy adequate security personnel',
      'Set up emergency medical stations',
      'Monitor crowd density',
      'Ensure clear evacuation routes'
    ],
    timeSlotRecommendations: [
      'Consider afternoon timing to avoid evening rush',
      'Weekend slots may attract larger crowds'
    ],
    socialMediaTrends: [
      'Monitor social media for crowd sentiment',
      'Track hashtags related to the event'
    ],
    crowdBehaviorPrediction: 'Normal crowd behavior expected with standard security measures',
    emergencyPreparedness: [
      'Emergency medical team on standby',
      'Fire department coordination',
      'Police deployment plan'
    ],
    transportationLoad: 'Moderate impact on local transportation expected'
  };
}

// Legacy function exports for backward compatibility
export function generateCrowdPrediction(eventData: any): { min: number; max: number } {
  const multiplier = eventData.eventType === 'concert' ? 1.3 : eventData.eventType === 'political' ? 1.5 : 1.0;
  const base = eventData.expectedAttendance * multiplier;
  return { min: Math.floor(base * 0.8), max: Math.floor(base * 1.2) };
}

export function calculateRiskScore(crowdPrediction: { min: number; max: number }, eventData: any): number {
  let score = 20;
  const avg = (crowdPrediction.min + crowdPrediction.max) / 2;
  if (avg > 20000) score += 40;
  else if (avg > 10000) score += 25;
  else if (avg > 5000) score += 15;
  
  const eventRisk = { concert: 20, political: 30, sports: 15, movie: 10, cultural: 5 }[eventData.eventType] || 10;
  return Math.min(100, score + eventRisk);
}

export function generateRecommendations(riskScore: number, crowdPrediction: { min: number; max: number }, venueCapacity: number): string[] {
  const recommendations = [];
  if (riskScore >= 80) {
    recommendations.push('Deploy additional 25+ officers for crowd control');
    recommendations.push('Set up 3+ emergency medical stations');
    recommendations.push('Implement traffic diversions on major routes');
  } else if (riskScore >= 50) {
    recommendations.push('Deploy additional 15 officers for crowd control');
    recommendations.push('Set up 2 emergency medical stations');
  } else {
    recommendations.push('Deploy standard security personnel');
    recommendations.push('Set up 1 emergency medical station');
  }
  return recommendations;
}