
import { NextRequest } from 'next/server';
import { searchLocations, getNearbyLocations } from '@/lib/services/location-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    let results;
    if (query) {
      results = searchLocations(query);
    } else if (lat && lng) {
      results = getNearbyLocations(
        { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius ? parseFloat(radius) : 5
      );
    } else {
      return Response.json(
        { error: 'Provide either a search query (q) or coordinates (lat, lng)' },
        { status: 400 }
      );
    }

    return Response.json({
      results,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return Response.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
