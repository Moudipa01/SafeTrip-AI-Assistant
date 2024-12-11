// ============================================
// SafeTrip AI Guardian - Mock Datasets
// ============================================

import { SafetyZone, HeatmapData, Location, TrustedContact, RiskLevel } from '../types';

// Mock Safety Zones (Delhi NCR region as default)
export const MOCK_SAFETY_ZONES: SafetyZone[] = [
  {
    id: 'zone-001',
    name: 'Connaught Place',
    center: { lat: 28.6315, lng: 77.2167 },
    radius: 500,
    riskLevel: 'safe',
    riskScore: 15,
    factors: ['Well-lit area', 'High police presence', 'CCTV coverage', 'Crowded marketplace'],
    lastUpdated: '2026-04-14T10:00:00Z',
    reportCount: 245,
  },
  {
    id: 'zone-002',
    name: 'India Gate Area',
    center: { lat: 28.6129, lng: 77.2295 },
    radius: 800,
    riskLevel: 'safe',
    riskScore: 10,
    factors: ['Tourist area', 'Military presence', 'Open space', 'Well-maintained'],
    lastUpdated: '2026-04-14T09:00:00Z',
    reportCount: 312,
  },
  {
    id: 'zone-003',
    name: 'Chandni Chowk',
    center: { lat: 28.6506, lng: 77.2303 },
    radius: 600,
    riskLevel: 'moderate',
    riskScore: 45,
    factors: ['Crowded narrow lanes', 'Pickpocket reports', 'Traffic congestion', 'Limited emergency access'],
    lastUpdated: '2026-04-14T08:00:00Z',
    reportCount: 189,
  },
  {
    id: 'zone-004',
    name: 'Paharganj',
    center: { lat: 28.6442, lng: 77.2125 },
    radius: 400,
    riskLevel: 'moderate',
    riskScore: 55,
    factors: ['Tourist area with scams', 'Poor lighting at night', 'Narrow streets', 'Mixed reports'],
    lastUpdated: '2026-04-14T07:00:00Z',
    reportCount: 156,
  },
  {
    id: 'zone-005',
    name: 'Dwarka Sector 21',
    center: { lat: 28.5522, lng: 77.0581 },
    radius: 700,
    riskLevel: 'safe',
    riskScore: 12,
    factors: ['Planned colony', 'Good street lighting', 'Metro connectivity', 'Regular patrols'],
    lastUpdated: '2026-04-14T06:00:00Z',
    reportCount: 98,
  },
  {
    id: 'zone-006',
    name: 'Yamuna Bank Area',
    center: { lat: 28.6227, lng: 77.2583 },
    radius: 500,
    riskLevel: 'high',
    riskScore: 75,
    factors: ['Isolated area', 'Poor lighting', 'Low police presence', 'Flood-prone region'],
    lastUpdated: '2026-04-14T05:00:00Z',
    reportCount: 67,
  },
  {
    id: 'zone-007',
    name: 'Sarojini Nagar Market',
    center: { lat: 28.5744, lng: 77.1992 },
    radius: 400,
    riskLevel: 'moderate',
    riskScore: 40,
    factors: ['Very crowded', 'Pickpocket risk', 'Good during day', 'Risky at late night'],
    lastUpdated: '2026-04-14T04:00:00Z',
    reportCount: 201,
  },
  {
    id: 'zone-008',
    name: 'South Extension',
    center: { lat: 28.5713, lng: 77.2213 },
    radius: 500,
    riskLevel: 'safe',
    riskScore: 18,
    factors: ['Upscale market', 'Good security', 'Well-lit', 'Regular police patrol'],
    lastUpdated: '2026-04-14T03:00:00Z',
    reportCount: 134,
  },
  {
    id: 'zone-009',
    name: 'Isolated Industrial Zone',
    center: { lat: 28.6800, lng: 77.1500 },
    radius: 600,
    riskLevel: 'critical',
    riskScore: 88,
    factors: ['Deserted at night', 'No street lights', 'No CCTV', 'Multiple incident reports'],
    lastUpdated: '2026-04-14T02:00:00Z',
    reportCount: 42,
  },
  {
    id: 'zone-010',
    name: 'Hauz Khas Village',
    center: { lat: 28.5494, lng: 77.2001 },
    radius: 350,
    riskLevel: 'safe',
    riskScore: 20,
    factors: ['Popular nightlife', 'Tourist friendly', 'Good lighting', 'Security cameras'],
    lastUpdated: '2026-04-14T01:00:00Z',
    reportCount: 178,
  },
  {
    id: 'zone-011',
    name: 'Karol Bagh',
    center: { lat: 28.6514, lng: 77.1907 },
    radius: 500,
    riskLevel: 'moderate',
    riskScore: 42,
    factors: ['Shopping area', 'Moderate traffic', 'Some reports after dark', 'Crowded markets'],
    lastUpdated: '2026-04-13T23:00:00Z',
    reportCount: 145,
  },
  {
    id: 'zone-012',
    name: 'Vasant Kunj',
    center: { lat: 28.5199, lng: 77.1590 },
    radius: 800,
    riskLevel: 'safe',
    riskScore: 14,
    factors: ['Residential area', 'Malls nearby', 'Good infrastructure', 'Gated communities'],
    lastUpdated: '2026-04-13T22:00:00Z',
    reportCount: 89,
  },
  // Kolkata Zones
  {
    id: 'zone-013',
    name: 'Park Street',
    center: { lat: 22.5529, lng: 88.3519 },
    radius: 400,
    riskLevel: 'safe',
    riskScore: 18,
    factors: ['Busy commercial street', 'Well-lit', 'Security presence', 'Upscale restaurants'],
    lastUpdated: '2026-04-15T00:00:00Z',
    reportCount: 412,
  },
  {
    id: 'zone-014',
    name: 'Howrah Station Area',
    center: { lat: 22.5836, lng: 88.3415 },
    radius: 700,
    riskLevel: 'moderate',
    riskScore: 48,
    factors: ['Extreme crowds', 'Theft reports', 'Confusing layout', 'High traffic'],
    lastUpdated: '2026-04-15T00:00:00Z',
    reportCount: 856,
  },
  {
    id: 'zone-015',
    name: 'Salt Lake Sector V',
    center: { lat: 22.5735, lng: 88.4331 },
    radius: 800,
    riskLevel: 'safe',
    riskScore: 15,
    factors: ['IT Hub', 'Good infrastructure', 'CCTV monitoring', 'Safe for women'],
    lastUpdated: '2026-04-15T00:00:00Z',
    reportCount: 224,
  },
  // Bangalore Zones
  {
    id: 'zone-016',
    name: 'Indiranagar 100ft Rd',
    center: { lat: 12.9719, lng: 77.6412 },
    radius: 500,
    riskLevel: 'safe',
    riskScore: 12,
    factors: ['Popular nightlife', 'Very well-lit', 'Constant movement', 'Secure area'],
    lastUpdated: '2026-04-15T00:00:00Z',
    reportCount: 567,
  },
  {
    id: 'zone-017',
    name: 'Silk Board Junction',
    center: { lat: 12.9176, lng: 77.6233 },
    radius: 600,
    riskLevel: 'moderate',
    riskScore: 42,
    factors: ['Traffic congestion', 'Air pollution', 'Pedestrian safety risk', 'Active at all hours'],
    lastUpdated: '2026-04-15T00:00:00Z',
    reportCount: 942,
  },
];

