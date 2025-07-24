import { debugEnvironmentVariables, getEnvVar } from "@/lib/config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 === ENVIRONMENT DEBUG ENDPOINT ===');
    
    // Check environment variables directly
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL,
      KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID,
      KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET,
      KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NEXT_PUBLIC_KINDE_CLIENT_ID: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID,
      NEXT_PUBLIC_KINDE_DOMAIN: process.env.NEXT_PUBLIC_KINDE_DOMAIN,
    };

    // Check status of each variable
    const status: Record<string, string> = {};
    const missingVars: string[] = [];
    
    Object.entries(envVars).forEach(([key, value]) => {
      const isSet = value && 
        value !== 'placeholder-secret' && 
        value !== 'placeholder-key' && 
        value !== 'https://placeholder.kinde.com' &&
        value !== 'placeholder://db' &&
        value !== 'placeholder-encryption-key-32-chars-long!!' &&
        value !== 'undefined' &&
        value !== 'null' &&
        !value.includes('placeholder') &&
        value.trim() !== '';
      
      status[key] = isSet ? 'SET' : 'NOT SET';
      
      if (!isSet) {
        missingVars.push(key);
      }
      
      // Log the actual value (first 20 chars for security)
      console.log(`🔍 ${key}: ${isSet ? 'SET' : 'NOT SET'} - Value: ${value ? value.substring(0, 20) + '...' : 'undefined'}`);
    });

    console.log('🔍 === END ENVIRONMENT DEBUG ===');

    return NextResponse.json({
      success: true,
      environment: status,
      missingVars,
      debug: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      }
    });
  } catch (error) {
    console.error('Error in environment debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 