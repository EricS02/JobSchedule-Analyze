import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Get test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        message: "Test user not found"
      }, { status: 404 });
    }
    
    // Log the user ID to make sure it's valid
    console.log("Test user ID:", testUser.id);
    
    // Create a job title with only the fields that exist in your schema
    const jobTitle = await prisma.jobTitle.create({
      data: {
        // Only include fields that exist in your schema
        label: "Test Job Title",
        value: "test-job-title-" + Date.now(),
        createdBy: testUser.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Job title created successfully",
      jobTitle
    });
  } catch (error) {
    console.error("Test simple error:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      error
    }, { status: 500 });
  }
} 