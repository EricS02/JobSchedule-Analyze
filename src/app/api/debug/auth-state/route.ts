import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const headers = Object.fromEntries(request.headers.entries());
    
    // Extract Kinde-related cookies
    const kindeCookies: Record<string, string> = {};
    const allCookies: Record<string, string> = {};
    
    cookies.getAll().forEach(cookie => {
      allCookies[cookie.name] = cookie.value;
      if (cookie.name.startsWith('kinde_')) {
        kindeCookies[cookie.name] = cookie.value;
      }
    });

    // Check for state-related cookies
    const stateCookies = Object.keys(kindeCookies).filter(key => 
      key.includes('state') || key.includes('verifier') || key.includes('nonce')
    );

    const response: {
      timestamp: string;
      url: string;
      method: string;
      kindeCookies: Record<string, string>;
      allCookies: string[];
      stateCookies: string[];
      hasStateMismatch: boolean;
      headers: Record<string, string | undefined>;
      recommendations: string[];
    } = {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      kindeCookies,
      allCookies: Object.keys(allCookies),
      stateCookies,
      hasStateMismatch: stateCookies.length > 1,
      headers: {
        'user-agent': headers['user-agent'],
        'referer': headers['referer'],
        'origin': headers['origin'],
        'host': headers['host']
      },
      recommendations: []
    };

    // Add recommendations based on findings
    if (stateCookies.length > 1) {
      response.recommendations.push('Multiple state cookies detected - this may cause state mismatch');
    }
    
    if (Object.keys(kindeCookies).length === 0) {
      response.recommendations.push('No Kinde cookies found - user may not be authenticated');
    }

    if (stateCookies.length === 0) {
      response.recommendations.push('No state cookies found - authentication flow may not be active');
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('🔍 Auth state debug error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check auth state', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
} 