import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth/jwt";
import prisma from "@/lib/db";
import { revalidatePath } from 'next/cache';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Content-Type', 'application/json'); // Ensure JSON content type
  return response;
}

export async function POST(req: NextRequest) {
  console.log("API: Received request to /api/jobs/extension");
  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return corsHeaders(NextResponse.json(
        { success: false, message: "Missing or invalid authorization header" },
        { status: 401 }
      ));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const { verifyJwtToken } = await import("@/lib/auth/jwt");
    const payload = await verifyJwtToken(token);
    
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      return corsHeaders(NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      ));
    }

    const userId = payload.userId as string;
    if (!userId) {
      return corsHeaders(NextResponse.json(
        { success: false, message: "Invalid token - no user ID" },
        { status: 401 }
      ));
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return corsHeaders(NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      ));
    }
    
    console.log(`API: Using authenticated user: ${user.email}`);
    
    // Get job data from request
    const jobData = await req.json();
    console.log("API: Received job data:", {
      jobTitle: jobData.jobTitle,
      company: jobData.company,
      location: jobData.location,
      jobUrl: jobData.jobUrl,
      hasDescription: !!jobData.description,
      hasLogoUrl: !!jobData.logoUrl
    });
    
    // Validate job data
    if (!jobData.jobTitle || !jobData.company || !jobData.location) {
      return corsHeaders(NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields", 
          requiredFields: ['jobTitle', 'company', 'location'] 
        },
        { status: 400 }
      ));
    }
    
    // Check for duplicate job applications with improved logic
    let existingJob = null;
    
    // First check by jobUrl if provided
    if (jobData.jobUrl) {
      existingJob = await prisma.job.findFirst({
        where: {
          userId: user.id,
          jobUrl: jobData.jobUrl
        }
      });
    }
    
    // If no match by URL, check by job title + company + location (within last 30 days)
    if (!existingJob) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // First find the job title and company
      const jobTitle = await prisma.jobTitle.findFirst({
        where: { label: jobData.jobTitle }
      });
      
      const company = await prisma.company.findFirst({
        where: { label: jobData.company }
      });
      
      if (jobTitle && company) {
        existingJob = await prisma.job.findFirst({
          where: {
            userId: user.id,
            jobTitleId: jobTitle.id,
            companyId: company.id,
            location: jobData.location,
            createdAt: {
              gte: thirtyDaysAgo
            }
          },
          include: {
            jobTitle: true,
            company: true
          }
        });
      }
    }
    
    if (existingJob) {
      console.log("API: Duplicate job detected:", {
        existingJobId: existingJob.id,
        existingJobTitle: existingJob.jobTitle?.label,
        existingCompany: existingJob.company?.label,
        existingLocation: existingJob.location,
        existingCreatedAt: existingJob.createdAt
      });
      
      return corsHeaders(NextResponse.json(
        { 
          success: false, 
          message: `You've already tracked this job: ${existingJob.jobTitle?.label} at ${existingJob.company?.label} (${existingJob.location})`, 
          job: existingJob,
          duplicateDetails: {
            jobTitle: existingJob.jobTitle?.label,
            company: existingJob.company?.label,
            location: existingJob.location,
            trackedAt: existingJob.createdAt
          }
        },
        { status: 409 }
      ));
    }

    // Check job tracking eligibility (daily limits for free users)
    const { checkJobTrackingEligibility } = await import("@/actions/stripe.actions");
    const eligibility = await checkJobTrackingEligibility();
    console.log("API: Job tracking eligibility:", eligibility);
    
    if (!eligibility.isEligible) {
      return corsHeaders(NextResponse.json(
        { 
          success: false, 
          message: eligibility.message,
          remainingJobs: eligibility.remainingJobs
        },
        { status: 403 }
      ));
    }
    
    // Find or create job title
    const jobTitle = await prisma.jobTitle.upsert({
      where: { value: jobData.jobTitle.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { 
        label: jobData.jobTitle,
        value: jobData.jobTitle.toLowerCase().replace(/\s+/g, '-'),
        createdBy: user.id
      }
    });
    
    // Find or create company with logo
    console.log(`API: Processing company "${jobData.company}" with logo: ${jobData.logoUrl || 'NO LOGO'}`);
    
    // Use the logo URL as-is (LinkedIn URLs should not be modified)
    let cleanLogoUrl = jobData.logoUrl;
    if (cleanLogoUrl) {
      console.log("API: Using logo URL as-is:", cleanLogoUrl);
    }
    
    // Log the company and logo for debugging
    console.log(`API: Processing company "${jobData.company}" with logo: ${cleanLogoUrl || 'NO LOGO'}`);
    
    // Check if company exists and update logo if different
    const existingCompany = await prisma.company.findUnique({
      where: { value: jobData.company.toLowerCase().replace(/\s+/g, '-') }
    });
    
    let company;
    if (existingCompany) {
      // Always update the logo to ensure we have the latest one
      console.log(`API: Updating company "${jobData.company}" logo from "${existingCompany.logoUrl}" to "${cleanLogoUrl}"`);
      company = await prisma.company.update({
        where: { id: existingCompany.id },
        data: {
          logoUrl: cleanLogoUrl || null,
        label: jobData.company
        }
      });
    } else {
      // Create new company
      console.log(`API: Creating new company "${jobData.company}" with logo: "${cleanLogoUrl}"`);
      company = await prisma.company.create({
        data: {
        label: jobData.company,
        value: jobData.company.toLowerCase().replace(/\s+/g, '-'),
        createdBy: user.id,
          logoUrl: cleanLogoUrl || null
      }
    });
    }
    
    console.log(`API: Company processed - ID: ${company.id}, Logo: ${company.logoUrl || 'NO LOGO'}`);
    
    // Find or create location
    let location = await prisma.location.findFirst({
      where: { value: jobData.location.toLowerCase().replace(/\s+/g, '-') }
    });
    
    if (!location) {
      location = await prisma.location.create({
        data: { 
          label: jobData.location,
          value: jobData.location.toLowerCase().replace(/\s+/g, '-'),
          createdBy: user.id
        }
      });
    }
    
    // Get job source
    const jobSource = await prisma.jobSource.findFirst({
      where: { value: 'linkedin' }
    });
    
    if (!jobSource) {
      return corsHeaders(NextResponse.json(
        { success: false, message: "Job source 'linkedin' not found" },
        { status: 500 }
      ));
    }
    
    // No need to fetch job status since we're using string field
    
    // Create job
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        title: jobData.jobTitle || "Untitled Job",
        description: jobData.description || "No description provided",
        detailedDescription: jobData.detailedDescription || null,
        jobRequirements: jobData.jobRequirements || null,
        jobResponsibilities: jobData.jobResponsibilities || null,
        jobBenefits: jobData.jobBenefits || null,
        company: jobData.company,
        location: jobData.location,
        status: "applied",
        applied: true, // Set applied to true for jobs created via extension
        createdAt: new Date(),
        updatedAt: new Date(),
        jobTitleId: jobTitle.id,
        companyId: company.id,
        locationId: location.id,
        jobSourceId: jobSource.id,
        jobUrl: jobData.jobUrl || null,
        source: "extension"
      }
    });
    
    // After creating the job
    console.log("API: Job created successfully:", job);
    
    // Revalidate multiple paths to ensure all related pages update
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/myjobs');
    revalidatePath('/', 'layout'); // Revalidate the entire layout
    
    // Add timestamp to localStorage to trigger client-side refresh
    // This will be picked up by the DashboardWrapper component
    const response = corsHeaders(NextResponse.json({
      success: true,
      message: "Job application tracked successfully",
      job,
      timestamp: new Date().toISOString()
    }));
    
    // Add custom header to indicate a job was created
    response.headers.set('X-Job-Created', 'true');
    response.headers.set('X-Job-Id', job.id);
    
    return response;
  } catch (error) {
    console.error("API: Error creating job:", error);
    const isProd = process.env.NODE_ENV === 'production';
    return corsHeaders(NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        ...(isProd ? {} : { error })
      },
      { status: 500 }
    ));
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return corsHeaders(response);
} 