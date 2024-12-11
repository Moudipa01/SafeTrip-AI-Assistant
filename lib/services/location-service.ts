// ============================================
// SafeTrip AI Guardian - Location Service
// ============================================

import { Coordinates, HeatmapData, SafetyZone, Location } from '../types';
import { MOCK_LOCATIONS } from '../db/mock-data';
import { haversineDistance } from '../ai/safety-engine';
import { loadSafetyZonesFromCSV, loadHeatmapDataFromCSV } from '../db/csv-loader';

// ============================
// Location Search & Matching
// ============================
export function searchLocations(query: string): Location[] {
  const q = query.toLowerCase();
  
  return MOCK_LOCATIONS.filter(loc => {
    const nameMatch = loc.name.toLowerCase().includes(q);
    const descMatch = loc.description?.toLowerCase().includes(q);
    const tagMatch = loc.tags?.some(t => t.toLowerCase().includes(q));
    return nameMatch || descMatch || tagMatch;
  }).sort((a, b) => b.safetyScore - a.safetyScore);
}

export function getNearbyLocations(
  center: Coordinates,
  radiusKm: number = 5
): Location[] {
  return MOCK_LOCATIONS.filter(loc => {
    const dist = haversineDistance(center, loc.coordinates);
    return dist <= radiusKm;
  }).sort((a, b) => {
    const distA = haversineDistance(center, a.coordinates);
    const distB = haversineDistance(center, b.coordinates);
    return distA - distB;
  });
}

// Safety Zone Management
// ============================
export function getSafetyZones(): SafetyZone[] {
  return loadSafetyZonesFromCSV();
}

export function getNearbySafetyZones(
  center: Coordinates,
  radiusKm: number = 10
): SafetyZone[] {
  const zones = loadSafetyZonesFromCSV();
  return zones.filter(zone => {
    const dist = haversineDistance(center, zone.center);
    return dist <= radiusKm;
  }).sort((a, b) => a.riskScore - b.riskScore);
}

export function getSafestNearbyZone(center: Coordinates): SafetyZone | null {
  const nearby = getNearbySafetyZones(center, 15);
  const safeZones = nearby.filter(z => z.riskLevel === 'safe');
  
  if (safeZones.length === 0) return nearby[0] || null;
  
  // Return closest safe zone
  return safeZones.sort((a, b) => {
    const distA = haversineDistance(center, a.center);
    const distB = haversineDistance(center, b.center);
    return distA - distB;
  })[0];
}

// Heatmap Data
// ============================
export function getHeatmapData(): HeatmapData[] {
  return loadHeatmapDataFromCSV();
}

export function getHeatmapDataForBounds(
  north: number,
  south: number,
  east: number,
  west: number
): HeatmapData[] {
  const data = loadHeatmapDataFromCSV();
  return data.filter(d =>
    d.coordinates.lat >= south &&
    d.coordinates.lat <= north &&
    d.coordinates.lng >= west &&
    d.coordinates.lng <= east
  );
}

// ============================
// Geocoding (Simulated)
// ============================
export function reverseGeocode(coords: Coordinates): string {
  // Find nearest known location
  const zones = loadSafetyZonesFromCSV();
  const nearest = zones.reduce((prev, curr) => {
    const prevDist = haversineDistance(coords, prev.center);
    const currDist = haversineDistance(coords, curr.center);
    return currDist < prevDist ? curr : prev;
  });
  
  const dist = haversineDistance(coords, nearest.center);
  if (dist < 2) return `Near ${nearest.name}`;
  return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
}
