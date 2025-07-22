"use server";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";
import { AddJobFormSchema } from "@/models/addJobForm.schema";
import { JOB_TYPES, JobStatus } from "@/models/job.model";
import { getCurrentUser } from "@/utils/user.utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const getStatusList = async (): Promise<any | undefined> => {
  try {
    // Return static status list since we're using string field now
    const statuses = [
      { id: "applied", label: "Applied", value: "applied" },
      { id: "interview", label: "Interview", value: "interview" },
      { id: "offer", label: "Offer", value: "offer" },
      { id: "rejected", label: "Rejected", value: "rejected" },
      { id: "accepted", label: "Accepted", value: "accepted" },
      { id: "declined", label: "Declined", value: "declined" },
      { id: "saved", label: "Saved", value: "saved" },
      { id: "draft", label: "Draft", value: "draft" },
      { id: "expired", label: "Expired", value: "expired" },
      { id: "archived", label: "Archived", value: "archived" }
    ];
    return statuses;
  } catch (error) {
    const msg = "Failed to fetch status list. ";
    return handleError(error, msg);
  }
};

export const getJobSourceList = async (): Promise<any | undefined> => {
  try {
    const list = await prisma.jobSource.findMany();
    return list;
  } catch (error) {
    const msg = "Failed to fetch job source list. ";
    return handleError(error, msg);
  }
};

