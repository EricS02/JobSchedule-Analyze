import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 === KINDE ENVIRONMENT TEST ===');
    
    // Check all Kinde-related environment variables
    const kindeVars = {
      // Server-side Kinde variables
      KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID,
      KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET,
      KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL,
      KINDE_SITE_URL: process.env.KINDE_SITE_URL,
      KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
      KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
      
      // Client-side Kinde variables
      NEXT_PUBLIC_KINDE_CLIENT_ID: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID,
      NEXT_PUBLIC_KINDE_DOMAIN: process.env.NEXT_PUBLIC_KINDE_DOMAIN,
      NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI,
      NEXT_PUBLIC_KINDE_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI,
      
      // Other auth variables
      AUTH_SECRET: process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    // Check status of each variable
    const status: Record<string, string> = {};
    const missingVars: string[] = [];
    
    Object.entries(kindeVars).forEach(([key, value]) => {
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

    console.log('🔍 === END KINDE TEST ===');

    return NextResponse.json({
      success: true,
      kindeEnvironment: status,
      missingKindeVars: missingVars,
      debug: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      }
    });
  } catch (error) {
    console.error('Error in Kinde environment test:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 