
import { HfInference } from '@huggingface/inference';
import {
  Coordinates,
  RiskLevel,
  RiskFactor,
  RouteRecommendation,
  PersonalSafetyScore,
  SafetyZone,
  MapAction,
} from '../types';
import { Coordinates as BaseCoordinates } from '../types';
import { 
  MOCK_SAFETY_ZONES, 
  getTimeRiskMultiplier, 
  getRiskLevelFromScore 
} from '../db/mock-data';
import { loadSafetyZonesFromCSV } from '../db/csv-loader';
import { v4 as uuidv4 } from 'uuid';

export interface ChatResponse {
  response: string;
  suggestions: string[];
  mapAction?: MapAction;
}

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '');


export async function generateChatResponse(
  userMessage: string,
  context?: { location?: BaseCoordinates; safetyZones?: SafetyZone[] }
): Promise<ChatResponse> {
  const allZones = loadSafetyZonesFromCSV();
  
  // RAG: Find coordinates or cities mentioned in the message
  const msg = userMessage.toLowerCase();
  let relevantZones = context?.safetyZones || [];
  
  if (relevantZones.length === 0) {
    if (msg.includes('kolkata') || msg.includes('calcutta')) {
      relevantZones = allZones.filter(z => z.center.lat < 23 && z.center.lat > 22);
    } else if (msg.includes('bangalore') || msg.includes('blr') || msg.includes('bengaluru')) {
      relevantZones = allZones.filter(z => z.center.lat < 14 && z.center.lat > 12);
    } else if (msg.includes('delhi') || msg.includes('ncr')) {
      relevantZones = allZones.filter(z => z.center.lat < 29 && z.center.lat > 28);
    } else if (context?.location) {
      // Find zones near current location - expanded to 50km to cover entire city area
      relevantZones = allZones.filter(z => haversineDistance(context.location!, z.center) < 50);
    }
  }

  const systemPrompt = buildSafetySystemPrompt({ ...context, safetyZones: relevantZones });
  
  try {
    // Try Hugging Face Inference API
    if (process.env.HUGGINGFACE_API_KEY) {
      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        inputs: `<s>[INST] ${systemPrompt}\n\nUser: ${userMessage} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.15,
          return_full_text: false,
        },
      });
      const text = response.generated_text.trim();
      const cleaned = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\*\*/g, '');
      return {
        response: cleaned,
        suggestions: generateDynamicSuggestions(cleaned, userMessage)
      };
    }
    
    // Fallback to intelligent local response
    const localResp = generateLocalResponse(userMessage, { ...context, safetyZones: relevantZones });
    const cleanedLocal = localResp.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\*\*/g, '');
    
    return {
      response: cleanedLocal,
      suggestions: generateDynamicSuggestions(cleanedLocal, userMessage),
      mapAction: generateMapAction(userMessage, relevantZones)
    };
  } catch (error) {
    console.error('AI Chat Error:', error);
    const localResp = generateLocalResponse(userMessage, context);
    const cleaned = localResp.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/\*\*/g, '');
    return {
      response: cleaned,
      suggestions: generateDynamicSuggestions(cleaned, userMessage),
      mapAction: generateMapAction(userMessage, relevantZones)
    };
  }
}

function generateMapAction(msg: string, zones?: SafetyZone[]): MapAction | undefined {
  const m = msg.toLowerCase();
  const searchZones = zones || loadSafetyZonesFromCSV();

  if (m.includes('police') || m.includes('station')) {
    const police = searchZones.filter(z => z.factors.some(f => f.includes('POLICE')));
    if (police.length > 0) {
      return {
        type: 'zoom_pin',
        center: police[0].center,
        zoom: 15,
        points: police.map(z => ({ position: z.center, label: z.name, type: 'police' }))
      };
    }
  }

  if (m.includes('hotel') || m.includes('stay') || m.includes('accommodation') || m.includes('hostel')) {
    const hotels = searchZones.filter(z => z.factors.some(f => f.includes('HOTEL')));
    if (hotels.length > 0) {
      return {
        type: 'zoom_pin',
        center: hotels[0].center,
        zoom: 15,
        points: hotels.map(z => ({ position: z.center, label: z.name, type: 'hotel' }))
      };
    }
  }
  
  return undefined;
}

function generateDynamicSuggestions(aiResponse: string, userMessage: string): string[] {
  const msg = userMessage.toLowerCase();
  const resp = aiResponse.toLowerCase();
  const suggestions: string[] = [];
  const emergencyKeywords = ['sos', 'danger', 'scared', 'help', 'following', 'behind me', 'unsafe', 'threat', 'stalker', 'police', 'scary'];
  const isEmergency = emergencyKeywords.some(kw => msg.includes(kw) || resp.includes(kw));

  if (isEmergency) {
    suggestions.push('Trigger SOS alert now');
    suggestions.push('Call local emergency police');
    suggestions.push('Show nearest police station');
    suggestions.push('Share my live location');
  }

  if (msg.includes('kolkata') || resp.includes('park street') || resp.includes('howrah') || (msg.includes('follow') && !isEmergency)) {
    suggestions.push('Show me safe areas in Kolkata');
    suggestions.push('Safest route to Park Street');
  } else if (msg.includes('bangalore') || resp.includes('indiranagar') || resp.includes('silk board')) {
    suggestions.push('Safe zones in Bangalore');
    suggestions.push('Is Indiranagar safe at night');
  } else if (msg.includes('delhi') || resp.includes('connaught') || resp.includes('ncr')) {
    suggestions.push('Delhi safety zones');
    suggestions.push('Safest route in Delhi NCR');
  }

  if (resp.includes('route') || resp.includes('path')) {
    suggestions.push('Give me an alternative route');
    suggestions.push('What are the risks on this path');
  }

  if (resp.includes('night') || resp.includes('late')) {
    suggestions.push('I need a safe stay for tonight');
    suggestions.push('When is the safest time to travel');
  }

  if (resp.includes('sos') || resp.includes('danger')) {
    suggestions.push('Where is the nearest police station');
    suggestions.push('How do i alert my contacts');
  }

  // Default suggestions if none matched or too few
  if (suggestions.length < 3) {
    suggestions.push('Find safe hostels nearby');
    suggestions.push('Check my current safety score');
    suggestions.push('Show me nearby safe zones');
  }

  return Array.from(new Set(suggestions)).slice(0, 3);
}

function buildSafetySystemPrompt(context?: { location?: Coordinates; safetyZones?: SafetyZone[] }): string {
  let prompt = `Persona: You are a deeply caring and protective father guiding your daughter through the city. 
Tone: Wise, protective, calm, and serious. Use phrases like "listen to me", "stay safe my child", "I want you to be careful". 

### FORMATTING RULES:
- DO NOT USE EMOJIS.
- DO NOT USE MARKDOWN BOLDING (no double asterisks).
- Keep lists simple with dashes.

### YOUR KNOWLEDGE BASE (REAL-TIME DATA):
Use the following safety data to advise her:

${context?.safetyZones && context.safetyZones.length > 0 
  ? context.safetyZones.map(z => `- Area: ${z.name} | Risk: ${z.riskLevel} (${z.riskScore}/100) | Factors: ${z.factors.join(', ')}`).join('\n')
  : 'If data is missing, tell her to stick to well-lit main roads and call you if she feels uneasy.'}

### GUIDELINES:
- If she asks about an area, check the risk level. If it is moderate or high, be firm about the dangers and tell her exactly what to avoid.
- Always provide actionable advice to keep her safe.`;

  if (context?.location) {
    prompt += `\n\nUser's current location: ${context.location.lat}, ${context.location.lng}`;
  }

  return prompt;
}

function generateLocalResponse(
  userMessage: string, 
  context?: { location?: BaseCoordinates; safetyZones?: SafetyZone[] }
): string {
  const msg = userMessage.toLowerCase();
  
  // Filter zones to only include those in the current city
  let zones = loadSafetyZonesFromCSV();
  if (context?.location) {
    zones = zones.filter(z => haversineDistance(context.location!, z.center) < 100);
  }
  
  if (context?.safetyZones && context.safetyZones.length > 0) {
    zones = context.safetyZones;
  }

  const safestZone = zones.filter(z => z.riskLevel === 'safe').sort((a,b) => a.riskScore - b.riskScore)[0] || zones[0];
  const landmarkName = safestZone ? safestZone.name : 'the main roads';

  // 1. HOTEL/STAY DETECTION (High Priority to avoid 'show' or 'stay' being caught as danger)
  if (msg.includes('hostel') || msg.includes('hotel') || msg.includes('stay') || msg.includes('accommodation')) {
    return `I want you staying somewhere with good security. I suggest looking for places in areas like ${landmarkName} that have 24 hour security and cameras. 

Always check if they have a 24 hour desk and locked gates. Use the room safe for your things and never leave your door unlocked. I can highlight some safe hotels on the map for you.`;
  }

  // 2. EMERGENCY DETECTION
  const isDanger = 
    msg.includes('unsafe') || msg.includes('danger') || msg.includes('scared') || 
    msg.includes('help') || msg.includes('sos') || msg.includes('following') || 
    msg.includes('behind me') || msg.includes('follow') || msg.includes('threat') ||
    msg.includes('police') || msg.includes('emergency') || msg.includes('call') ||
    msg.includes('station');

  if (isDanger) {
    return `Stay calm and listen to my voice. I am here with you. Do not look back, keep walking toward a public place immediately. Is there a shop, a gas station, or a cafe nearby? Go inside right now. 

Call 112 immediately. This is the emergency number. I want you to speak to the police. Use the SOS button on your screen so your friends are alerted too. I can see you are near ${landmarkName}. I am monitoring your movement. Do not go into any quiet lanes. I need you to be safe.`;
  }

  if (msg.includes('safe') && (msg.includes('route') || msg.includes('way') || msg.includes('path'))) {
    return `Listen to me, I have looked at the paths available. I want you to take the route that goes through ${landmarkName}. It is much safer right now with a low risk score of ${safestZone?.riskScore || 18}. There are street lights and cameras all along this way, and you will be near safe areas. 

Stay on the main roads. Keep your phone charged and make sure your location is shared with me. Do not take any shortcuts through quiet areas. If it gets late, only walk where there are open shops. I just want you home safe.`;
  }
  
  if (msg.includes('safe') && (msg.includes('area') || msg.includes('zone') || msg.includes('neighborhood'))) {
    const safeZones = zones.filter(z => z.riskLevel === 'safe').slice(0, 3);
    const moderateZones = zones.filter(z => z.riskLevel === 'moderate').slice(0, 2);
    
    let resp = `I have checked the area for you. \n\n`;
    
    if (safeZones.length > 0) {
      resp += `These are the areas I feel comfortable with you being in:\n${safeZones.map(z => 
        `- ${z.name}: This area is generally secure. The factors are ${z.factors.join(', ')}.`
      ).join('\n')}\n\n`;
    }
    
    if (moderateZones.length > 0) {
      resp += `I am worried about these areas, so please be careful:\n${moderateZones.map(z => 
        `- ${z.name}: Use caution here because of ${z.factors.join(', ')}.`
      ).join('\n')}\n\n`;
    }
    
    resp += `The time right now is ${getTimeContext()} which changes things. Please stay near other people and let me know the moment you arrive.`;
    return resp;
  }
  
  if (msg.includes('night') || msg.includes('dark') || msg.includes('late')) {
    return `It is getting late and I want you to be very careful. Traveling at night is much riskier. Stick to the main roads and use a trusted cab app. Do not walk through any parks or underpasses, no matter how much time it saves. 

Keep your head up and stay in populated areas. The next few hours are the most critical. Should I find you the safest way home now?`;
  }

  return `I am here with you, my child. Tell me exactly what is happening or where you are headed. I want to make sure you get there safely. What are you worried about?`;
}

function getTimeContext(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 'Morning hours - Generally safe';
  if (hour >= 10 && hour < 17) return 'Daytime - Safest period';
  if (hour >= 17 && hour < 20) return 'Evening - Exercise normal caution';
  if (hour >= 20 && hour < 23) return 'Night - Stay alert, prefer main roads';
  return 'Late night - High caution advised, prefer known routes';
}

// ============================
// Safety Risk Classification
// ============================
export async function classifyRisk(
  location: Coordinates,
  timeOfDay?: string
): Promise<{ riskLevel: RiskLevel; score: number; factors: RiskFactor[] }> {
  const hour = timeOfDay ? parseInt(timeOfDay.split(':')[0]) : new Date().getHours();
  const timeMultiplier = getTimeRiskMultiplier(hour);
  
  // Find nearest safety zone
  const zones = loadSafetyZonesFromCSV();
  const nearestZone = findNearestZone(location, zones);
  
  // Base risk from zone
  let baseRisk = nearestZone ? nearestZone.riskScore : 50;
  
  // Apply time multiplier
  let adjustedRisk = Math.min(100, Math.round(baseRisk * timeMultiplier));
  
  const factors: RiskFactor[] = [];
  
  // Time factor
  if (timeMultiplier > 1.0) {
    factors.push({
      type: 'time_of_day',
      severity: timeMultiplier > 1.5 ? 'high' : 'moderate',
      description: `${hour >= 21 || hour < 6 ? 'Late night/early morning' : 'Evening'} hours increase risk`,
      score: Math.round((timeMultiplier - 0.5) * 30),
    });
  }
  
  // Zone factors
  if (nearestZone) {
    nearestZone.factors.forEach(f => {
      factors.push({
        type: 'area_characteristic',
        severity: nearestZone.riskLevel,
        description: f,
        score: nearestZone.riskScore,
      });
    });
  }
  
  // Crowd density (simulated)
  const crowdDensity = simulateCrowdDensity(hour);
  if (crowdDensity < 0.3) {
    adjustedRisk = Math.min(100, adjustedRisk + 15);
    factors.push({
      type: 'crowd_density',
      severity: 'moderate',
      description: 'Low crowd density - fewer people around',
      score: 15,
    });
  }
  
  return {
    riskLevel: getRiskLevelFromScore(adjustedRisk),
    score: adjustedRisk,
    factors,
  };
}

function findNearestZone(location: Coordinates, zonesArr?: SafetyZone[]): SafetyZone | null {
  let nearest: SafetyZone | null = null;
  let minDistance = Infinity;
  
  const zones = zonesArr || loadSafetyZonesFromCSV();
  
  for (const zone of zones) {
    const dist = haversineDistance(location, zone.center);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = zone;
    }
  }
  
  return nearest;
}