export const getJobsList = async (
  page = 1,
  limit = 10,
  filter?: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    const skip = (page - 1) * limit;

    const filterBy = filter
      ? filter === Object.keys(JOB_TYPES)[1]
        ? {
            type: filter,
          }
        : {
            status: filter,
          }
      : {};
    const [data, total] = await Promise.all([
      prisma.job.findMany({
        where: {
          userId: user.id,
          ...filterBy,
        },
        skip,
        take: limit,
        include: {
          jobsAppliedSource: true,
          jobTitle: true,
          jobsAppliedCompany: true,
          jobsAppliedLocation: true,
          resume: {
            include: {
              File: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.job.count({
        where: {
          userId: user.id,
          ...filterBy,
        },
      }),
    ]);
    
    // Transform the data to match the component expectations
    const transformedData = data.map(job => ({
      ...job,
      JobTitle: job.jobTitle || { label: job.title },
      Company: job.jobsAppliedCompany || { label: job.company },
      Status: { id: job.status, label: job.status, value: job.status },
      Location: job.jobsAppliedLocation || { label: job.location },
      JobSource: job.jobsAppliedSource,
      appliedDate: job.createdAt, // Use createdAt as appliedDate for jobs from extension
      Resume: job.resume
    }));
    
    return { success: true, data: transformedData, total };
  } catch (error) {
    const msg = "Failed to fetch jobs list. ";
    return handleError(error, msg);
  }
};

export async function* getJobsIterator(filter?: string, pageSize = 200) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  let page = 1;
  let fetchedCount = 0;

  while (true) {
    const skip = (page - 1) * pageSize;
    const filterBy = filter
      ? filter === Object.keys(JOB_TYPES)[1]
        ? { status: filter }
        : { type: filter }
      : {};

    const chunk = await prisma.job.findMany({
      where: {
        userId: user.id,
        ...filterBy,
      },
      include: {
        jobsAppliedSource: true,
        jobTitle: true,
        jobsAppliedCompany: true,
        jobsAppliedLocation: true,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    if (!chunk.length) {
      break;
    }

    // Transform the data to match the component expectations
    const transformedChunk = chunk.map(job => ({
      ...job,
      JobTitle: job.jobTitle || { label: job.title },
      Company: job.jobsAppliedCompany || { label: job.company },
      Status: { id: job.status, label: job.status, value: job.status },
      Location: job.jobsAppliedLocation || { label: job.location },
      JobSource: job.jobsAppliedSource,
      appliedDate: job.createdAt,
    }));

    yield transformedChunk;
    fetchedCount += chunk.length;
    page++;
  }
}

export const getJobDetails = async (
  jobId: string
): Promise<any | undefined> => {
  try {
    if (!jobId) {
      throw new Error("Please provide job id");
    }
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        jobsAppliedSource: true,
        jobTitle: true,
        jobsAppliedCompany: true,
        jobsAppliedLocation: true,
        resume: {
          include: {
            File: true,
          },
        },
      },
    });
    
    if (!job) {
      throw new Error("Job not found");
    }
    
    // Transform the data to match the component expectations
    const transformedJob = {
      ...job,
      JobTitle: job.jobTitle || { label: job.title },
      Company: job.jobsAppliedCompany || { label: job.company },
      Status: { id: job.status, label: job.status, value: job.status },
      Location: job.jobsAppliedLocation || { label: job.location },
      JobSource: job.jobsAppliedSource,
      appliedDate: job.createdAt,
      Resume: job.resume
    };
    
    return { job: transformedJob, success: true };
  } catch (error) {
    const msg = "Failed to fetch job details. ";
    return handleError(error, msg);
  }
};

export const createLocation = async (
  label: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const value = label.trim().toLowerCase();

    if (!value) {
      throw new Error("Please provide location name");
    }

    const location = await prisma.location.create({
      data: { label, value, createdBy: user.id },
    });

    return { data: location, success: true };
  } catch (error) {
    const msg = "Failed to create job location. ";
    return handleError(error, msg);
  }
};

export const addJob = async (
  data: z.infer<typeof AddJobFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check subscription eligibility before adding job
    const { checkJobTrackingEligibility } = await import('@/actions/stripe.actions');
    const eligibility = await checkJobTrackingEligibility();
    
    if (!eligibility.isEligible) {
      return { 
        success: false, 
        error: eligibility.message,
        requiresUpgrade: true 
      };
    }

    const {
      title,
      company,
      location,
      type,
      source,
      dueDate,
      dateApplied,
      jobDescription,
      jobUrl,
      applied,
      resume,
      jobTitleId,
      companyId,
      locationId: providedLocationId,
    } = data;

    // Find or create the job title record
    let finalJobTitleId: string | undefined;
    if (jobTitleId && typeof jobTitleId === 'string' && jobTitleId.trim()) {
      // If a specific job title ID was provided, use it
      finalJobTitleId = jobTitleId;
    } else if (title && typeof title === 'string' && title.trim()) {
      const titleValue = title.trim().toLowerCase().replace(/\s+/g, '-');
      const existingJobTitle = await prisma.jobTitle.findFirst({
        where: {
          value: titleValue,
          createdBy: user.id,
        },
      });

      if (existingJobTitle) {
        finalJobTitleId = existingJobTitle.id;
      } else {
        // Create new job title
        const newJobTitle = await prisma.jobTitle.create({
          data: {
            label: title.trim(),
            value: titleValue,
            createdBy: user.id,
          },
        });
        finalJobTitleId = newJobTitle.id;
      }
    }

    // Find or create the company record
    let finalCompanyId: string | undefined;
    if (companyId && typeof companyId === 'string' && companyId.trim()) {
      // If a specific company ID was provided, use it
      finalCompanyId = companyId;
    } else if (company && typeof company === 'string' && company.trim()) {
      const companyValue = company.trim().toLowerCase().replace(/\s+/g, '-');
      const existingCompany = await prisma.company.findFirst({
        where: {
          value: companyValue,
          createdBy: user.id,
        },
      });

      if (existingCompany) {
        finalCompanyId = existingCompany.id;
      } else {
        // Create new company
        const newCompany = await prisma.company.create({
          data: {
            label: company.trim(),
            value: companyValue,
            createdBy: user.id,
          },
        });
        finalCompanyId = newCompany.id;
      }
    }

    // Find or create the location record
    let finalLocationId: string | undefined;
    if (providedLocationId && typeof providedLocationId === 'string' && providedLocationId.trim()) {
      // If a specific location ID was provided, use it
      finalLocationId = providedLocationId;
    } else if (location && typeof location === 'string' && location.trim()) {
      const locationValue = location.trim().toLowerCase().replace(/\s+/g, '-');
      const existingLocation = await prisma.location.findFirst({
        where: {
          value: locationValue,
          createdBy: user.id,
        },
      });

      if (existingLocation) {
        finalLocationId = existingLocation.id;
      } else {
        // Create new location
        const newLocation = await prisma.location.create({
          data: {
            label: location.trim(),
            value: locationValue,
            createdBy: user.id,
          },
        });
        finalLocationId = newLocation.id;
      }
    }

    const job = await prisma.job.create({
      data: {
        title: (typeof data.title === 'string' && data.title.trim()) ? data.title : "Untitled Job",
        company: (typeof data.company === 'string' && data.company.trim()) ? data.company : "Unknown Company",
        location: (typeof data.location === 'string' && data.location.trim()) ? data.location : "Remote",
        jobTitleId: finalJobTitleId,
        companyId: finalCompanyId,
        locationId: finalLocationId,
        status: data.status || "applied",
        applied: data.status === "applied" || data.applied || false, // Set applied to true if status is "applied"
        jobSourceId: data.source,
        createdAt: new Date(),
        description: data.jobDescription,
        userId: user.id,
        jobUrl,
        resumeId: resume,
      },
    });
    
    // Comprehensive revalidation for dashboard updates
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/myjobs');
    revalidatePath('/dashboard/admin');
    revalidatePath('/', 'layout');
    
    return { job, success: true };
  } catch (error) {
    const msg = "Failed to create job. ";
    return handleError(error, msg);
  }
};

export const updateJob = async (
  data: z.infer<typeof AddJobFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    if (!data.id || user.id != data.userId) {
      throw new Error("Id is not provide or no user privilages");
    }

    const {
      title,
      company,
      location,
      type,
      source,
      dueDate,
      dateApplied,
      jobDescription,
      jobUrl,
      applied,
      resume,
      jobTitleId,
      companyId,
      locationId: providedLocationId,
    } = data;

    // Find or create the job title record
    let finalJobTitleId: string | undefined;
    if (jobTitleId && typeof jobTitleId === 'string' && jobTitleId.trim()) {
      // If a specific job title ID was provided, use it
      finalJobTitleId = jobTitleId;
    } else if (title && typeof title === 'string' && title.trim()) {
      const titleValue = title.trim().toLowerCase().replace(/\s+/g, '-');
      const existingJobTitle = await prisma.jobTitle.findFirst({
        where: {
          value: titleValue,
          createdBy: user.id,
        },
      });

      if (existingJobTitle) {
        finalJobTitleId = existingJobTitle.id;
      } else {
        // Create new job title
        const newJobTitle = await prisma.jobTitle.create({
          data: {
            label: title.trim(),
            value: titleValue,
            createdBy: user.id,
          },
        });
        finalJobTitleId = newJobTitle.id;
      }
    }

    // Find or create the company record
    let finalCompanyId: string | undefined;
    if (companyId && typeof companyId === 'string' && companyId.trim()) {
      // If a specific company ID was provided, use it
      finalCompanyId = companyId;
    } else if (company && typeof company === 'string' && company.trim()) {
      const companyValue = company.trim().toLowerCase().replace(/\s+/g, '-');
      const existingCompany = await prisma.company.findFirst({
        where: {
          value: companyValue,
          createdBy: user.id,
        },
      });

      if (existingCompany) {
        finalCompanyId = existingCompany.id;
      } else {
        // Create new company
        const newCompany = await prisma.company.create({
          data: {
            label: company.trim(),
            value: companyValue,
            createdBy: user.id,
          },
        });
        finalCompanyId = newCompany.id;
      }
    }

    // Find or create the location record
    let finalLocationId: string | undefined;
    if (providedLocationId && typeof providedLocationId === 'string' && providedLocationId.trim()) {
      // If a specific location ID was provided, use it
      finalLocationId = providedLocationId;
    } else if (location && typeof location === 'string' && location.trim()) {
      const locationValue = location.trim().toLowerCase().replace(/\s+/g, '-');
      const existingLocation = await prisma.location.findFirst({
        where: {
          value: locationValue,
          createdBy: user.id,
        },
      });

      if (existingLocation) {
        finalLocationId = existingLocation.id;
      } else {
        // Create new location
        const newLocation = await prisma.location.create({
          data: {
            label: location.trim(),
            value: locationValue,
            createdBy: user.id,
          },
        });
        finalLocationId = newLocation.id;
      }
    }

    const updateData = {
      title: (typeof data.title === 'string' && data.title.trim()) ? data.title : "Untitled Job",
      company: (typeof data.company === 'string' && data.company.trim()) ? data.company : "Unknown Company",
      location: (typeof data.location === 'string' && data.location.trim()) ? data.location : "Remote",
      jobTitleId: finalJobTitleId,
      companyId: finalCompanyId,
      locationId: finalLocationId,
      status: data.status || "applied",
      applied: data.status === "applied" || data.applied || false, // Set applied to true if status is "applied"
      jobSourceId: data.source,
      createdAt: new Date(),
      description: data.jobDescription,
      jobUrl: data.jobUrl,
      resumeId: data.resume,
    };

    const job = await prisma.job.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });
    
    // Comprehensive revalidation for dashboard updates
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/myjobs');
    revalidatePath('/dashboard/admin');
    revalidatePath('/', 'layout');
    
    return { job, success: true };
  } catch (error) {
    const msg = "Failed to update job. ";
    return handleError(error, msg);
  }
};

