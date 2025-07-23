import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/utils/user.utils";

export async function POST() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }
    
    // Get or create status records
    const statusOptions = [
      { value: "applied", label: "Applied" },
      { value: "rejected", label: "Rejected" },
      { value: "expired", label: "Expired" }
    ];
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // No need to create JobStatus records since we're using string field
    
    // Companies to choose from
    const companies = [
      { name: "Amazon", logoUrl: "https://logo.clearbit.com/amazon.com" },
      { name: "Google", logoUrl: "https://logo.clearbit.com/google.com" },
      { name: "Facebook", logoUrl: "https://logo.clearbit.com/facebook.com" },
      { name: "Netflix", logoUrl: "https://logo.clearbit.com/netflix.com" },
      { name: "Apple", logoUrl: "https://logo.clearbit.com/apple.com" }
    ];
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    
    // Get or create company
    let company = await prisma.company.findFirst({
      where: { label: randomCompany.name }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          label: randomCompany.name,
          value: randomCompany.name.toLowerCase().replace(/\s+/g, '-'), // Create a URL-friendly value
          logoUrl: randomCompany.logoUrl,
          createdBy: user.id // Add the required createdBy field
        }
      });
    }
    
    // Job titles to choose from
    const titles = [
      "Full Stack Developer",
      "Frontend Developer",
      "Backend Developer",
      "DevOps Engineer",
      "Data Scientist"
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    
    // Get or create job title
    let jobTitle = await prisma.jobTitle.findFirst({
      where: { label: randomTitle }
    });
    
    if (!jobTitle) {
      jobTitle = await prisma.jobTitle.create({
        data: { 
          label: randomTitle,
          value: randomTitle.toLowerCase().replace(/\s+/g, '-'), // Create a URL-friendly value
          createdBy: user.id // Add the required createdBy field
        }
      });
    }
    
    // Locations to choose from
    const locations = ["Remote", "San Francisco", "New York", "Seattle", "Austin"];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // Get or create location
    let location = await prisma.location.findFirst({
      where: { label: randomLocation }
    });
    
    if (!location) {
      location = await prisma.location.create({
        data: { 
          label: randomLocation,
          value: randomLocation.toLowerCase().replace(/\s+/g, '-'), // Create a URL-friendly value
          createdBy: user.id // Add the required createdBy field
        }
      });
    }
    
    // Sources to choose from
    const sources = ["Indeed", "LinkedIn", "Company Website", "Referral"];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    
    // Create a test job with all required relations
    const newJob = await prisma.job.create({
      data: {
        title: randomTitle,
        company: randomCompany.name,
        location: randomLocation,
        description: "This is a test job created via debug API",
        userId: user.id,
        createdAt: new Date(),
        appliedDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        source: randomSource,
        status: randomStatus.value,
        companyId: company.id,
        jobTitleId: jobTitle.id,
        locationId: location.id
      },
      include: {
        Company: true,
        JobTitle: true,
        Location: true
      }
    });
    
    // Revalidate dashboard paths to show the new job immediately
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/myjobs');
    
    return NextResponse.json({ 
      success: true, 
      message: "Test job created successfully",
      job: newJob
    });
  } catch (error) {
    console.error("Error creating test job:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create test job",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 