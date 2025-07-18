import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent, logError } from './logger';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window
const RATE_LIMIT_BY_IP = new Map<string, { count: number; resetTime: number }>();

// Request size limits
const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_JSON_SIZE = 1024 * 1024; // 1MB

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://your-production-domain.com', // Replace with your domain
];

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Rate limiting middleware
export function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  const rateLimit = RATE_LIMIT_BY_IP.get(ip);
  
  if (!rateLimit || now > rateLimit.resetTime) {
    // Reset or create new rate limit entry
    RATE_LIMIT_BY_IP.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
  } else {
    // Increment count
    rateLimit.count++;
    
    if (rateLimit.count > RATE_LIMIT_MAX_REQUESTS) {
      logSecurityEvent('Rate limit exceeded', { ip, count: rateLimit.count });
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  return null; // Continue with request
}

// Request size validation
export function validateRequestSize(request: NextRequest) {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    
    if (size > MAX_REQUEST_SIZE) {
      logSecurityEvent('Request too large', { size, maxSize: MAX_REQUEST_SIZE });
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }
  }
  
  return null; // Continue with request
}

// CORS middleware
export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    logSecurityEvent('CORS violation', { origin });
    return NextResponse.json(
      { error: 'CORS not allowed' },
      { status: 403 }
    );
  }
  
  return null; // Continue with request
}

// Input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Request validation middleware
export function validateRequest(request: NextRequest) {
  try {
    // Check content type for JSON requests
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_JSON_SIZE) {
        logSecurityEvent('JSON payload too large', { size: contentLength });
        return NextResponse.json(
          { error: 'JSON payload too large' },
          { status: 413 }
        );
      }
    }
    
    return null; // Continue with request
  } catch (error) {
    logError('Request validation error', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Main API security middleware
export function apiSecurityMiddleware(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimitMiddleware(request);
    if (rateLimitResult) return rateLimitResult;
    
    // Validate request size
    const sizeResult = validateRequestSize(request);
    if (sizeResult) return sizeResult;
    
    // Apply CORS check
    const corsResult = corsMiddleware(request);
    if (corsResult) return corsResult;
    
    // Validate request
    const validationResult = validateRequest(request);
    if (validationResult) return validationResult;
    
    return null; // Continue with request
  } catch (error) {
    logError('API security middleware error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Request logging middleware
export function logRequest(request: NextRequest, response: NextResponse) {
  const startTime = Date.now();
  
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  
  // Log the request
  const logData = {
    method: request.method,
    url: request.url,
    status: response.status,
    userAgent: request.headers.get('user-agent'),
    ip: request.ip || request.headers.get('x-forwarded-for'),
    duration: Date.now() - startTime,
  };
  
  if (response.status >= 400) {
    logError(`API Request Failed: ${request.method} ${request.url}`, null, logData);
  } else {
    // Use console.log for now, will be replaced with proper logging
    console.log(`API Request: ${request.method} ${request.url}`, logData);
  }
}

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of RATE_LIMIT_BY_IP.entries()) {
    if (now > data.resetTime) {
      RATE_LIMIT_BY_IP.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// Export security utilities
export const securityUtils = {
  sanitizeInput,
  logSecurityEvent,
  addSecurityHeaders,
}; 