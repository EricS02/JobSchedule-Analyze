import { NextRequest, NextResponse } from "next/server";
import { logInfo, logError } from "@/lib/logger";
import { sanitizeInput } from "@/lib/api-security";
import path from "path";
import fs from "fs";

export async function GET(request: NextRequest) {
  try {
    // Log the download request
    logInfo('Extension Download API: Processing download request', {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    });

    // Get the extension file path
    const extensionPath = path.join(process.cwd(), 'extension');
    
    // Check if extension directory exists
    if (!fs.existsSync(extensionPath)) {
      logError('Extension Download API: Extension directory not found', null, {
        extensionPath,
      });
      return NextResponse.json(
        { error: 'Extension not available' },
        { status: 404 }
      );
    }

    // Create a zip file of the extension
    const archiver = require('archiver');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    // Set response headers
    const response = new NextResponse(archive as any);
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', 'attachment; filename="jobschedule-extension.zip"');
    response.headers.set('Cache-Control', 'no-cache');

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Add files to the archive
    const files = [
      'manifest.json',
      'background.js',
      'content.js',
      'popup.html',
      'popup.js',
      'icon16.png',
      'icon48.png',
      'icon128.png',
      'icon.png'
    ];

    files.forEach(file => {
      const filePath = path.join(extensionPath, file);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
      }
    });

    // Finalize the archive
    archive.finalize();

    logInfo('Extension Download API: Extension download completed successfully', {
      filesIncluded: files.length,
    });

    return response;

  } catch (error) {
    logError('Extension Download API: Error serving extension', error, {
      method: request.method,
      url: request.url,
    });

    const response = NextResponse.json(
      { error: 'Failed to download extension' },
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
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
} 