function simulateCrowdDensity(hour: number): number {
  if (hour >= 8 && hour < 20) return 0.7 + Math.random() * 0.3;
  if (hour >= 6 && hour < 8) return 0.3 + Math.random() * 0.3;
  if (hour >= 20 && hour < 23) return 0.4 + Math.random() * 0.3;
  return 0.1 + Math.random() * 0.2;
}

// ============================
// Route Recommendation Engine
// ============================
export async function generateRouteRecommendation(
  origin: Coordinates,
  destination: Coordinates,
  timeOfDay?: string
): Promise<RouteRecommendation> {
  const hour = timeOfDay ? parseInt(timeOfDay.split(':')[0]) : new Date().getHours();
  const timeMultiplier = getTimeRiskMultiplier(hour);
  
  // Generate waypoints (simulate a safe route by avoiding high-risk zones)
  const waypoints = generateSafeWaypoints(origin, destination);
  
  // Calculate risk for the route
  const routeRisks = await Promise.all(
    waypoints.map(wp => classifyRisk(wp, timeOfDay))
  );
  
  const avgRiskScore = Math.round(
    routeRisks.reduce((sum, r) => sum + r.score, 0) / routeRisks.length
  );
  
  const distance = calculateRouteDistance(origin, destination, waypoints);
  const estimatedTime = Math.round(distance / 30 * 60); // assume 30 km/h average
  
  const allFactors = routeRisks.flatMap(r => r.factors);
  const uniqueFactors = allFactors.filter((f, i, arr) => 
    arr.findIndex(x => x.description === f.description) === i
  ).slice(0, 5);
  
  const tips = generateSafetyTips(avgRiskScore, hour);
  
  return {
    id: uuidv4(),
    origin,
    destination,
    waypoints,
    riskScore: avgRiskScore,
    riskLevel: getRiskLevelFromScore(avgRiskScore),
    estimatedTime,
    distance: Math.round(distance * 10) / 10,
    explanation: generateRouteExplanation(avgRiskScore, hour, uniqueFactors),
    riskFactors: uniqueFactors,
    safetyTips: tips,
  };
}

