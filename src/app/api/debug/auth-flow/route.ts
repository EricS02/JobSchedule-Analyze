import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 === AUTH FLOW DEBUG ===');
    
    // Get the current request URL to understand what domain we're on
    const requestUrl = process.env.VERCEL_URL || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const currentDomain = `${protocol}://${requestUrl}`;
    
    // Check all Kinde-related environment variables
    const kindeConfig = {
      // Server-side variables
      KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID,
      KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET,
      KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL,
      KINDE_SITE_URL: process.env.KINDE_SITE_URL,
      KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
      KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
      
      // Client-side variables
      NEXT_PUBLIC_KINDE_CLIENT_ID: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID,
      NEXT_PUBLIC_KINDE_DOMAIN: process.env.NEXT_PUBLIC_KINDE_DOMAIN,
      NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI,
      NEXT_PUBLIC_KINDE_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI,
      
      // Other auth variables
      AUTH_SECRET: process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    // Check what callback URL would be generated
    const expectedCallbackUrl = `${process.env.KINDE_SITE_URL || currentDomain}/api/auth/kinde_callback`;
    const expectedRedirectUrl = `${process.env.KINDE_SITE_URL || currentDomain}`;
    
    console.log(`🔍 Current domain: ${currentDomain}`);
    console.log(`🔍 Expected callback URL: ${expectedCallbackUrl}`);
    console.log(`🔍 Expected redirect URL: ${expectedRedirectUrl}`);

    // Check for common issues
    const issues = [];
    
    if (!process.env.KINDE_ISSUER_URL?.startsWith('https://')) {
      issues.push('KINDE_ISSUER_URL missing https:// protocol');
    }
    
    if (!process.env.KINDE_SITE_URL?.startsWith('https://')) {
      issues.push('KINDE_SITE_URL missing https:// protocol');
    }
    
    if (process.env.KINDE_SITE_URL !== process.env.NEXTAUTH_URL) {
      issues.push('KINDE_SITE_URL and NEXTAUTH_URL should match');
    }
    
    if (process.env.NEXT_PUBLIC_KINDE_DOMAIN?.includes('https://')) {
      issues.push('NEXT_PUBLIC_KINDE_DOMAIN should not include protocol');
    }

    console.log(`🔍 Issues found: ${issues.length}`);
    issues.forEach(issue => console.log(`🔍 - ${issue}`));

    return NextResponse.json({
      success: true,
      currentDomain,
      expectedCallbackUrl,
      expectedRedirectUrl,
      kindeConfig,
      issues,
      debug: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      }
    });
  } catch (error) {
    console.error('Error in auth flow debug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 