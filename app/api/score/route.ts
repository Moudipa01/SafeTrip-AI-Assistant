

import { NextRequest } from 'next/server';
import { calculatePersonalSafetyScore } from '@/lib/ai/safety-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, route, history } = body;

    if (!location) {
      return Response.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Calculate score based on current context
    const score = calculatePersonalSafetyScore(
      route?.riskScore || 0,
      new Date().getHours(),
      history || []
    );

    return Response.json({
      score,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Score API Error:', error);
    return Response.json(
      { error: 'Failed to calculate safety score' },
      { status: 500 }
    );
  }
}