function generateSafeWaypoints(origin: Coordinates, dest: Coordinates): Coordinates[] {
  const points: Coordinates[] = [];
  const steps = 5;
  
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    // Add slight deviation to simulate a real route
    const jitter = (Math.random() - 0.5) * 0.005;
    points.push({
      lat: origin.lat + (dest.lat - origin.lat) * t + jitter,
      lng: origin.lng + (dest.lng - origin.lng) * t + jitter,
    });
  }
  
  return points;
}

function calculateRouteDistance(origin: Coordinates, dest: Coordinates, waypoints: Coordinates[]): number {
  let total = 0;
  const allPoints = [origin, ...waypoints, dest];
  
  for (let i = 0; i < allPoints.length - 1; i++) {
    total += haversineDistance(allPoints[i], allPoints[i + 1]);
  }
  
  // Add 30% for road distance vs straight line
  return total * 1.3;
}

function generateRouteExplanation(riskScore: number, hour: number, factors: RiskFactor[]): string {
  const level = getRiskLevelFromScore(riskScore);
  const timeStr = hour >= 6 && hour < 18 ? 'daytime' : 'nighttime';
  
  let explanation = '';
  
  switch (level) {
    case 'safe':
      explanation = `This route is considered **safe** with a risk score of ${riskScore}/100. `;
      explanation += `The path passes through well-monitored areas with good lighting and regular patrols. `;
      break;
    case 'moderate':
      explanation = `This route has **moderate risk** with a score of ${riskScore}/100. `;
      explanation += `While generally safe, some sections require extra attention. `;
      break;
    case 'high':
      explanation = `⚠️ This route has **elevated risk** with a score of ${riskScore}/100. `;
      explanation += `Consider alternative routes or traveling during safer hours. `;
      break;
    case 'critical':
      explanation = `🚨 This route is **not recommended** with a risk score of ${riskScore}/100. `;
      explanation += `Please consider a significantly different route or postpone travel. `;
      break;
  }
  
  explanation += `Current time factor: ${timeStr} travel. `;
  
  if (factors.length > 0) {
    explanation += `Key factors: ${factors.map(f => f.description).join(', ')}.`;
  }
  
  return explanation;
}

