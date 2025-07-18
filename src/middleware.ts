import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";
import { apiSecurityMiddleware, addSecurityHeaders, logRequest } from "@/lib/api-security";
import { logInfo, logError } from "@/lib/logger";

export default withAuth(
  async function middleware(req: NextRequest) {
    try {
      // Log incoming request
      logInfo(`Middleware: Processing ${req.method} ${req.url}`, {
        userAgent: req.headers.get('user-agent'),
        ip: req.ip || req.headers.get('x-forwarded-for'),
      });

      // Apply API security middleware for API routes
      if (req.nextUrl.pathname.startsWith('/api/')) {
        const securityResult = apiSecurityMiddleware(req);
        if (securityResult) {
          return addSecurityHeaders(securityResult);
        }
      }

      // Check if user is authenticated
      const isAuthenticated = await req.auth?.isAuthenticated();

      // Handle dashboard routes (require authentication)
      if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!isAuthenticated) {
          logInfo('Middleware: Redirecting unauthenticated user to signin', {
            path: req.nextUrl.pathname,
          });
          return NextResponse.redirect(new URL('/signin', req.url));
        }
        
        logInfo('Middleware: Authenticated user accessing dashboard', {
          path: req.nextUrl.pathname,
          userId: req.auth?.user?.id,
        });
      }

      // Handle public routes (allow both authenticated and unauthenticated)
      const publicRoutes = ['/', '/signin', '/signup', '/pricing', '/features'];
      const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname === route);

      if (isPublicRoute) {
        // For authenticated users on public routes, redirect to dashboard
        if (isAuthenticated && req.nextUrl.pathname === '/') {
          logInfo('Middleware: Redirecting authenticated user from home to dashboard', {
            userId: req.auth?.user?.id,
          });
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        logInfo('Middleware: User accessing public route', {
          path: req.nextUrl.pathname,
          isAuthenticated,
          userId: req.auth?.user?.id,
        });
      }

      // Create response
      const response = NextResponse.next();

      // Add security headers to all responses
      addSecurityHeaders(response);

      // Log the request
      logRequest(req, response);

      return response;
    } catch (error) {
      logError('Middleware error', error, {
        path: req.nextUrl.pathname,
        method: req.method,
      });

      // Return error response with security headers
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      return addSecurityHeaders(errorResponse);
    }
  },
  {
    // Callback to run if the user is not authenticated
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow all requests to pass through, we'll handle auth logic above
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
