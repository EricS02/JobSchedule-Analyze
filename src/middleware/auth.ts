import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';

export const auth = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};

export default auth; 