
import { NextRequest } from 'next/server';
import {
  triggerSOS,
  resolveEmergency,
  getEmergencyEvents,
} from '@/lib/services/safety-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = getEmergencyEvents();
    return Response.json({
      events,
      activeCount: events.filter(e => e.status === 'active').length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Emergency GET Error:', error);
    return Response.json(
      { error: 'Failed to fetch emergency events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, location, eventId } = body;

    if (action === 'sos' && location) {
      const event = triggerSOS(location);
      return Response.json({
        event,
        message: 'SOS triggered. Emergency contacts notified.',
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'resolve' && eventId) {
      const result = resolveEmergency(eventId);
      return Response.json({
        success: result,
        message: result ? 'Emergency resolved.' : 'Event not found.',
      });
    }

    return Response.json(
      { error: 'Invalid action. Use "sos" or "resolve".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Emergency POST Error:', error);
    return Response.json(
      { error: 'Failed to process emergency action' },
      { status: 500 }
    );
  }
}
