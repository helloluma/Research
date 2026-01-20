/**
 * Status API Endpoint
 * Returns the current system status for the landing page
 */

import { NextResponse } from 'next/server';
import { getDailyData, getLastRunTimestamps } from '@/lib/urgentTracker';
import { getQueryCounts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const timestamps = await getLastRunTimestamps();
    const dailyData = await getDailyData();
    const queryCounts = getQueryCounts();

    return NextResponse.json({
      status: 'active',
      lastMorningRun: timestamps.lastMorningRun,
      lastEveningRun: timestamps.lastEveningRun,
      queryCounts: {
        morning: queryCounts.morning,
        evening: queryCounts.evening,
      },
      todayStats: dailyData
        ? {
            morningUrgentItems: dailyData.morningUrgentItems?.length || 0,
            eveningUrgentItems: dailyData.eveningUrgentItems?.length || 0,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
