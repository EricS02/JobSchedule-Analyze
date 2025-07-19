import { NextRequest, NextResponse } from "next/server";
import { logInfo, logError } from "@/lib/logger";
import { sanitizeInput } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  try {
    // Log the extension installation request
    logInfo('Extension Install API: Processing installation notification', {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    });

    // Validate request body
    const body = await request.json();
    const { action, userId, extensionId } = sanitizeInput(body);

    // Validate required fields
    if (!action || action !== 'install') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Log successful extension installation
    logInfo('Extension Install API: Extension installed successfully', {
      userId: userId || 'anonymous',
      extensionId,
      action,
    });

    // Return success response
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Extension installation logged successfully',
        redirectUrl: '/dashboard'
      },
      { status: 200 }
    );

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    logError('Extension Install API: Error processing installation', error, {
      method: request.method,
      url: request.url,
    });

    const response = NextResponse.json(
      { error: 'Failed to process extension installation' },
      { status: 500 }
    );

    // Add security headers even for error responses
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
} 