import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Create a test user if it doesn't exist
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed_password_placeholder',
          createdAt: new Date()
        }
      });
    }
    
    // Create a simple job title
    const jobTitle = await prisma.jobTitle.create({
      data: {
        label: "Test Job Title",
        value: "test-job-title-" + Date.now(), // Make it unique
        createdBy: testUser.id
      }
    });
    
    return NextResponse.json({
      success: true,
      jobTitle
    });
  } catch (error) {
    console.error("Error in test job route:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      error
    }, { status: 500 });
  }
} 