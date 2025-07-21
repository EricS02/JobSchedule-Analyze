import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://jobschedule.com']
  : ['http://localhost:3000'];

export function middleware(request: NextRequest) {
  console.log("CORS Middleware: Processing request to", request.nextUrl.pathname);

  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Content-Type', 'application/json');

  console.log("CORS Middleware: Added headers to response");
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 