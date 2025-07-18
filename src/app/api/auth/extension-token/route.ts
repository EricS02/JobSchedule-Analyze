import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SignJWT } from "jose";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Add CORS headers
    const response = NextResponse.next();
    response.headers.append('Access-Control-Allow-Origin', '*');
    response.headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Get Kinde user session
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();
    
    if (!kindeUser || !kindeUser.email) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Find or create user in database
    const user = await prisma.user.upsert({
      where: { email: kindeUser.email },
      update: {
        // Update name if it has changed
        name: (kindeUser.given_name + ' ' + kindeUser.family_name) || kindeUser.email,
      },
      create: {
        email: kindeUser.email,
        name: (kindeUser.given_name + ' ' + kindeUser.family_name) || kindeUser.email,
        password: '', // No password needed for Kinde users
      },
    });
    
    // Create JWT token for extension
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // Token valid for 30 days
      .sign(secret);
    
    return NextResponse.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error("Extension token generation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  
  response.headers.append('Access-Control-Allow-Origin', '*');
  response.headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
} 