function generateSafetyTips(riskScore: number, hour: number): string[] {
  const tips: string[] = [];
  
  tips.push('Share your live location with a trusted contact');
  
  if (hour >= 20 || hour < 6) {
    tips.push('Use well-lit main roads at night');
    tips.push('Avoid isolated areas and shortcuts');
    tips.push('Consider using a trusted ride-hailing service');
  }
  
  if (riskScore > 50) {
    tips.push('Stay alert and keep emergency numbers ready');
    tips.push('Travel with a companion if possible');
    tips.push('Keep your phone charged and easily accessible');
  }
  
  tips.push('Trust your instincts - if something feels wrong, leave the area');
  
  return tips;
}

// ============================
// Personal Safety Score Calculator
// ============================
export function calculatePersonalSafetyScore(
  routeRiskScore: number,
  timeOfDay: number,
  areaHistory: number[], // array of recent risk scores
): PersonalSafetyScore {
  const routeSafety = Math.max(0, 100 - routeRiskScore);
  const timeSafety = Math.max(0, 100 - (getTimeRiskMultiplier(timeOfDay) * 40));
  const areaSafety = areaHistory.length > 0 
    ? Math.max(0, 100 - (areaHistory.reduce((a, b) => a + b, 0) / areaHistory.length))
    : 75;
  const behaviorScore = 85; // baseline
  
  const overall = Math.round(
    (routeSafety * 0.35 + timeSafety * 0.25 + areaSafety * 0.25 + behaviorScore * 0.15)
  );
  
  return {
    overall,
    routeSafety: Math.round(routeSafety),
    timeSafety: Math.round(timeSafety),
    areaSafety: Math.round(areaSafety),
    behaviorScore,
    trend: overall > 70 ? 'improving' : overall > 50 ? 'stable' : 'declining',
    lastCalculated: new Date().toISOString(),
  };
}

