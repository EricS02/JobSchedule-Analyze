import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export async function GET() {
  try {
    // Create a test token for the test user
    const testUser = {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User"
    };
    
    // Sign the token with your secret
    const token = sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1d" }
    );
    
    // Return the token
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      }
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error("Error generating test token:", error);
    
    const response = NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
} 