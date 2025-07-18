"use server";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";
import { getCurrentUser } from "@/utils/user.utils";
import { revalidatePath } from "next/cache";

// Function to fix job-location relationships
export const fixJobLocationRelationships = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get all jobs for the user that don't have a locationId
    const allJobs = await prisma.job.findMany({
      where: {
        userId: user.id,
        locationId: null
      },
      select: {
        id: true,
        location: true
      }
    });

    console.log('=== FIX FUNCTION DEBUG ===');
    console.log(`Found ${allJobs.length} jobs without locationId`);
    console.log('Jobs without locationId:', allJobs);

    // Also check total jobs for this user
    const totalJobs = await prisma.job.count({
      where: {
        userId: user.id
      }
    });

    let fixedCount = 0;

    // Filter and process jobs with valid location strings
    for (const job of allJobs) {
      console.log(`Processing job ${job.id}: location = "${job.location}"`);
      if (job.location && job.location.trim() && job.location.trim().length > 0) {
        // Find or create location record
        const locationValue = job.location.trim().toLowerCase().replace(/\s+/g, '-');
        console.log(`Looking for location with value: "${locationValue}"`);
        
        let location = await prisma.location.findFirst({
          where: {
            value: locationValue,
            createdBy: user.id,
          },
        });

        if (!location) {
          console.log(`Creating new location: "${job.location.trim()}" with value: "${locationValue}"`);
          // Create new location
          location = await prisma.location.create({
            data: {
              label: job.location.trim(),
              value: locationValue,
              createdBy: user.id,
            },
          });
        } else {
          console.log(`Found existing location: "${location.label}"`);
        }

        console.log(`Updating job ${job.id} with locationId: ${location.id}`);
        // Update job with locationId
        await prisma.job.update({
          where: { id: job.id },
          data: { locationId: location.id }
        });

        fixedCount++;
        console.log(`Fixed job ${job.id} - Total fixed: ${fixedCount}`);
      } else {
        console.log(`Skipping job ${job.id} - no valid location string`);
      }
    }

    if (fixedCount > 0) {
      console.log(`Fixed ${fixedCount} job-location relationships`);
    } else {
      console.log(`All ${totalJobs} jobs already have proper location relationships`);
    }
    
    // Revalidate paths to update the UI
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard');
    
    return { success: true, fixedCount, totalJobs };
  } catch (error) {
    const msg = "Failed to fix job-location relationships. ";
    return handleError(error, msg);
  }
};

// Function to fix existing jobs that should have applied=true
export const fixAppliedJobsForLocations = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Update all jobs with status "applied" to have applied=true
    const result = await prisma.job.updateMany({
      where: {
        userId: user.id,
        status: "applied",
        applied: false
      },
      data: {
        applied: true
      }
    });

    console.log(`Fixed ${result.count} jobs to have applied=true for locations`);
    
    // Revalidate paths to update the UI
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard');
    
    return { success: true, count: result.count };
  } catch (error) {
    const msg = "Failed to fix applied jobs for locations. ";
    return handleError(error, msg);
  }
};

export const getAllJobLocations = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get all locations for the user with job counts
    const locations = await prisma.location.findMany({
      where: {
        createdBy: user.id,
      },
      select: {
        id: true,
        label: true,
        value: true,
        _count: {
          select: {
            jobsApplied: true,
            workExperience: true,
          },
        },
      },
    });

    return locations;
  } catch (error) {
    const msg = "Failed to fetch job location list. ";
    return handleError(error, msg);
  }
};

