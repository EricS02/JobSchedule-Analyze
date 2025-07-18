import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Get the session
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({
        success: false,
        message: "No valid session found",
        session: null
      });
    }
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    return NextResponse.json({
      success: true,
      sessionEmail: session.user.email,
      sessionUserId: session.user.id,
      databaseUserId: user?.id,
      emailMatch: session.user.email === user?.email,
      idMatch: session.user.id === user?.id
    });
  } catch (error) {
    console.error("Session debug error:", error);
    return NextResponse.json({
      success: false,
      message: "Error checking session",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 