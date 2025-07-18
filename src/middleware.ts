import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export { middleware as corsMiddleware } from './middleware/cors';

export default withAuth(
  function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;

    // Add CORS headers for API routes
    if (path.startsWith('/api/')) {
      const response = NextResponse.next();
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }
    
    return NextResponse.next();
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
