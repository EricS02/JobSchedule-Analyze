import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/user.utils";
import { addJob } from "@/actions/job.actions";
import { logInfo, logError, logUserActivity } from "@/lib/logger";
import { sanitizeInput, securityUtils } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  try {
    // Log incoming request
    logInfo('Jobs Extension API: Processing job creation request', {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    });

    // Get authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      securityUtils.logSecurityEvent('Missing or invalid authorization header', {
        hasAuthHeader: !!authHeader,
        authHeaderType: authHeader ? 'Bearer' : 'none',
      });
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      securityUtils.logSecurityEvent('Unauthenticated access attempt', {
        ip: request.ip || request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let jobData;
    try {
      const body = await request.json();
      
      // Sanitize input
      jobData = sanitizeInput(body);
      
      // Validate required fields
      if (!jobData.jobTitle || !jobData.company) {
        logError('Jobs Extension API: Missing required fields', null, {
          userId: user.id,
          providedFields: Object.keys(jobData),
        });
        return NextResponse.json(
          { success: false, message: "Missing required job information" },
          { status: 400 }
        );
      }

      // Validate job URL if provided
      if (jobData.jobUrl && !jobData.jobUrl.includes('linkedin.com')) {
        securityUtils.logSecurityEvent('Invalid job URL provided', {
          userId: user.id,
          jobUrl: jobData.jobUrl,
        });
        return NextResponse.json(
          { success: false, message: "Invalid job URL" },
          { status: 400 }
        );
      }

    } catch (parseError) {
      logError('Jobs Extension API: Failed to parse request body', parseError, {
        userId: user.id,
      });
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    // Log job creation attempt
    logUserActivity(user.id, 'job_creation_attempt', {
      jobTitle: jobData.jobTitle,
      company: jobData.company,
      source: 'extension',
    });

    // Create the job
    const result = await addJob({
      ...jobData,
      userId: user.id,
      source: "extension",
    });

    if (!result.success) {
      logError('Jobs Extension API: Failed to create job', null, {
        userId: user.id,
        jobTitle: jobData.jobTitle,
        company: jobData.company,
        error: result.message,
      });
      return NextResponse.json(
        { success: false, message: result.message || "Failed to create job" },
        { status: 500 }
      );
    }

    // Log successful job creation
    logUserActivity(user.id, 'job_created', {
      jobId: result.data?.id,
      jobTitle: jobData.jobTitle,
      company: jobData.company,
      source: 'extension',
    });

    logInfo('Jobs Extension API: Job created successfully', {
      userId: user.id,
      jobId: result.data?.id,
      jobTitle: jobData.jobTitle,
      company: jobData.company,
    });

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: "Job created successfully",
      job: result.data,
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    logError('Jobs Extension API: Unexpected error', error, {
      method: request.method,
      url: request.url,
      ip: request.ip || request.headers.get('x-forwarded-for'),
    });

    const response = NextResponse.json(
      { success: false, message: "Internal server error" },
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
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
} 