export const getJobLocationsList = async (
  page = 1,
  limit = 10,
  countBy?: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    
    console.log('User ID being used:', user.id);
    
    // Check if user has any jobs at all
    const totalJobsForUser = await prisma.job.count({
      where: {
        userId: user.id
      }
    });
    
    console.log('=== LOCATION DEBUG START ===');
    console.log('User ID:', user.id);
    console.log('Total jobs for user:', totalJobsForUser);
    
    // Check all jobs and their status
    const allJobs = await prisma.job.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        locationId: true,
        status: true,
        applied: true
      }
    });
    
    console.log('All jobs for user:', allJobs);
    
    // Check how many jobs have locationId vs just location string
    const jobsWithLocationId = allJobs.filter(job => job.locationId);
    const jobsWithLocationString = allJobs.filter(job => job.location && !job.locationId);
    
    console.log(`Jobs with locationId: ${jobsWithLocationId.length}`);
    console.log(`Jobs with location string only: ${jobsWithLocationString.length}`);
    
    const skip = (page - 1) * limit;

    // Get all locations for the user that have jobs linked to them
    const locationsWithJobs = await prisma.location.findMany({
      where: {
        createdBy: user.id,
        jobsApplied: {
          some: {
            userId: user.id
          }
        }
      },
      skip,
      take: limit,
      select: {
        id: true,
        label: true,
        value: true,
      },
      orderBy: {
        label: "asc",
      },
    });

    console.log('Locations with jobs found:', locationsWithJobs.length);

    // If no locations with jobs found, try to get all locations for the user
    if (locationsWithJobs.length === 0) {
      console.log('No locations with jobs found, getting all locations for user');
      const allLocations = await prisma.location.findMany({
        where: {
          createdBy: user.id
        },
        skip,
        take: limit,
        select: {
          id: true,
          label: true,
          value: true,
        },
        orderBy: {
          label: "asc",
        },
      });
      
      console.log('All locations for user:', allLocations);
      
      if (allLocations.length === 0) {
        return { data: [], total: 0 };
      }
      
      // Manually count jobs for each location
      const locationsWithCounts = await Promise.all(
        allLocations.map(async (location) => {
          const jobCount = await prisma.job.count({
            where: {
              locationId: location.id,
              userId: user.id,
            },
          });

          console.log(`Location ${location.label}: ${jobCount} jobs`);

          return {
            ...location,
            _count: {
              jobsApplied: jobCount
            }
          };
        })
      );

      // Sort by job count descending
      locationsWithCounts.sort((a, b) => b._count.jobsApplied - a._count.jobsApplied);

      const total = await prisma.location.count({
        where: {
          createdBy: user.id
        },
      });

      return { data: locationsWithCounts, total };
    }

    console.log(`Found ${locationsWithJobs.length} locations with jobs`);
    
    // Manually count jobs for each location
    const locationsWithCounts = await Promise.all(
      locationsWithJobs.map(async (location) => {
        const jobCount = await prisma.job.count({
          where: {
            locationId: location.id,
            userId: user.id,
          },
        });

        console.log(`Location ${location.label}: ${jobCount} jobs`);

        return {
          ...location,
          _count: {
            jobsApplied: jobCount
          }
        };
      })
    );

    // Sort by job count descending
    locationsWithCounts.sort((a, b) => b._count.jobsApplied - a._count.jobsApplied);

    const total = await prisma.location.count({
      where: {
        createdBy: user.id,
        jobsApplied: {
          some: {
            userId: user.id
          }
        }
      },
    });

    return { data: locationsWithCounts, total };
  } catch (error) {
    const msg = "Failed to fetch job location list. ";
    return handleError(error, msg);
  }
};

// Function to update jobs applied count for all locations
export const updateJobsAppliedCountForLocations = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get all locations for the user
    const locations = await prisma.location.findMany({
      where: {
        createdBy: user.id,
      },
      select: {
        id: true,
        label: true,
      },
    });

    let totalUpdated = 0;

    // For each location, count the jobs and update if needed
    for (const location of locations) {
      const jobCount = await prisma.job.count({
        where: {
          locationId: location.id,
          userId: user.id,
        },
      });

      console.log(`Location ${location.label}: ${jobCount} jobs`);
      totalUpdated += jobCount;
    }

    // Revalidate paths to update the UI
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard');
    
    return { success: true, totalUpdated, locationsCount: locations.length };
  } catch (error) {
    const msg = "Failed to update jobs applied count for locations. ";
    return handleError(error, msg);
  }
};

