import { NextRequest, NextResponse } from 'next/server';
import { logInfo } from './logger-edge';

// Simple request logging for Edge Runtime
export const logRequest = (req: NextRequest, res: NextResponse) => {
  logInfo(`Request: ${req.method} ${req.url}`, {
    status: res.status,
    userAgent: req.headers.get('user-agent'),
  });
};

// Add security headers to response
export const addSecurityHeaders = (response: NextResponse): NextResponse => {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'none'; object-src 'none';"
  );

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
};

// Simple API security middleware for Edge Runtime
export const apiSecurityMiddleware = (req: NextRequest): NextResponse | null => {
  // Basic rate limiting check (simplified for Edge Runtime)
  const userAgent = req.headers.get('user-agent');
  const ip = req.ip || req.headers.get('x-forwarded-for');

  // Log API request
  logInfo(`API Request: ${req.method} ${req.url}`, {
    userAgent,
    ip,
  });

  // For now, allow all requests (you can add more sophisticated checks later)
  return null;
}; 