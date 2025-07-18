import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/utils/user.utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated",
        userId: null
      }, { status: 401 });
    }
    
    // First check if there are ANY jobs in the database
    const totalJobCount = await prisma.job.count();
    
    // Then get jobs for this specific user
    const recentJobs = await prisma.job.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        company: true,
        createdAt: true,
        userId: true,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      userId: user.id,
      totalJobsInDatabase: totalJobCount,
      userJobCount: recentJobs.length,
      jobs: recentJobs 
    });
  } catch (error) {
    console.error("Error fetching debug jobs:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch jobs",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 