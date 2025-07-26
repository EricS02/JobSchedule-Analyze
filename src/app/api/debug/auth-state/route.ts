import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  try {
    console.log('🔍 === AUTH STATE DEBUG ===');
    
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    // Check authentication status
    const authStatus = await isAuthenticated();
    console.log('🔍 Authentication status:', authStatus);
    
    let user = null;
    if (authStatus) {
      try {
        user = await getUser();
        console.log('🔍 User data retrieved:', user ? 'Yes' : 'No');
      } catch (userError) {
        console.error('🔍 Error getting user:', userError);
      }
    }

    // Check environment variables
    const envCheck = {
      KINDE_CLIENT_ID: !!process.env.KINDE_CLIENT_ID,
      KINDE_CLIENT_SECRET: !!process.env.KINDE_CLIENT_SECRET,
      KINDE_ISSUER_URL: !!process.env.KINDE_ISSUER_URL,
      KINDE_SITE_URL: !!process.env.KINDE_SITE_URL,
      NEXT_PUBLIC_KINDE_CLIENT_ID: !!process.env.NEXT_PUBLIC_KINDE_CLIENT_ID,
      NEXT_PUBLIC_KINDE_DOMAIN: !!process.env.NEXT_PUBLIC_KINDE_DOMAIN,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    };

    console.log('🔍 Environment check:', envCheck);

    // Get current domain info
    const currentDomain = process.env.VERCEL_URL || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const fullDomain = `${protocol}://${currentDomain}`;

    console.log('🔍 Current domain:', fullDomain);

    return NextResponse.json({
      success: true,
      auth: {
        isAuthenticated: authStatus,
        user: user ? {
          id: user.id,
          email: user.email,
          given_name: user.given_name,
          family_name: user.family_name,
          picture: !!user.picture
        } : null,
        userError: user ? null : 'Failed to get user data'
      },
      environment: {
        ...envCheck,
        currentDomain: fullDomain,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      },
      debug: {
        timestamp: new Date().toISOString(),
        requestHeaders: {
          // Note: We can't access request headers in this context
          // but this shows what we would check
          userAgent: 'Server-side check',
          origin: fullDomain
        }
      }
    });

  } catch (error) {
    console.error('🔍 Error in auth state debug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 