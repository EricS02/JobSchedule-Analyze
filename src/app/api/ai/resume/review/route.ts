import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/user.utils";
import { logInfo, logError, logUserActivity } from "@/lib/logger";
import { sanitizeInput, logSecurityEvent } from "@/lib/api-security";
import { checkSubscriptionStatus } from "@/actions/stripe.actions";

export async function POST(request: NextRequest) {
  try {
    // Log incoming request
    logInfo('AI Resume Review API: Processing review request', {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    });

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      logSecurityEvent('Unauthenticated AI review attempt', {
        ip: request.ip || request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check subscription status for AI features
    const subscription = await checkSubscriptionStatus();
    if (!subscription.hasActiveSubscription) {
      logUserActivity(user.id, 'ai_feature_denied_no_subscription', {
        feature: 'resume_review',
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
      if (!requestData.resumeText || typeof requestData.resumeText !== 'string') {
        logError('AI Resume Review API: Missing or invalid resume text', null, {
          userId: user.id,
          hasResumeText: !!requestData.resumeText,
          resumeTextType: typeof requestData.resumeText,
        });
        return NextResponse.json(
          { success: false, message: "Resume text is required" },
          { status: 400 }
        );
      }

      // Validate resume text length
      if (requestData.resumeText.length > 10000) {
        logSecurityEvent('Resume text too long', {
          userId: user.id,
          textLength: requestData.resumeText.length,
          maxLength: 10000,
        });
        return NextResponse.json(
          { success: false, message: "Resume text too long (max 10,000 characters)" },
          { status: 400 }
        );
      }

      // Validate AI model
      const allowedModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet'];
      if (requestData.selectedModel && !allowedModels.includes(requestData.selectedModel)) {
        logSecurityEvent('Invalid AI model requested', {
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
      logError('AI Resume Review API: Failed to parse request body', parseError, {
        userId: user.id,
      });
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    // Log AI review attempt
    logUserActivity(user.id, 'ai_resume_review_attempt', {
      model: requestData.selectedModel || 'gpt-3.5-turbo',
      textLength: requestData.resumeText.length,
    });

    // TODO: Implement actual AI review logic here
    // For now, return a mock response
    const mockReview = `
      <h3>AI Resume Review Results</h3>
      <p><strong>Overall Assessment:</strong> Your resume shows good structure and relevant experience.</p>
      
      <h4>Strengths:</h4>
      <ul>
        <li>Clear and concise writing style</li>
        <li>Good use of action verbs</li>
        <li>Relevant experience highlighted</li>
      </ul>
      
      <h4>Areas for Improvement:</h4>
      <ul>
        <li>Consider adding more quantifiable achievements</li>
        <li>Ensure consistent formatting throughout</li>
        <li>Include relevant keywords for your target industry</li>
      </ul>
      
      <h4>Recommendations:</h4>
      <ul>
        <li>Add specific metrics and numbers where possible</li>
        <li>Tailor content to specific job descriptions</li>
        <li>Consider adding a professional summary section</li>
      </ul>
    `;

    // Log successful AI review
    logUserActivity(user.id, 'ai_resume_review_completed', {
      model: requestData.selectedModel || 'gpt-3.5-turbo',
      textLength: requestData.resumeText.length,
    });

    logInfo('AI Resume Review API: Review completed successfully', {
      userId: user.id,
      model: requestData.selectedModel || 'gpt-3.5-turbo',
      textLength: requestData.resumeText.length,
    });

    // Return success response
    const response = NextResponse.json({
      success: true,
      result: mockReview,
      model: requestData.selectedModel || 'gpt-3.5-turbo',
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    logError('AI Resume Review API: Unexpected error', error, {
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
