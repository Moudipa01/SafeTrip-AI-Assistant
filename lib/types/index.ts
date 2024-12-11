// ============================================
// SafeTrip AI Guardian - Core Type Definitions
// ============================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  name: string;
  coordinates: Coordinates;
  safetyScore: number;
  riskLevel: RiskLevel;
  description?: string;
  tags?: string[];
}

export type RiskLevel = 'safe' | 'moderate' | 'high' | 'critical';

export interface SafetyZone {
  id: string;
  name: string;
  center: Coordinates;
  radius: number; // in meters
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  factors: string[];
  lastUpdated: string;
  reportCount: number;
}

export interface RouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  timeOfDay?: string;
  preferSafety?: boolean;
}

export interface RouteRecommendation {
  id: string;
  origin: Coordinates;
  destination: Coordinates;
  waypoints: Coordinates[];
  riskScore: number;
  riskLevel: RiskLevel;
  estimatedTime: number; // minutes
  distance: number; // km
  explanation: string;
  riskFactors: RiskFactor[];
  safetyTips: string[];
}

export interface RiskFactor {
  type: string;
  severity: RiskLevel;
  description: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    location?: Coordinates;
    safetyAlert?: boolean;
    routeId?: string;
  };
}

export interface SafetyAlert {
  id: string;
  type: AlertType;
  severity: RiskLevel;
  message: string;
  description: string;
  location: Coordinates;
  timestamp: string;
  acknowledged: boolean;
  autoTriggered: boolean;
}

export type AlertType = 
  | 'route_deviation'
  | 'inactivity'
  | 'high_risk_zone'
  | 'rapid_movement'
  | 'sos_triggered'
  | 'predictive_warning';

export interface EmergencyEvent {
  id: string;
  userId: string;
  type: 'sos' | 'auto_alert' | 'manual';
  location: Coordinates;
  timestamp: string;
  status: 'active' | 'resolved' | 'escalated';
  contacts_notified: string[];
  notes?: string;
}

export interface UserSafetyProfile {
  userId: string;
  safetyScore: number; // 0-100
  travelHistory: TravelRecord[];
  trustedContacts: TrustedContact[];
  preferences: SafetyPreferences;
}

export interface TravelRecord {
  id: string;
  startTime: string;
  endTime?: string;
  route: Coordinates[];
  averageRiskScore: number;
  alerts: string[];
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  notifyOnEmergency: boolean;
}

export interface SafetyPreferences {
  passiveModeEnabled: boolean;
  inactivityTimeout: number; // minutes
  routeDeviationThreshold: number; // meters
  autoSosEnabled: boolean;
  voiceInputEnabled: boolean;
  backgroundTrackingEnabled: boolean;
}

export interface MovementData {
  timestamp: string;
  position: Coordinates;
  speed: number; // km/h
  heading: number; // degrees
  accuracy: number; // meters
}

export interface HeatmapData {
  coordinates: Coordinates;
  intensity: number; // 0-1
  riskLevel: RiskLevel;
  reportCount: number;
}

export interface PersonalSafetyScore {
  overall: number;
  routeSafety: number;
  timeSafety: number;
  areaSafety: number;
  behaviorScore: number;
  trend: 'improving' | 'stable' | 'declining';
  lastCalculated: string;
}

export interface MapAction {
  type: 'zoom_pin' | 'clear';
  center?: Coordinates;
  zoom?: number;
  points?: { position: Coordinates; label: string; type: 'police' | 'hotel' | 'safe_zone' }[];
}
