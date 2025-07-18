import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 Auth test endpoint called");
    
    // Get the Kinde session
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();
    
    console.log("Kinde user:", {
      id: kindeUser?.id,
      email: kindeUser?.email,
      given_name: kindeUser?.given_name,
      family_name: kindeUser?.family_name
    });
    
    if (!kindeUser || !kindeUser.email) {
      return NextResponse.json({
        success: false,
        message: "No valid Kinde session found",
        kindeUser: null,
        dbUser: null
      });
    }
    
    // Get the user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: kindeUser.email },
    });
    
    console.log("Database user:", {
      id: dbUser?.id,
      email: dbUser?.email,
      stripe_customer_id: dbUser?.stripe_customer_id
    });
    
    return NextResponse.json({
      success: true,
      kindeUser: {
        id: kindeUser.id,
        email: kindeUser.email,
        given_name: kindeUser.given_name,
        family_name: kindeUser.family_name
      },
      dbUser: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        stripe_customer_id: dbUser.stripe_customer_id
      } : null,
      userExists: !!dbUser,
      stripeCustomerExists: !!dbUser?.stripe_customer_id
    });
    
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({
      success: false,
      message: "Error testing authentication",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 