import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that only protects dashboard routes
export default withAuth(
  function middleware(req: NextRequest) {
    // Only protect dashboard routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }: { req: NextRequest; token: any }) => {
        // Allow all routes by default, let individual pages handle auth
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Only apply to dashboard routes - exclude auth routes completely
    '/dashboard/:path*',
  ],
};