// Function to fix broken location relationships (jobs with locationId that don't exist)
export const fixBrokenLocationRelationships = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    console.log('=== FIX BROKEN LOCATIONS DEBUG ===');
    console.log('User ID:', user.id);

    // Check total jobs for this user
    const totalJobs = await prisma.job.count({
      where: {
        userId: user.id
      }
    });
    console.log('Total jobs for user:', totalJobs);

    // Find all jobs for the user that have locationId values
    const jobsWithLocationId = await prisma.job.findMany({
      where: {
        userId: user.id,
        locationId: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        location: true,
        locationId: true,
      },
    });

    console.log(`Found ${jobsWithLocationId.length} jobs with locationId`);
    console.log('Jobs with locationId:', jobsWithLocationId);

    let fixedCount = 0;

    for (const job of jobsWithLocationId) {
      // Check if the location exists
      const location = await prisma.location.findUnique({
        where: {
          id: job.locationId!
        }
      });

          if (!location) {
      console.log(`Location ${job.locationId} doesn't exist for job ${job.id}`);
      
      // Create the missing location record
      if (job.location && job.location.trim()) {
        const locationValue = job.location.trim().toLowerCase().replace(/\s+/g, '-');
        
        const newLocation = await prisma.location.create({
          data: {
            label: job.location.trim(),
            value: locationValue,
            createdBy: user.id,
          },
        });

        console.log(`Created location: ${newLocation.label} (${newLocation.id})`);
        fixedCount++;
      } else {
        // Remove the broken locationId reference
        await prisma.job.update({
          where: { id: job.id },
          data: { locationId: null }
        });
        console.log(`Removed broken locationId from job ${job.id}`);
      }
    } else if (location.createdBy !== user.id) {
      console.log(`Location ${location.label} belongs to different user (${location.createdBy}), updating to current user (${user.id})`);
      
      // Update the location to be owned by the current user
      await prisma.location.update({
        where: { id: location.id },
        data: { createdBy: user.id }
      });
      
      console.log(`Updated location ${location.label} ownership to current user`);
      fixedCount++;
    }
    }

    console.log(`Fixed ${fixedCount} broken location relationships`);
    
    // Revalidate paths to update the UI
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard');
    
    return { success: true, fixedCount };
  } catch (error) {
    const msg = "Failed to fix broken location relationships. ";
    return handleError(error, msg);
  }
};

// Function to clean up orphaned locations (locations without any jobs)
export const cleanupOrphanedLocations = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Find locations that don't have any jobs linked to them AND are not used in work experiences
    const orphanedLocations = await prisma.location.findMany({
      where: {
        createdBy: user.id,
        jobsApplied: {
          none: {
            userId: user.id
          }
        },
        workExperience: {
          none: {}
        }
      },
      select: {
        id: true,
        label: true,
      },
    });

    if (orphanedLocations.length === 0) {
      return { success: true, deletedCount: 0, message: "No orphaned locations found" };
    }

    // Delete orphaned locations
    const deleteResult = await prisma.location.deleteMany({
      where: {
        id: {
          in: orphanedLocations.map(loc => loc.id)
        },
        createdBy: user.id,
      },
    });

    console.log(`Deleted ${deleteResult.count} orphaned locations`);
    
    // Revalidate paths to update the UI
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard');
    
    return { success: true, deletedCount: deleteResult.count, orphanedLocations };
  } catch (error) {
    const msg = "Failed to cleanup orphaned locations. ";
    return handleError(error, msg);
  }
};

export const deleteJobLocationById = async (
  locationId: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const experiences = await prisma.workExperience.count({
      where: {
        locationId,
      },
    });
    if (experiences > 0) {
      throw new Error(
        `Job location cannot be deleted due to its use in experience section of one of the resume! `
      );
    }

    const educations = await prisma.education.count({
      where: {
        locationId,
      },
    });
    if (educations > 0) {
      throw new Error(
        `Job location cannot be deleted due to its use in education section of one of the resume! `
      );
    }

    const jobs = await prisma.job.count({
      where: {
        locationId,
      },
    });

    if (jobs > 0) {
      throw new Error(
        `Location cannot be deleted due to ${jobs} number of associated jobs! `
      );
    }

    const res = await prisma.location.delete({
      where: {
        id: locationId,
        createdBy: user.id,
      },
    });
    return { res, success: true };
  } catch (error) {
    const msg = "Failed to delete job location.";
    return handleError(error, msg);
  }
};
