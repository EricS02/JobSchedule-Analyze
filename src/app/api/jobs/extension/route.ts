import { verifyJwtToken } from "@/lib/auth/jwt";
import prisma from "@/lib/db";
import { revalidatePath } from 'next/cache';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from 'next/server';
import { JobExtractionData, extractCompanyLogo, isValidLogoUrl } from "@/utils/job-extraction.utils";

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

// Helper function to check job tracking eligibility for a specific user
async function checkJobTrackingEligibilityForUser(userId: string): Promise<{
  isEligible: boolean;
  message: string;
  remainingJobs: number;
  plan: 'free' | 'trial' | 'pro';
  trialInfo?: {
    daysRemaining: number;
    trialEndDate: Date;
  };
}> {
  const userDB = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!userDB) {
    return {
      isEligible: false,
      message: "User not found.",
      remainingJobs: 0,
      plan: 'free',
    };
  }

  // For now, allow unlimited tracking for extension users
  // This can be enhanced later with proper subscription checks
  return {
    isEligible: true,
    message: "Unlimited job tracking via extension.",
    remainingJobs: -1, // unlimited
    plan: 'pro',
  };
}

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Content-Type', 'application/json'); // Ensure JSON content type
  return response;
}

// Enhanced logo validation function
function validateAndCleanLogoUrl(logoUrl: string | undefined, companyName: string): string | null {
  if (!logoUrl) return null;
  
  // Use the enhanced validation from job-extraction.utils
  if (!isValidLogoUrl(logoUrl, companyName)) {
    console.log(`API: Invalid logo detected for company "${companyName}": ${logoUrl}`);
    return null;
  }
  
  console.log(`API: Valid logo found for company "${companyName}": ${logoUrl}`);
  return logoUrl;
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
    console.log("API: Attempting to verify token:", token.substring(0, 20) + "...");
    const payload = await verifyJwtToken(token);
    console.log("API: Token verification result:", payload ? "Success" : "Failed");
    
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      console.log("API: Token verification failed - invalid payload");
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
    const jobData: JobExtractionData = await req.json();
    console.log("API: Received job data:", {
      jobTitle: jobData.jobTitle,
      company: jobData.company,
      location: jobData.location,
      jobUrl: jobData.jobUrl,
      hasDescription: !!jobData.description,
      hasDetailedDescription: !!jobData.detailedDescription,
      hasJobRequirements: !!jobData.jobRequirements,
      hasJobResponsibilities: !!jobData.jobResponsibilities,
      hasJobBenefits: !!jobData.jobBenefits,
      hasLogoUrl: !!jobData.logoUrl,
      logoUrl: jobData.logoUrl?.substring(0, 100) + '...',
      descriptionLength: jobData.description?.length || 0,
      detailedDescriptionLength: jobData.detailedDescription?.length || 0,
      salary: jobData.salary,
      jobType: jobData.jobType,
      experienceLevel: jobData.experienceLevel,
      remoteWork: jobData.remoteWork,
      technologies: jobData.technologies?.length || 0,
      skills: jobData.skills?.length || 0
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
    
    // Enhanced logo validation
    const validatedLogoUrl = validateAndCleanLogoUrl(jobData.logoUrl, jobData.company);
    
    // Check for duplicate job applications with improved logic
    let existingJob = null;
    
    console.log("API: Checking for duplicates with data:", {
      jobTitle: jobData.jobTitle,
      company: jobData.company,
      location: jobData.location,
      hasJobUrl: !!jobData.jobUrl,
      jobUrlLength: jobData.jobUrl?.length || 0,
      hasValidLogo: !!validatedLogoUrl
    });
    
    // First check by jobUrl if provided (most reliable)
    if (jobData.jobUrl) {
      existingJob = await prisma.job.findFirst({
        where: {
          userId: user.id,
          jobUrl: jobData.jobUrl
        },
        include: {
          jobTitle: true,
          jobsAppliedCompany: true
        }
      });
      
      if (existingJob) {
        console.log("API: Duplicate job detected by URL:", {
          existingJobId: existingJob.id,
          jobUrl: jobData.jobUrl,
          existingJobTitle: existingJob.jobTitle?.label,
          existingCompany: existingJob.jobsAppliedCompany?.label
        });
      } else {
        console.log("API: No duplicate found by URL");
      }
    }
    
    // If no match by URL, check by job title + company + location (within last 7 days instead of 30)
    if (!existingJob) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      console.log("API: Checking for duplicates by title+company+location within last 7 days");
      
      // First find the job title and company for this user
      const jobTitle = await prisma.jobTitle.findFirst({
        where: { 
          label: jobData.jobTitle,
          createdBy: user.id
        }
      });
      
      const company = await prisma.company.findFirst({
        where: { 
          label: jobData.company,
          createdBy: user.id
        }
      });
      
      console.log("API: Found job title and company:", {
        jobTitleFound: !!jobTitle,
        companyFound: !!company,
        jobTitleLabel: jobTitle?.label,
        companyLabel: company?.label
      });
      
      if (jobTitle && company) {
        existingJob = await prisma.job.findFirst({
          where: {
            userId: user.id,
            jobTitleId: jobTitle.id,
            companyId: company.id,
            location: jobData.location,
            createdAt: {
              gte: sevenDaysAgo
            }
          },
          include: {
            jobTitle: true,
            jobsAppliedCompany: true
          }
        });
        
        if (existingJob) {
          console.log("API: Duplicate job detected by title+company+location:", {
            existingJobId: existingJob.id,
            existingJobTitle: existingJob.jobTitle?.label,
            existingCompany: existingJob.jobsAppliedCompany?.label,
            existingLocation: existingJob.location,
            existingCreatedAt: existingJob.createdAt,
            newJobTitle: jobData.jobTitle,
            newCompany: jobData.company,
            newLocation: jobData.location
          });
        } else {
          console.log("API: No duplicate found by title+company+location");
        }
      } else {
        console.log("API: Could not find job title or company, skipping duplicate check");
      }
    }
    
    if (existingJob) {
      console.log("API: Duplicate job detected, updating with new information:", {
        existingJobId: existingJob.id,
        existingJobTitle: existingJob.jobTitle?.label,
        existingCompany: existingJob.jobsAppliedCompany?.label,
        existingLocation: existingJob.location,
        existingCreatedAt: existingJob.createdAt,
        hasNewLogo: !!validatedLogoUrl,
        hasNewDescription: !!jobData.description,
        hasNewRequirements: !!jobData.jobRequirements,
        hasNewResponsibilities: !!jobData.jobResponsibilities,
        hasNewBenefits: !!jobData.jobBenefits
      });
      
      // Update the existing job with new information (logo, description, etc.)
      const updatedJob = await prisma.job.update({
        where: { id: existingJob.id },
        data: {
          description: jobData.description || existingJob.description,
          detailedDescription: jobData.detailedDescription || existingJob.detailedDescription,
          jobRequirements: jobData.jobRequirements || existingJob.jobRequirements,
          jobResponsibilities: jobData.jobResponsibilities || existingJob.jobResponsibilities,
          jobBenefits: jobData.jobBenefits || existingJob.jobBenefits,
          // Enhanced fields from GitHub commit
          salary: jobData.salary || existingJob.salary,
          jobType: jobData.jobType || existingJob.jobType,
          experienceLevel: jobData.experienceLevel || existingJob.experienceLevel,
          remoteWork: jobData.remoteWork || existingJob.remoteWork,
          applicationDeadline: jobData.applicationDeadline || existingJob.applicationDeadline,
          postedDate: jobData.postedDate || existingJob.postedDate,
          companySize: jobData.companySize || existingJob.companySize,
          industry: jobData.industry || existingJob.industry,
          technologies: jobData.technologies || existingJob.technologies,
          skills: jobData.skills || existingJob.skills,
          education: jobData.education || existingJob.education,
          certifications: jobData.certifications || existingJob.certifications,
          updatedAt: new Date()
        },
        include: {
          jobTitle: true,
          jobsAppliedCompany: true
        }
      });
      
      // Also update the company logo if we have a new valid one
      if (validatedLogoUrl && existingJob.jobsAppliedCompany) {
        console.log(`API: Updating existing company logo from "${existingJob.jobsAppliedCompany.logoUrl}" to "${validatedLogoUrl}"`);
        await prisma.company.update({
          where: { id: existingJob.jobsAppliedCompany.id },
          data: { logoUrl: validatedLogoUrl }
        });
      }
      
      console.log("API: Successfully updated existing job with new information");
      
      return corsHeaders(NextResponse.json(
        { 
          success: true, 
          message: `Job updated with new information: ${updatedJob.jobTitle?.label} at ${updatedJob.jobsAppliedCompany?.label} (${updatedJob.location})`, 
          job: updatedJob,
          isUpdate: true
        },
        { status: 200 }
      ));
    }
    
    console.log("API: No duplicates found, proceeding with job creation");

    // Check job tracking eligibility (daily limits for free users)
    const eligibility = await checkJobTrackingEligibilityForUser(user.id);
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
    
    // Find or create company with enhanced logo handling
    console.log(`API: Processing company "${jobData.company}" with logo: ${validatedLogoUrl || 'NO LOGO'}`);
    
        // Find or create company for this user using findFirst and create
    const companyValue = jobData.company.toLowerCase().replace(/\s+/g, '-');
    let company = await prisma.company.findFirst({
      where: {
        value: companyValue,
        createdBy: user.id
      },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          label: jobData.company,
          value: companyValue,
          createdBy: user.id,
          logoUrl: validatedLogoUrl || null
        }
      });
    } else if (validatedLogoUrl && validatedLogoUrl !== company.logoUrl) {
      // Update logo if we have a new valid one and it's different
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          logoUrl: validatedLogoUrl,
          label: jobData.company
        }
      });
    }
    
    console.log(`API: Company processed - ID: ${company.id}, Logo: ${company.logoUrl || 'NO LOGO'}`);
    
    console.log(`API: Company processed - ID: ${company.id}, Logo: ${company.logoUrl || 'NO LOGO'}`);
    
    // Find or create location for this user using findFirst and create
    const locationValue = jobData.location.toLowerCase().replace(/\s+/g, '-');
    let location = await prisma.location.findFirst({
      where: { 
        value: locationValue,
        createdBy: user.id
      },
    });

    if (!location) {
      location = await prisma.location.create({
        data: {
          label: jobData.location,
          value: locationValue,
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
    
    // Create job with enhanced data
    console.log("API: Creating job with enhanced data:", {
      jobTitle: jobData.jobTitle,
      company: jobData.company,
      location: jobData.location,
      hasDescription: !!jobData.description,
      hasDetailedDescription: !!jobData.detailedDescription,
      hasJobRequirements: !!jobData.jobRequirements,
      hasJobResponsibilities: !!jobData.jobResponsibilities,
      hasJobBenefits: !!jobData.jobBenefits,
      jobUrl: jobData.jobUrl,
              applied: true, // Set applied to true for jobs created via extension
      salary: jobData.salary,
      jobType: jobData.jobType,
      experienceLevel: jobData.experienceLevel,
      remoteWork: jobData.remoteWork,
      technologies: jobData.technologies?.length || 0,
      skills: jobData.skills?.length || 0
    });
    
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
        source: "extension",
        // Enhanced fields from the GitHub commit
        salary: jobData.salary || null,
        jobType: jobData.jobType || null,
        experienceLevel: jobData.experienceLevel || null,
        remoteWork: jobData.remoteWork || null,
        applicationDeadline: jobData.applicationDeadline || null,
        postedDate: jobData.postedDate || null,
        companySize: jobData.companySize || null,
        industry: jobData.industry || null,
        technologies: jobData.technologies || [],
        skills: jobData.skills || [],
        education: jobData.education || null,
        certifications: jobData.certifications || []
      }
    });
    
    // After creating the job
    console.log("API: Job created successfully:", {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      hasDescription: !!job.description,
      hasDetailedDescription: !!job.detailedDescription,
      hasJobRequirements: !!job.jobRequirements,
      hasJobResponsibilities: !!job.jobResponsibilities,
      hasJobBenefits: !!job.jobBenefits,
      jobUrl: job.jobUrl,
      applied: job.applied,
      createdAt: job.createdAt
    });
    
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