
import { NextRequest } from 'next/server';
import {
  getHeatmapData,
  getHeatmapDataForBounds,
  getSafetyZones,
} from '@/lib/services/location-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const north = searchParams.get('north');
    const south = searchParams.get('south');
    const east = searchParams.get('east');
    const west = searchParams.get('west');

    let heatmapData;
    if (north && south && east && west) {
      heatmapData = getHeatmapDataForBounds(
        parseFloat(north),
        parseFloat(south),
        parseFloat(east),
        parseFloat(west)
      );
    } else {
      heatmapData = getHeatmapData();
    }

    const zones = getSafetyZones();

    return Response.json({
      heatmapData,
      safetyZones: zones,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Heatmap API Error:', error);
    return Response.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    );
  }
}