// Mock Heatmap Data
export const MOCK_HEATMAP_DATA: HeatmapData[] = [
  // Safe zones (green)
  { coordinates: { lat: 28.6315, lng: 77.2167 }, intensity: 0.2, riskLevel: 'safe', reportCount: 245 },
  { coordinates: { lat: 28.6129, lng: 77.2295 }, intensity: 0.1, riskLevel: 'safe', reportCount: 312 },
  { coordinates: { lat: 28.5522, lng: 77.0581 }, intensity: 0.15, riskLevel: 'safe', reportCount: 98 },
  { coordinates: { lat: 28.5713, lng: 77.2213 }, intensity: 0.18, riskLevel: 'safe', reportCount: 134 },
  { coordinates: { lat: 28.5494, lng: 77.2001 }, intensity: 0.2, riskLevel: 'safe', reportCount: 178 },
  { coordinates: { lat: 28.5199, lng: 77.1590 }, intensity: 0.14, riskLevel: 'safe', reportCount: 89 },
  // Moderate zones (yellow/orange)
  { coordinates: { lat: 28.6506, lng: 77.2303 }, intensity: 0.5, riskLevel: 'moderate', reportCount: 189 },
  { coordinates: { lat: 28.6442, lng: 77.2125 }, intensity: 0.55, riskLevel: 'moderate', reportCount: 156 },
  { coordinates: { lat: 28.5744, lng: 77.1992 }, intensity: 0.45, riskLevel: 'moderate', reportCount: 201 },
  { coordinates: { lat: 28.6514, lng: 77.1907 }, intensity: 0.48, riskLevel: 'moderate', reportCount: 145 },
  // High risk zones (red)
  { coordinates: { lat: 28.6227, lng: 77.2583 }, intensity: 0.8, riskLevel: 'high', reportCount: 67 },
  { coordinates: { lat: 28.6800, lng: 77.1500 }, intensity: 0.95, riskLevel: 'critical', reportCount: 42 },
  // Additional scattered data points
  { coordinates: { lat: 28.6100, lng: 77.2100 }, intensity: 0.3, riskLevel: 'safe', reportCount: 56 },
  { coordinates: { lat: 28.6350, lng: 77.2400 }, intensity: 0.35, riskLevel: 'moderate', reportCount: 78 },
  { coordinates: { lat: 28.5900, lng: 77.1800 }, intensity: 0.25, riskLevel: 'safe', reportCount: 45 },
  { coordinates: { lat: 28.6600, lng: 77.2200 }, intensity: 0.65, riskLevel: 'high', reportCount: 34 },
  { coordinates: { lat: 28.5800, lng: 77.2500 }, intensity: 0.22, riskLevel: 'safe', reportCount: 67 },
  { coordinates: { lat: 28.6400, lng: 77.1800 }, intensity: 0.58, riskLevel: 'moderate', reportCount: 91 },
  // Kolkata Heatmap
  { coordinates: { lat: 22.5529, lng: 88.3519 }, intensity: 0.2, riskLevel: 'safe', reportCount: 412 },
  { coordinates: { lat: 22.5836, lng: 88.3415 }, intensity: 0.6, riskLevel: 'moderate', reportCount: 856 },
  { coordinates: { lat: 22.5735, lng: 88.4331 }, intensity: 0.15, riskLevel: 'safe', reportCount: 224 },
  { coordinates: { lat: 22.5700, lng: 88.3600 }, intensity: 0.35, riskLevel: 'moderate', reportCount: 150 },
  // Bangalore Heatmap
  { coordinates: { lat: 12.9719, lng: 77.6412 }, intensity: 0.1, riskLevel: 'safe', reportCount: 567 },
  { coordinates: { lat: 12.9176, lng: 77.6233 }, intensity: 0.4, riskLevel: 'moderate', reportCount: 942 },
  { coordinates: { lat: 13.0067, lng: 77.5300 }, intensity: 0.85, riskLevel: 'high', reportCount: 120 },
];

