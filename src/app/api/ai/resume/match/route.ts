import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/user.utils";
import { logInfo, logError, logUserActivity } from "@/lib/logger";
import { sanitizeInput, securityUtils } from "@/lib/api-security";
import { hasSubscription } from "@/actions/stripe.actions";

export async function POST(request: NextRequest) {
  try {
    // Log incoming request
    logInfo('AI Job Match API: Processing match request', {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    });

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      securityUtils.logSecurityEvent('Unauthenticated AI match attempt', {
        ip: request.ip || request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check subscription status for AI features
    const subscription = await hasSubscription();
    if (!subscription.isSubscribed) {
      logUserActivity(user.id, 'ai_feature_denied_no_subscription', {
        feature: 'job_match',
      });
      return NextResponse.json(
        { 
          success: false, 
          message: "AI features require a Pro subscription. Please upgrade to continue.",
          requiresUpgrade: true
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    let requestData;
    try {
      const body = await request.json();
      
      // Sanitize input
      requestData = sanitizeInput(body);
      
      // Validate required fields
      if (!requestData.jobDescription || typeof requestData.jobDescription !== 'string') {
        logError('AI Job Match API: Missing or invalid job description', null, {
          userId: user.id,
          hasJobDescription: !!requestData.jobDescription,
          jobDescriptionType: typeof requestData.jobDescription,
        });
        return NextResponse.json(
          { success: false, message: "Job description is required" },
          { status: 400 }
        );
      }

      // Validate job description length
      if (requestData.jobDescription.length > 15000) {
        securityUtils.logSecurityEvent('Job description too long', {
          userId: user.id,
          textLength: requestData.jobDescription.length,
          maxLength: 15000,
        });
        return NextResponse.json(
          { success: false, message: "Job description too long (max 15,000 characters)" },
          { status: 400 }
        );
      }

      // Validate AI model
      const allowedModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet'];
      if (requestData.selectedModel && !allowedModels.includes(requestData.selectedModel)) {
        securityUtils.logSecurityEvent('Invalid AI model requested', {
          userId: user.id,
          requestedModel: requestData.selectedModel,
          allowedModels,
        });
        return NextResponse.json(
          { success: false, message: "Invalid AI model selected" },
          { status: 400 }
        );
      }

    } catch (parseError) {
      logError('AI Job Match API: Failed to parse request body', parseError, {
        userId: user.id,
      });
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    // Log AI match attempt
    logUserActivity(user.id, 'ai_job_match_attempt', {
      model: requestData.selectedModel || 'gpt-3.5-turbo',
      descriptionLength: requestData.jobDescription.length,
    });

    // TODO: Implement actual AI job matching logic here
    // For now, return a mock response
    const mockMatch = `
      <h3>AI Job Match Analysis</h3>
      <p><strong>Match Score:</strong> 85/100</p>
      
      <h4>Key Matches:</h4>
      <ul>
        <li><strong>Skills Alignment:</strong> 90% - Your technical skills closely match the job requirements</li>
        <li><strong>Experience Level:</strong> 85% - Your experience aligns well with the position level</li>
        <li><strong>Industry Fit:</strong> 80% - Good alignment with the company's industry</li>
      </ul>
      
      <h4>Strengths for This Role:</h4>
      <ul>
        <li>Strong technical background in relevant technologies</li>
        <li>Demonstrated leadership experience</li>
        <li>Proven track record of project delivery</li>
      </ul>
      
      <h4>Areas to Highlight:</h4>
      <ul>
        <li>Emphasize your experience with similar projects</li>
        <li>Highlight any relevant certifications</li>
        <li>Showcase your problem-solving abilities</li>
      </ul>
      
      <h4>Recommendations:</h4>
      <ul>
        <li>Customize your resume to include keywords from the job description</li>
        <li>Prepare specific examples of relevant achievements</li>
        <li>Research the company culture and values</li>
      </ul>
    `;

    // Log successful AI match
    logUserActivity(user.id, 'ai_job_match_completed', {
      model: requestData.selectedModel || 'gpt-3.5-turbo',
      descriptionLength: requestData.jobDescription.length,
    });

    logInfo('AI Job Match API: Match analysis completed successfully', {
      userId: user.id,
      model: requestData.selectedModel || 'gpt-3.5-turbo',
      descriptionLength: requestData.jobDescription.length,
    });

    // Return success response
    const response = NextResponse.json({
      success: true,
      result: mockMatch,
      model: requestData.selectedModel || 'gpt-3.5-turbo',
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    logError('AI Job Match API: Unexpected error', error, {
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
