import { NextRequest, NextResponse } from "next/server";
import { getWeeklyActivitiesSummary } from "@/actions/dashboard.actions";

export async function GET(req: NextRequest) {
  try {
    const data = await getWeeklyActivitiesSummary();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities data.' }, { status: 500 });
  }
} 