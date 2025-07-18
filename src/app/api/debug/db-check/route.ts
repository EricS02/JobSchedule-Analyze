import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Check database connection
    const jobCount = await prisma.job.count();
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    
    // Get a sample job if any exist
    const sampleJob = jobCount > 0 
      ? await prisma.job.findFirst({
          select: {
            id: true,
            title: true,
            company: true,
            createdAt: true,
            userId: true,
          }
        })
      : null;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      databaseStatus: "connected",
      counts: {
        jobs: jobCount,
        users: userCount,
        companies: companyCount
      },
      sampleJob
    });
  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      databaseStatus: "error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 