import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://jobschedule.com']
  : ['http://localhost:3000'];

export { middleware as corsMiddleware } from './middleware/cors';

function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function isSuspiciousUserAgent(userAgent) {
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

function isSuspiciousOrigin(origin) {
  if (!origin) return true;
  // Optionally add more checks for known bad origins
  return false;
}

export default withAuth(
  function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;

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

    // Only add CSP for HTML responses (not static assets or API)
    const response = NextResponse.next();
    const nonce = generateNonce();
    const isProd = process.env.NODE_ENV === 'production';
    const scriptSrc = [
      "'self'",
      `'nonce-${nonce}'`,
      "https://va.vercel-scripts.com",
      "https://vercel.live",
      "https://cdn.kinde.com",
      ...(isProd ? [] : ["'unsafe-eval'", "'unsafe-inline'"])
    ].join(' ');
    response.headers.set(
      'Content-Security-Policy',
      [
        `default-src 'self'`,
        `script-src ${scriptSrc}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com data:",
        "connect-src 'self' https://api.stripe.com https://api.openai.com https://*.kinde.com wss:",
        "frame-src 'self' https://js.stripe.com https://*.kinde.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; ')
    );
    response.headers.set('X-CSP-Nonce', nonce);
    return response;
  },
  {
    callbacks: {
      authorized: ({ req }) => {
        const path = req.nextUrl.pathname;
        const isOnDashboard = path.startsWith("/dashboard");
        console.log(`Middleware - Path: ${path}, Auth: ${!!req.auth}, User: ${req.auth?.id || 'none'}`);
        // Only require authentication for dashboard routes
        if (isOnDashboard) {
          const isAuthorized = !!req.auth;
          console.log(`Dashboard access - Authorized: ${isAuthorized}`);
          return isAuthorized;
        }
        // For all other routes, allow access regardless of auth status
        console.log(`${path} - allowing access regardless of auth status`);
        return true;
      },
    },
  }
);

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    '/dashboard/:path*', // Only protect dashboard routes
  ],
};
