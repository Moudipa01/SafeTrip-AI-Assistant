// ============================================
// SafeTrip AI Guardian - Safety Service
// ============================================

import { v4 as uuidv4 } from 'uuid';
import {
  Coordinates,
  SafetyAlert,
  AlertType,
  EmergencyEvent,
  MovementData,
  RiskLevel,
} from '../types';
import { analyzeMovement, classifyRisk } from '../ai/safety-engine';
import { getRiskLevelFromScore } from '../db/mock-data';

// In-memory store for demo (production: Redis + PostgreSQL)
let activeAlerts: SafetyAlert[] = [];
let emergencyEvents: EmergencyEvent[] = [];
let movementHistory: MovementData[] = [];

// ============================
// Alert Management
// ============================
export function createAlert(
  type: AlertType,
  severity: RiskLevel,
  message: string,
  description: string,
  location: Coordinates,
  autoTriggered: boolean = false
): SafetyAlert {
  const alert: SafetyAlert = {
    id: uuidv4(),
    type,
    severity,
    message,
    description,
    location,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    autoTriggered,
  };
  
  activeAlerts.push(alert);
  return alert;
}

export function getActiveAlerts(): SafetyAlert[] {
  return activeAlerts.filter(a => !a.acknowledged);
}

export function getAllAlerts(): SafetyAlert[] {
  return [...activeAlerts];
}

export function acknowledgeAlert(alertId: string): boolean {
  const alert = activeAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}

export function clearAlerts(): void {
  activeAlerts = [];
}

// ============================
// Emergency Event Management
// ============================
export function triggerSOS(
  location: Coordinates,
  userId: string = 'user-001'
): EmergencyEvent {
  const event: EmergencyEvent = {
    id: uuidv4(),
    userId,
    type: 'sos',
    location,
    timestamp: new Date().toISOString(),
    status: 'active',
    contacts_notified: ['112', '100'], // Emergency numbers
    notes: 'SOS triggered by user',
  };
  
  emergencyEvents.push(event);
  
  // Also create a high-priority alert
  createAlert(
    'sos_triggered',
    'critical',
    'SOS ACTIVATED',
    'Emergency SOS has been triggered. Location shared with emergency contacts.',
    location,
    false
  );
  
  return event;
}

export function getEmergencyEvents(): EmergencyEvent[] {
  return [...emergencyEvents];
}

export function resolveEmergency(eventId: string): boolean {
  const event = emergencyEvents.find(e => e.id === eventId);
  if (event) {
    event.status = 'resolved';
    return true;
  }
  return false;
}

// ============================
// Movement Tracking & Analysis
// ============================
export function recordMovement(data: MovementData): void {
  movementHistory.push(data);
  // Keep only last 100 entries
  if (movementHistory.length > 100) {
    movementHistory = movementHistory.slice(-100);
  }
}

export function getMovementHistory(): MovementData[] {
  return [...movementHistory];
}

export async function checkPassiveSafety(
  currentPosition: Coordinates,
  expectedRoute?: Coordinates[]
): Promise<SafetyAlert[]> {
  const newAlerts: SafetyAlert[] = [];
  
  // Convert movement history to analysis format
  const positions = movementHistory.map(m => ({
    lat: m.position.lat,
    lng: m.position.lng,
    timestamp: new Date(m.timestamp).getTime(),
  }));
  
  if (positions.length < 2) return newAlerts;
  
  const analysis = analyzeMovement(positions, expectedRoute);
  
  // Check for route deviation
  if (analysis.isDeviated) {
    newAlerts.push(
      createAlert(
        'route_deviation',
        'high',
        'Route Deviation Detected',
        `You have deviated ${Math.round(analysis.deviationDistance)}m from your planned route. Please verify you are on the correct path.`,
        currentPosition,
        true
      )
    );
  }
  
  // Check for inactivity
  if (analysis.isInactive) {
    const riskResult = await classifyRisk(currentPosition);
    const inactivitySeverity = riskResult.riskLevel === 'safe' ? 'moderate' : 'high';
    
    newAlerts.push(
      createAlert(
        'inactivity',
        inactivitySeverity,
        'Extended Inactivity Detected',
        `No movement detected for ${Math.round(analysis.inactivityMinutes)} minutes. ${
          riskResult.riskLevel !== 'safe' 
            ? 'You are in a ' + riskResult.riskLevel + ' risk area.' 
            : 'Please confirm you are safe.'
        }`,
        currentPosition,
        true
      )
    );
  }
  
  // Check for rapid movement anomaly
  if (analysis.isRapidMovement) {
    newAlerts.push(
      createAlert(
        'rapid_movement',
        'moderate',
        'Unusual Movement Pattern',
        `Speed of ${Math.round(analysis.currentSpeed)} km/h detected. This is unusual for pedestrian travel.`,
        currentPosition,
        true
      )
    );
  }
  
  // Check if entering a high-risk zone
  const riskCheck = await classifyRisk(currentPosition);
  if (riskCheck.score >= 60) {
    const existingHighRiskAlert = activeAlerts.find(
      a => a.type === 'high_risk_zone' && !a.acknowledged &&
      new Date().getTime() - new Date(a.timestamp).getTime() < 300000 // 5 min cooldown
    );
    
    if (!existingHighRiskAlert) {
      newAlerts.push(
        createAlert(
          'high_risk_zone',
          riskCheck.riskLevel,
          'Entering High-Risk Area',
          `You are entering an area with a risk score of ${riskCheck.score}/100. ${riskCheck.factors.map(f => f.description).join('. ')}`,
          currentPosition,
          true
        )
      );
    }
  }
  
  return newAlerts;
}
