import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log("API: Test connection endpoint hit");
  
  try {
    return NextResponse.json({
      success: true,
      message: "API connection successful",
      timestamp: new Date().toISOString(),
      server: "JobSchedule API",
      version: "1.0.0"
    });
  } catch (error) {
    console.error("API: Test connection error:", error);
    return NextResponse.json({
      success: false,
      message: "API connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
} 