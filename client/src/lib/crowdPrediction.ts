export interface CrowdPrediction {
  min: number;
  max: number;
  confidence: number;
}

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
}

export interface EventData {
  eventType: string;
  expectedAttendance: number;
  date: string;
  startTime: string;
  location: string;
  celebrityName: string;
}

export class CrowdPredictionEngine {
  private static readonly EVENT_TYPE_MULTIPLIERS: Record<string, number> = {
    concert: 1.3,
    movie: 1.1,
    political: 1.5,
    sports: 1.2,
    cultural: 1.0,
    other: 1.0,
  };

  private static readonly CELEBRITY_IMPACT_FACTORS: Record<string, number> = {
    // High-impact celebrities (would be replaced with actual celebrity database)
    rajinikanth: 2.0,
    virat: 1.8,
    'cm of karnataka': 1.9,
    default: 1.0,
  };

  static predictCrowdSize(eventData: EventData): CrowdPrediction {
    let basePrediction = eventData.expectedAttendance;
    
    // Apply event type multiplier
    const eventMultiplier = this.EVENT_TYPE_MULTIPLIERS[eventData.eventType] || 1.0;
    basePrediction *= eventMultiplier;
    
    // Apply celebrity impact
    const celebrityKey = eventData.celebrityName.toLowerCase();
    const celebrityMultiplier = this.CELEBRITY_IMPACT_FACTORS[celebrityKey] || 
                               this.CELEBRITY_IMPACT_FACTORS.default;
    basePrediction *= celebrityMultiplier;
    
    // Apply time-based factors
    const hour = parseInt(eventData.startTime.split(':')[0]);
    const timeMultiplier = hour >= 18 ? 1.2 : hour >= 15 ? 1.1 : 1.0;
    basePrediction *= timeMultiplier;
    
    // Apply date-based factors (weekends are busier)
    const eventDate = new Date(eventData.date);
    const dayOfWeek = eventDate.getDay();
    const dateMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0;
    basePrediction *= dateMultiplier;
    
    // Calculate variance (typically 15-25% for crowd predictions)
    const variance = 0.2;
    const min = Math.floor(basePrediction * (1 - variance));
    const max = Math.floor(basePrediction * (1 + variance));
    
    // Calculate confidence based on available data
    const confidence = this.calculateConfidence(eventData);
    
    return { min, max, confidence };
  }

  static assessRisk(prediction: CrowdPrediction, eventData: EventData, venueCapacity: number = 10000): RiskAssessment {
    let riskScore = 0;
    const factors: string[] = [];
    
    // Crowd size risk
    const avgCrowd = (prediction.min + prediction.max) / 2;
    const capacityRatio = avgCrowd / venueCapacity;
    
    if (capacityRatio > 0.9) {
      riskScore += 35;
      factors.push('Venue approaching maximum capacity');
    } else if (capacityRatio > 0.75) {
      riskScore += 25;
      factors.push('High venue utilization');
    } else if (capacityRatio > 0.5) {
      riskScore += 15;
      factors.push('Moderate venue utilization');
    }
    
    // Absolute crowd size risk
    if (avgCrowd > 20000) {
      riskScore += 25;
      factors.push('Very large crowd expected');
    } else if (avgCrowd > 10000) {
      riskScore += 15;
      factors.push('Large crowd expected');
    } else if (avgCrowd > 5000) {
      riskScore += 10;
      factors.push('Medium-sized crowd expected');
    }
    
    // Event type risk
    const eventTypeRisk: Record<string, number> = {
      concert: 20,
      political: 25,
      sports: 15,
      movie: 10,
      cultural: 5,
      other: 10,
    };
    
    const typeRisk = eventTypeRisk[eventData.eventType] || 10;
    riskScore += typeRisk;
    factors.push(`${eventData.eventType} events carry elevated risk`);
    
    // Time-based risk
    const hour = parseInt(eventData.startTime.split(':')[0]);
    if (hour >= 18) {
      riskScore += 15;
      factors.push('Evening event increases crowd density risk');
    } else if (hour >= 15) {
      riskScore += 10;
      factors.push('Afternoon timing may affect traffic flow');
    }
    
    // Date-based risk
    const eventDate = new Date(eventData.date);
    const dayOfWeek = eventDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      riskScore += 10;
      factors.push('Weekend events typically draw larger crowds');
    }
    
    // Weather impact (mock - would integrate with weather API)
    // Assuming clear weather reduces risk slightly
    riskScore -= 5;
    factors.push('Clear weather conditions expected');
    
    // Ensure score is within bounds
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    // Determine risk level
    let level: 'low' | 'medium' | 'high';
    if (riskScore >= 70) {
      level = 'high';
    } else if (riskScore >= 40) {
      level = 'medium';
    } else {
      level = 'low';
    }
    
    return { score: riskScore, level, factors };
  }

  private static calculateConfidence(eventData: EventData): number {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence for well-known event types
    if (['concert', 'sports', 'political'].includes(eventData.eventType)) {
      confidence += 0.1;
    }
    
    // Higher confidence if we have celebrity data
    const celebrityKey = eventData.celebrityName.toLowerCase();
    if (this.CELEBRITY_IMPACT_FACTORS[celebrityKey]) {
      confidence += 0.15;
    }
    
    // Confidence decreases for events too far in the future
    const eventDate = new Date(eventData.date);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent > 30) {
      confidence -= 0.2;
    } else if (daysUntilEvent > 14) {
      confidence -= 0.1;
    }
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  static generateRecommendations(riskAssessment: RiskAssessment, prediction: CrowdPrediction, venueCapacity: number): string[] {
    const recommendations: string[] = [];
    
    if (riskAssessment.level === 'high') {
      recommendations.push('Deploy additional 25+ officers for crowd control');
      recommendations.push('Set up 3+ emergency medical stations');
      recommendations.push('Implement traffic diversions on major routes');
      recommendations.push('Consider limiting entry after 85% capacity');
      recommendations.push('Deploy emergency response teams on standby');
      recommendations.push('Coordinate with nearby hospitals for emergency preparedness');
    } else if (riskAssessment.level === 'medium') {
      recommendations.push('Deploy additional 15+ officers for crowd control');
      recommendations.push('Set up 2 emergency medical stations');
      recommendations.push('Monitor traffic flow and prepare diversions if needed');
      recommendations.push('Consider limiting entry after 90% capacity');
      recommendations.push('Establish clear evacuation routes');
    } else {
      recommendations.push('Deploy standard security personnel');
      recommendations.push('Set up 1 emergency medical station');
      recommendations.push('Monitor crowd density regularly');
      recommendations.push('Ensure clear emergency exit signage');
    }
    
    // Capacity-specific recommendations
    const avgCrowd = (prediction.min + prediction.max) / 2;
    if (avgCrowd > venueCapacity * 0.85) {
      recommendations.push('Implement strict entry controls due to high capacity utilization');
    }
    
    return recommendations;
  }
}
