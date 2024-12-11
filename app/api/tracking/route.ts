
import { NextRequest } from 'next/server';
import {
  recordMovement,
  getMovementHistory,
  checkPassiveSafety,
} from '@/lib/services/safety-service';
import { MovementData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { position, speed, heading, accuracy, expectedRoute } = body;

    if (!position) {
      return Response.json(
        { error: 'Position is required' },
        { status: 400 }
      );
    }

    const movementData: MovementData = {
      timestamp: new Date().toISOString(),
      position,
      speed: speed || 0,
      heading: heading || 0,
      accuracy: accuracy || 10,
    };

    recordMovement(movementData);

    // Run passive safety check
    const alerts = await checkPassiveSafety(position, expectedRoute);

    return Response.json({
      recorded: true,
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Tracking API Error:', error);
    return Response.json(
      { error: 'Failed to record movement' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const history = getMovementHistory();
    return Response.json({
      history,
      count: history.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Tracking GET Error:', error);
    return Response.json(
      { error: 'Failed to fetch movement history' },
      { status: 500 }
    );
  }
}
