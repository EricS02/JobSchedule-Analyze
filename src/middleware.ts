import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://jobschedule.com']
  : ['http://localhost:3000'];

export { middleware as corsMiddleware } from './middleware/cors';

function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function getSecurityHeaders(nonce: string) {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    // Less restrictive CSP for better compatibility
    'Content-Security-Policy': [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' https://va.vercel-scripts.com https://cdn.kinde.com https://vercel.live https://*.vercel.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `img-src 'self' data: https: blob:`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `connect-src 'self' https://api.stripe.com https://api.openai.com https://*.kinde.com https://vercel.live wss:`,
      `frame-src 'self' https://js.stripe.com https://*.kinde.com https://vercel.live`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`,
      `block-all-mixed-content`
    ].join('; '),
    
    // Additional security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none'
  };
}

function isSuspiciousUserAgent(userAgent: string | null) {
  if (!userAgent) return true;
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /httpclient/i,
    /libwww/i,
    /java/i,
    /Go-http-client/i,
    /okhttp/i,
    /scrapy/i,
    /bot/i,
    /spider/i,
    /crawler/i,
    /Postman/i,
    /Insomnia/i,
    /^$/
  ];
  return suspiciousPatterns.some((pat) => pat.test(userAgent));
}

function isSuspiciousOrigin(origin: string | null) {
  if (!origin) return true;
  // Optionally add more checks for known bad origins
  return false;
}

export default function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  console.log(`Middleware - Processing request to: ${path}`);

  // Add CORS headers for API routes
  if (path.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const userAgent = request.headers.get('user-agent');
    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    if (isSuspiciousUserAgent(userAgent) || isSuspiciousOrigin(origin)) {
      console.warn('Suspicious request detected:', { origin, userAgent, path });
      // Optionally block or rate limit more strictly here
      // return new NextResponse('Too Many Requests', { status: 429 });
    }
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // For dashboard routes, use Kinde auth
  if (path.startsWith('/dashboard')) {
    return withAuth(
      function dashboardMiddleware(req: NextRequest) {
        // Add security headers for dashboard
        const response = NextResponse.next();
        const nonce = generateNonce();
        const securityHeaders = getSecurityHeaders(nonce);
        
        Object.entries(securityHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        
        response.headers.set('X-CSP-Nonce', nonce);
        return response;
      },
      {
        callbacks: {
          authorized: ({ req }: { req: any }) => {
            const isAuthorized = !!(req as any).auth;
            console.log(`Dashboard access - Authorized: ${isAuthorized}, User: ${(req as any).auth?.id || 'none'}`);
            return isAuthorized;
          },
        },
      }
    );
  }

  // Handle home page redirect for authenticated users
  if (path === '/') {
    console.log(`Middleware - Home page request - allowing access for all users`);
    // The AuthRedirect component in the home page will handle redirecting authenticated users
  }

  // Add comprehensive security headers for all responses
  const response = NextResponse.next();
  const nonce = generateNonce();
  const securityHeaders = getSecurityHeaders(nonce);
  
  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  response.headers.set('X-CSP-Nonce', nonce);
  return response;
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    '/dashboard/:path*', // Protect dashboard routes
    '/', // Include home page for redirect logic
    '/api/:path*', // Include API routes for CORS
  ],
};
