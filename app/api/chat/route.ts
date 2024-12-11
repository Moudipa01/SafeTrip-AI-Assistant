
import { NextRequest } from 'next/server';
import { generateChatResponse } from '@/lib/ai/safety-engine';
import { getNearbySafetyZones } from '@/lib/services/location-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, location } = body;

    if (!message || typeof message !== 'string') {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get nearby safety zones for context
    const safetyZones = location
      ? getNearbySafetyZones(location, 10)
      : undefined;

    const chatData = await generateChatResponse(message, {
      location,
      safetyZones,
    });

    return Response.json({
      response: chatData.response,
      suggestions: chatData.suggestions,
      mapAction: chatData.mapAction,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