// Mock Locations for semantic search
export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc-001',
    name: 'Safe Haven Hostel',
    coordinates: { lat: 28.6315, lng: 77.2167 },
    safetyScore: 92,
    riskLevel: 'safe',
    description: 'Well-reviewed hostel in Connaught Place with 24/7 security and CCTV',
    tags: ['hostel', 'accommodation', 'safe', 'central'],
  },
  {
    id: 'loc-002',
    name: 'Metro Station - Rajiv Chowk',
    coordinates: { lat: 28.6328, lng: 77.2197 },
    safetyScore: 88,
    riskLevel: 'safe',
    description: 'Major metro interchange with security checks and CCTV coverage',
    tags: ['transport', 'metro', 'safe', 'connected'],
  },
  {
    id: 'loc-003',
    name: 'City Hospital Emergency',
    coordinates: { lat: 28.6200, lng: 77.2100 },
    safetyScore: 95,
    riskLevel: 'safe',
    description: '24/7 emergency medical facility with ambulance service',
    tags: ['hospital', 'emergency', 'medical', 'safe'],
  },
  {
    id: 'loc-004',
    name: 'Tourist Police Station',
    coordinates: { lat: 28.6135, lng: 77.2290 },
    safetyScore: 98,
    riskLevel: 'safe',
    description: 'Dedicated tourist police station near India Gate',
    tags: ['police', 'safety', 'emergency', 'tourist'],
  },
  {
    id: 'loc-005',
    name: 'Night Market Area',
    coordinates: { lat: 28.6506, lng: 77.2303 },
    safetyScore: 52,
    riskLevel: 'moderate',
    description: 'Popular night market with crowds - stay alert for pickpockets',
    tags: ['market', 'night', 'food', 'shopping'],
  },
];

// Mock Trusted Contacts
export const MOCK_TRUSTED_CONTACTS: TrustedContact[] = [
  {
    id: 'contact-001',
    name: 'Emergency Services',
    phone: '112',
    email: 'emergency@local.gov',
    relationship: 'Emergency',
    notifyOnEmergency: true,
  },
  {
    id: 'contact-002',
    name: 'Local Police',
    phone: '100',
    relationship: 'Police',
    notifyOnEmergency: true,
  },
  {
    id: 'contact-003',
    name: 'Women Helpline',
    phone: '1091',
    relationship: 'Helpline',
    notifyOnEmergency: true,
  },
];

// Time-based risk multipliers
export const TIME_RISK_MULTIPLIERS: Record<string, number> = {
  '00:00-04:00': 1.8,
  '04:00-06:00': 1.4,
  '06:00-08:00': 0.8,
  '08:00-10:00': 0.6,
  '10:00-14:00': 0.5,
  '14:00-17:00': 0.6,
  '17:00-19:00': 0.7,
  '19:00-21:00': 0.9,
  '21:00-23:00': 1.2,
  '23:00-00:00': 1.5,
};

export function getTimeRiskMultiplier(hour: number): number {
  if (hour >= 0 && hour < 4) return 1.8;
  if (hour >= 4 && hour < 6) return 1.4;
  if (hour >= 6 && hour < 8) return 0.8;
  if (hour >= 8 && hour < 10) return 0.6;
  if (hour >= 10 && hour < 14) return 0.5;
  if (hour >= 14 && hour < 17) return 0.6;
  if (hour >= 17 && hour < 19) return 0.7;
  if (hour >= 19 && hour < 21) return 0.9;
  if (hour >= 21 && hour < 23) return 1.2;
  return 1.5;
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score <= 25) return 'safe';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'critical';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'safe': return '#10B981';
    case 'moderate': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'critical': return '#7C2D12';
  }
}
