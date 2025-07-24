import { NextResponse } from "next/server";
import { debugEnvironmentVariables, getEnvVar } from "@/lib/config";

export async function GET() {
  try {
    console.log('🔍 Environment debug endpoint called');
    
    // Debug all environment variables
    debugEnvironmentVariables();
    
    // Test critical variables
    const results: Record<string, any> = {};
    
    const criticalVars = [
      'DATABASE_URL',
      'KINDE_CLIENT_ID',
      'KINDE_CLIENT_SECRET',
      'KINDE_ISSUER_URL',
      'AUTH_SECRET',
      'ENCRYPTION_KEY',
      'STRIPE_SECRET_KEY',
      'OPENAI_API_KEY'
    ];
    
    criticalVars.forEach(varName => {
      try {
        const value = getEnvVar(varName);
        results[varName] = {
          status: 'SET',
          value: value.substring(0, 20) + '...',
          length: value.length
        };
      } catch (error) {
        results[varName] = {
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
          rawValue: process.env[varName] || 'NOT SET'
        };
      }
    });
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL
      },
      variables: results
    });
    
  } catch (error) {
    console.error('Error in environment debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 