// ============================
// Movement Analysis
// ============================
export function analyzeMovement(
  positions: { lat: number; lng: number; timestamp: number }[],
  expectedRoute?: Coordinates[]
): {
  isDeviated: boolean;
  isInactive: boolean;
  isRapidMovement: boolean;
  deviationDistance: number;
  inactivityMinutes: number;
  currentSpeed: number;
  alerts: string[];
} {
  const alerts: string[] = [];
  let isDeviated = false;
  let isInactive = false;
  let isRapidMovement = false;
  let deviationDistance = 0;
  let inactivityMinutes = 0;
  let currentSpeed = 0;

  if (positions.length < 2) {
    return { isDeviated, isInactive, isRapidMovement, deviationDistance, inactivityMinutes, currentSpeed, alerts };
  }

  // Calculate current speed
  const last = positions[positions.length - 1];
  const prev = positions[positions.length - 2];
  const timeDiff = (last.timestamp - prev.timestamp) / 1000 / 3600; // hours
  const distKm = haversineDistance(
    { lat: prev.lat, lng: prev.lng },
    { lat: last.lat, lng: last.lng }
  );
  currentSpeed = timeDiff > 0 ? distKm / timeDiff : 0;

  // Check for rapid movement (> 120 km/h suggests vehicle or anomaly)
  if (currentSpeed > 120) {
    isRapidMovement = true;
    alerts.push('Rapid movement detected - unusual speed pattern');
  }

  // Check for inactivity
  const now = Date.now();
  const lastMovement = last.timestamp;
  inactivityMinutes = (now - lastMovement) / 1000 / 60;
  
  if (inactivityMinutes > 10) {
    isInactive = true;
    alerts.push(`No movement detected for ${Math.round(inactivityMinutes)} minutes`);
  }

  // Check route deviation
  if (expectedRoute && expectedRoute.length > 0) {
    const currentPos = { lat: last.lat, lng: last.lng };
    let minDeviation = Infinity;
    
    for (const routePoint of expectedRoute) {
      const dev = haversineDistance(currentPos, routePoint) * 1000; // meters
      minDeviation = Math.min(minDeviation, dev);
    }
    
    deviationDistance = minDeviation;
    if (minDeviation > 200) { // 200m threshold
      isDeviated = true;
      alerts.push(`Route deviation of ${Math.round(minDeviation)}m detected`);
    }
  }

  return { isDeviated, isInactive, isRapidMovement, deviationDistance, inactivityMinutes, currentSpeed, alerts };
}

// ============================
// Utility Functions
// ============================
export function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
