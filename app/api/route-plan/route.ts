
import { NextRequest } from 'next/server';
import { generateRouteRecommendation, classifyRisk } from '@/lib/ai/safety-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, timeOfDay } = body;

    if (!origin || !destination) {
      return Response.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const route = await generateRouteRecommendation(origin, destination, timeOfDay);
    const originRisk = await classifyRisk(origin, timeOfDay);
    const destRisk = await classifyRisk(destination, timeOfDay);

    return Response.json({
      route,
      originRisk,
      destinationRisk: destRisk,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Route API Error:', error);
    return Response.json(
      { error: 'Failed to generate route recommendation' },
      { status: 500 }
    );
  }
}
