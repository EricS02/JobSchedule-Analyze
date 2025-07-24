import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Import the function dynamically to avoid build-time execution
    const { getWeeklyActivitiesSummary } = await import("@/actions/dashboard.actions");
    const data = await getWeeklyActivitiesSummary();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities data.' }, { status: 500 });
  }
} 