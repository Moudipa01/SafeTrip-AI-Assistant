// ============================================
// SafeTrip AI Guardian - CSV Data Loader
// ============================================

import fs from 'fs';
import path from 'path';
import { SafetyZone, HeatmapData, RiskLevel } from '../types';

/**
 * Parses a CSV string into an array of objects
 */
function parseCSV(csv: string): any[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, i) => {
      let val: any = values[i];
      // Convert numbers
      if (!isNaN(val) && val !== '') {
        val = parseFloat(val);
      }
      obj[header] = val;
    });
    return obj;
  });
}

/**
 * Loads Safety Zones from CSV
 */
export function loadSafetyZonesFromCSV(): SafetyZone[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'safety_zones.csv');
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const rawData = parseCSV(csvContent);
    
    return rawData.map(item => ({
      id: item.id,
      name: item.name,
      center: { lat: item.lat, lng: item.lng },
      radius: item.radius,
      riskLevel: item.riskLevel as RiskLevel,
      riskScore: item.riskScore,
      factors: item.factors ? item.factors.split('|') : [],
      lastUpdated: item.lastUpdated,
      reportCount: item.reportCount,
    }));
  } catch (error) {
    console.error('Error loading safety zones CSV:', error);
    return [];
  }
}

/**
 * Loads Heatmap Data from CSV
 */
export function loadHeatmapDataFromCSV(): HeatmapData[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'heatmap_data.csv');
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const rawData = parseCSV(csvContent);
    
    return rawData.map(item => ({
      coordinates: { lat: item.lat, lng: item.lng },
      intensity: item.intensity,
      riskLevel: item.riskLevel as RiskLevel,
      reportCount: item.reportCount,
    }));
  } catch (error) {
    console.error('Error loading heatmap data CSV:', error);
    return [];
  }
}
