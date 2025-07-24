import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 === ENV-CHECK DEBUG ===');
    console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`🔍 VERCEL_ENV: ${process.env.VERCEL_ENV}`);
    console.log(`🔍 VERCEL_URL: ${process.env.VERCEL_URL}`);
    
    const envVars = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "SET" : "NOT SET",
      STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || "NOT SET",
      KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID ? "SET" : "NOT SET",
      KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET ? "SET" : "NOT SET",
      KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL ? "SET" : "NOT SET",
      AUTH_SECRET: process.env.AUTH_SECRET ? "SET" : "NOT SET",
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
    };
    
    // Enhanced logging for debugging
    Object.entries(envVars).forEach(([key, value]) => {
      const rawValue = process.env[key];
      console.log(`🔍 ${key}: ${value}`);
      if (rawValue) {
        console.log(`🔍   Raw value: ${rawValue.substring(0, 20)}...`);
      }
    });
    
    console.log("Environment variables check:", envVars);
    console.log('🔍 === END ENV-CHECK DEBUG ===');
    
    return NextResponse.json({
      success: true,
      environment: envVars,
      missingVars: Object.entries(envVars)
        .filter(([key, value]) => value === "NOT SET")
        .map(([key]) => key)
    });
    
  } catch (error) {
    console.error("Environment check error:", error);
    return NextResponse.json({
      success: false,
      message: "Error checking environment variables",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 