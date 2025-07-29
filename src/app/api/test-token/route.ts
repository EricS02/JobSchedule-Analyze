import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function GET() {
  try {
    // Get the test user from the database
    const prisma = (await import('@/lib/db')).default;
    
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      return NextResponse.json(
        { success: false, message: "Test user not found" },
        { status: 404 }
      );
    }
    
    // Sign the token with your secret using jose library
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.AUTH_SECRET || "test-secret");
    const token = await new SignJWT({ userId: testUser.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // Token valid for 30 days
      .sign(secret);
    
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