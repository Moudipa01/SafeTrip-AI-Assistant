

import { NextRequest } from 'next/server';
import { reverseGeocode } from '@/lib/services/location-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    if (lat === undefined || lng === undefined) {
      return Response.json(
        { error: 'Coordinates are required' },
        { status: 400 }
      );
    }

    const name = reverseGeocode({ lat, lng });

    return Response.json({ name });
  } catch (error) {
    console.error('Geocode API Error:', error);
    return Response.json(
      { error: 'Failed to geocode location' },
      { status: 500 }
    );
  }
}
