
import { NextRequest } from 'next/server';
import {
  getActiveAlerts,
  getAllAlerts,
  acknowledgeAlert,
  checkPassiveSafety,
} from '@/lib/services/safety-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const alerts = getAllAlerts();
    const activeAlerts = getActiveAlerts();

    return Response.json({
      alerts,
      activeCount: activeAlerts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Alerts GET Error:', error);
    return Response.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, location, expectedRoute } = body;

    if (action === 'acknowledge' && alertId) {
      const result = acknowledgeAlert(alertId);
      return Response.json({ success: result });
    }

    if (action === 'check' && location) {
      const newAlerts = await checkPassiveSafety(location, expectedRoute);
      return Response.json({
        newAlerts,
        allActive: getActiveAlerts(),
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Alerts POST Error:', error);
    return Response.json(
      { error: 'Failed to process alert action' },
      { status: 500 }
    );
  }
}
