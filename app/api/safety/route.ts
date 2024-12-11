
import { NextRequest } from 'next/server';
import { classifyRisk, calculatePersonalSafetyScore } from '@/lib/ai/safety-engine';
import { getNearbySafetyZones } from '@/lib/services/location-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, timeOfDay } = body;

    if (!location) {
      return Response.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const risk = await classifyRisk(location, timeOfDay);
    const nearbyZones = getNearbySafetyZones(location, 5);
    
    const hour = timeOfDay 
      ? parseInt(timeOfDay.split(':')[0]) 
      : new Date().getHours();
    
    const recentRiskScores = nearbyZones.map(z => z.riskScore);
    const safetyScore = calculatePersonalSafetyScore(
      risk.score, 
      hour, 
      recentRiskScores
    );

    return Response.json({
      risk,
      nearbyZones: nearbyZones.slice(0, 5),
      safetyScore,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Safety API Error:', error);
    return Response.json(
      { error: 'Failed to assess safety' },
      { status: 500 }
    );
  }
}
