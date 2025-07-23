import { NextResponse } from "next/server";
import { getUser } from "@/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Get the user session using Kinde
    const user = await getUser();
    
    if (!user || !user.email) {
      return NextResponse.json({
        success: false,
        message: "No valid session found",
        session: null
      });
    }
    
    // Get the user from the database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    
    return NextResponse.json({
      success: true,
      sessionEmail: user.email,
      sessionUserId: user.id,
      databaseUserId: dbUser?.id,
      emailMatch: user.email === dbUser?.email,
      idMatch: user.id === dbUser?.id
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