import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 === VERCEL ENVIRONMENT DEBUG ===');
    
    // Check all environment variables that should be set
    const allEnvVars = {
      // Server-side variables
      KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID,
      KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET,
      KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL,
      KINDE_SITE_URL: process.env.KINDE_SITE_URL,
      KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
      KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
      
      // Client-side variables (these should be available on server too)
      NEXT_PUBLIC_KINDE_CLIENT_ID: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID,
      NEXT_PUBLIC_KINDE_DOMAIN: process.env.NEXT_PUBLIC_KINDE_DOMAIN,
      NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI,
      NEXT_PUBLIC_KINDE_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI,
      
      // Other variables
      AUTH_SECRET: process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    };

    // Check status and log raw values
    const status: Record<string, any> = {};
    
    Object.entries(allEnvVars).forEach(([key, value]) => {
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
      
      status[key] = {
        isSet: isSet ? 'SET' : 'NOT SET',
        value: value ? value.substring(0, 30) + '...' : 'undefined',
        length: value ? value.length : 0,
        type: typeof value
      };
      
      console.log(`🔍 ${key}: ${isSet ? 'SET' : 'NOT SET'} - Value: ${value ? value.substring(0, 30) + '...' : 'undefined'} (Length: ${value ? value.length : 0})`);
    });

    console.log('🔍 === END VERCEL DEBUG ===');

    return NextResponse.json({
      success: true,
      environment: status,
      debug: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        VERCEL_REGION: process.env.VERCEL_REGION,
        VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
      }
    });
  } catch (error) {
    console.error('Error in Vercel environment debug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 