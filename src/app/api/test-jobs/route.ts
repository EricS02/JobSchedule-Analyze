import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Get the 10 most recent jobs
    const recentJobs = await prisma.job.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        jobTitle: true,
        jobsAppliedCompany: true,
        jobsAppliedLocation: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      jobs: recentJobs 
    });
  } catch (error) {
    console.error("Error fetching test jobs:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch jobs" 
    }, { status: 500 });
  }
} 