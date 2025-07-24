import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 Simple environment debug endpoint called');
    
    // Simple environment variable check
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL ? 'SET' : 'NOT SET',
      AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT SET',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? 'SET' : 'NOT SET',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Simple environment debug endpoint working',
      timestamp: new Date().toISOString(),
      environment: envVars
    });
    
  } catch (error) {
    console.error('Error in simple environment debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 