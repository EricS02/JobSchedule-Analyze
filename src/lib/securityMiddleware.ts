import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit, validateCSRF } from './security';
import logger from './logger';

// Rate limiting configuration
const rateLimiter = createRateLimit(60000, 100); // 100 requests per minute

export function withSecurity(handler: Function) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    
    try {
      // Rate limiting
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown';
      
      try {
        rateLimiter(ip);
      } catch (error) {
        logger.security('Rate limit exceeded', { ip, url: req.url });
        return NextResponse.json(
          { error: 'Too many requests' }, 
          { status: 429 }
        );
      }
      
      // CSRF protection for state-changing operations
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
        const origin = req.headers.get('origin');
        const host = req.headers.get('host');
        
        if (!validateCSRF(origin, host)) {
          logger.security('CSRF protection triggered', { 
            origin, 
            host, 
            url: req.url,
            method: req.method 
          });
          return NextResponse.json(
            { error: 'CSRF protection triggered' }, 
            { status: 403 }
          );
        }
      }
      
      // Log the request
      logger.apiRequest(
        req.method || 'UNKNOWN',
        req.url,
        0, // Will be updated after response
        Date.now() - startTime,
        { ip }
      );
      
      // Call the original handler
      const response = await handler(req);
      
      // Log the response
      logger.apiRequest(
        req.method || 'UNKNOWN',
        req.url,
        response.status,
        Date.now() - startTime,
        { ip }
      );
      
      return response;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Security middleware error', error as Error, {
        url: req.url,
        method: req.method,
        duration,
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });
      
      return NextResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      );
    }
  };
}

// Enhanced security wrapper with additional checks
export function withEnhancedSecurity(handler: Function, options?: {
  requireAuth?: boolean;
  maxBodySize?: number;
  allowedMethods?: string[];
}) {
  return withSecurity(async (req: NextRequest) => {
    // Method validation
    if (options?.allowedMethods && !options.allowedMethods.includes(req.method || '')) {
      logger.security('Method not allowed', { 
        method: req.method, 
        url: req.url,
        allowedMethods: options.allowedMethods 
      });
      return NextResponse.json(
        { error: 'Method not allowed' }, 
        { status: 405 }
      );
    }
    
    // Body size validation
    if (options?.maxBodySize) {
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > options.maxBodySize) {
        logger.security('Request body too large', { 
          contentLength: parseInt(contentLength),
          maxSize: options.maxBodySize,
          url: req.url 
        });
        return NextResponse.json(
          { error: 'Request body too large' }, 
          { status: 413 }
        );
      }
    }
    
    // Authentication check
    if (options?.requireAuth) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        logger.security('Missing authorization header', { url: req.url });
        return NextResponse.json(
          { error: 'Authentication required' }, 
          { status: 401 }
        );
      }
    }
    
    return await handler(req);
  });
} 