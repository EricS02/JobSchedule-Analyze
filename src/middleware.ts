import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified allowed origins - include your actual Vercel URL
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://job-schedule-analyze-de1dcj6fj-erics02s-projects.vercel.app',
      'https://job-schedule-analyze-git-new-main-branch-erics02s-projects.vercel.app',
      'https://jobschedule.com'
    ]
  : ['http://localhost:3000'];

function getSecurityHeaders() {
  return {
    // Simplified CSP
    'Content-Security-Policy': [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://cdn.kinde.com https://vercel.live https://*.vercel.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `img-src 'self' data: https: blob:`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `connect-src 'self' https://api.stripe.com https://api.openai.com https://*.kinde.com https://vercel.live wss:`,
      `frame-src 'self' https://js.stripe.com https://*.kinde.com https://vercel.live`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`
    ].join('; '),
    
    // Basic security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

export default function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    
    // Simple CORS for API routes
    if (path.startsWith('/api/')) {
      const origin = request.headers.get('origin');
      const response = NextResponse.next();
      
      // Allow all origins in development, check in production
      if (process.env.NODE_ENV === 'production' && origin) {
        if (allowedOrigins.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        } else {
          // Log but don't block - too restrictive
          console.warn('Origin not in allowed list:', origin);
        }
      } else {
        response.headers.set('Access-Control-Allow-Origin', origin || '*');
      }
      
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    // For dashboard routes, use Kinde auth
    if (path.startsWith('/dashboard')) {
      return withAuth(
        function dashboardMiddleware(req: NextRequest) {
          const response = NextResponse.next();
          const securityHeaders = getSecurityHeaders();
          
          Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
          
          return response;
        },
        {
          callbacks: {
            authorized: ({ req }: { req: any }) => {
              const isAuthorized = !!(req as any).auth;
              return isAuthorized;
            },
          },
        }
      );
    }

    // For all other routes, just add basic security headers
    const response = NextResponse.next();
    const securityHeaders = getSecurityHeaders();
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
    
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a simple response on error instead of crashing
    return NextResponse.next();
  }
}

// Simplified matcher
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