export const updateJobStatus = async (
  jobId: string,
  status: JobStatus
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    const dataToUpdate = () => {
      switch (status.value) {
        case "applied":
          return {
            status: status.value,
            applied: true,
            appliedDate: new Date(),
          };
        case "interview":
          return {
            status: status.value,
            applied: true,
          };
        default:
          return {
            status: status.value,
          };
      }
    };

    const job = await prisma.job.update({
      where: {
        id: jobId,
        userId: user.id,
      },
      data: dataToUpdate(),
    });
    
    // Comprehensive revalidation for dashboard updates
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/myjobs');
    revalidatePath('/', 'layout');
    
    return { job, success: true };
  } catch (error) {
    const msg = "Failed to update job status.";
    return handleError(error, msg);
  }
};

export const deleteJobById = async (
  jobId: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const res = await prisma.job.delete({
      where: {
        id: jobId,
        userId: user.id,
      },
    });
    
    // Comprehensive revalidation for dashboard updates
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/myjobs');
    revalidatePath('/', 'layout');
    
    return { res, success: true };
  } catch (error) {
    const msg = "Failed to delete job.";
    return handleError(error, msg);
  }
};

export const fixJobRelations = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get all jobs for the user that don't have proper relations
    const jobsToFix = await prisma.job.findMany({
      where: {
        userId: user.id,
        OR: [
          { jobTitleId: null },
          { companyId: null },
          { locationId: null }
        ]
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        jobTitleId: true,
        companyId: true,
        locationId: true,
      }
    });

    let fixedCount = 0;

    for (const job of jobsToFix) {
      const updates: any = {};

      // Fix job title relation
      if (!job.jobTitleId && job.title) {
        const titleValue = job.title.trim().toLowerCase().replace(/\s+/g, '-');
        let jobTitle = await prisma.jobTitle.findFirst({
          where: {
            value: titleValue,
            createdBy: user.id,
          },
        });

        if (!jobTitle) {
          jobTitle = await prisma.jobTitle.create({
            data: {
              label: job.title.trim(),
              value: titleValue,
              createdBy: user.id,
            },
          });
        }
        updates.jobTitleId = jobTitle.id;
      }

      // Fix company relation
      if (!job.companyId && job.company) {
        const companyValue = job.company.trim().toLowerCase().replace(/\s+/g, '-');
        let company = await prisma.company.findFirst({
          where: {
            value: companyValue,
            createdBy: user.id,
          },
        });

        if (!company) {
          company = await prisma.company.create({
            data: {
              label: job.company.trim(),
              value: companyValue,
              createdBy: user.id,
            },
          });
        }
        updates.companyId = company.id;
      }

      // Fix location relation
      if (!job.locationId && job.location) {
        const locationValue = job.location.trim().toLowerCase().replace(/\s+/g, '-');
        let location = await prisma.location.findFirst({
          where: {
            value: locationValue,
            createdBy: user.id,
          },
        });

        if (!location) {
          location = await prisma.location.create({
            data: {
              label: job.location.trim(),
              value: locationValue,
              createdBy: user.id,
            },
          });
        }
        updates.locationId = location.id;
      }

      // Update the job if there are any changes
      if (Object.keys(updates).length > 0) {
        await prisma.job.update({
          where: { id: job.id },
          data: updates,
        });
        fixedCount++;
      }
    }

    // Revalidate paths to update the UI
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/myjobs');
    revalidatePath('/dashboard/admin');
    revalidatePath('/', 'layout');

    return { 
      success: true, 
      message: `Fixed ${fixedCount} jobs`, 
      fixedCount,
      totalJobsChecked: jobsToFix.length 
    };
  } catch (error) {
    const msg = "Failed to fix job relations. ";
    return handleError(error, msg);
  }
};

export const ensureUserJobRelationships = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    console.log(`Ensuring job relationships for user: ${user.id}`);

    // Get all jobs for the user that might need fixing
    const jobsToFix = await prisma.job.findMany({
      where: {
        userId: user.id,
        OR: [
          { locationId: null },
          { companyId: null },
          { jobTitleId: null }
          // Removed { applied: null } because Prisma boolean fields cannot be queried for null
        ]
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        status: true,
        applied: true,
        locationId: true,
        companyId: true,
        jobTitleId: true
      }
    });

    console.log(`Found ${jobsToFix.length} jobs that need relationship fixing`);

    let fixedCount = 0;

    for (const job of jobsToFix) {
      const updates: any = {};

      // Fix applied field if it's null
      if (job.applied === null) {
        updates.applied = job.status === "applied" || job.status === "interview" || job.status === "offer";
        console.log(`Job ${job.id}: Setting applied to ${updates.applied} based on status ${job.status}`);
      }

      // Fix job title relationship
      if (!job.jobTitleId && job.title) {
        const titleValue = job.title.trim().toLowerCase().replace(/\s+/g, '-');
        let jobTitle = await prisma.jobTitle.findFirst({
          where: {
            value: titleValue,
            createdBy: user.id,
          },
        });

        if (!jobTitle) {
          jobTitle = await prisma.jobTitle.create({
            data: {
              label: job.title.trim(),
              value: titleValue,
              createdBy: user.id,
            },
          });
          console.log(`Job ${job.id}: Created new job title: ${jobTitle.label}`);
        }
        updates.jobTitleId = jobTitle.id;
      }

      // Fix company relationship
      if (!job.companyId && job.company) {
        const companyValue = job.company.trim().toLowerCase().replace(/\s+/g, '-');
        let company = await prisma.company.findFirst({
          where: {
            value: companyValue,
            createdBy: user.id,
          },
        });

        if (!company) {
          company = await prisma.company.create({
            data: {
              label: job.company.trim(),
              value: companyValue,
              createdBy: user.id,
            },
          });
          console.log(`Job ${job.id}: Created new company: ${company.label}`);
        }
        updates.companyId = company.id;
      }

      // Fix location relationship
      if (!job.locationId && job.location) {
        const locationValue = job.location.trim().toLowerCase().replace(/\s+/g, '-');
        let location = await prisma.location.findFirst({
          where: {
            value: locationValue,
            createdBy: user.id,
          },
        });

        if (!location) {
          location = await prisma.location.create({
            data: {
              label: job.location.trim(),
              value: locationValue,
              createdBy: user.id,
            },
          });
          console.log(`Job ${job.id}: Created new location: ${location.label}`);
        }
        updates.locationId = location.id;
      }

      // Update the job if there are any changes
      if (Object.keys(updates).length > 0) {
        await prisma.job.update({
          where: { id: job.id },
          data: updates,
        });
        fixedCount++;
        console.log(`Job ${job.id}: Updated with ${Object.keys(updates).length} fixes`);
      }
    }

    // Revalidate paths to update the UI
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/myjobs');
    revalidatePath('/dashboard/admin');
    revalidatePath('/', 'layout');

    console.log(`Fixed ${fixedCount} job relationships for user ${user.id}`);

    return { 
      success: true, 
      message: `Fixed ${fixedCount} job relationships`, 
      fixedCount,
      totalJobsChecked: jobsToFix.length 
    };
  } catch (error) {
    const msg = "Failed to ensure job relationships. ";
    return handleError(error, msg);
  }
};
