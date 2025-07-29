import { getCurrentUser } from "@/utils/user.utils";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getRecentJobs(limit = 5) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("No user found for getRecentJobs");
      return [];
    }

    console.log(`Fetching recent jobs for user ${user.id}, limit: ${limit}`);
    
    const jobs = await prisma.job.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        createdAt: true,
        jobUrl: true,
        jobSourceId: true,
        source: true,
        companyId: true,
        jobsAppliedCompany: {
          select: {
            id: true,
            label: true,
            value: true,
            logoUrl: true,
          },
        },
      },
    });

    console.log(`Found ${jobs.length} recent jobs with data:`, JSON.stringify(jobs, null, 2));
    
    // Map the results to match the expected format
    const formattedJobs = jobs.map(job => ({
      ...job,
      jobCompany: job.jobsAppliedCompany
    }));
    
    // Revalidate multiple paths to ensure updates
    revalidatePath('/dashboard');
    revalidatePath('/');
    
    return formattedJobs;
  } catch (error) {
    console.error("Error fetching recent jobs:", error);
    return [];
  }
}

export async function getJobsAppliedForPeriod(days: number = 7) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("No user found for getJobsAppliedForPeriod");
      return { count: 0, trend: 0 };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const count = await prisma.job.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate
        }
      }
    });

    // Calculate trend by comparing with previous period
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days * 2);
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - days);

    const previousCount = await prisma.job.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd
        }
      }
    });

    // Calculate percentage change
    let trend = 0;
    if (previousCount > 0) {
      trend = Math.round(((count - previousCount) / previousCount) * 100);
    } else if (count > 0) {
      trend = 100; // 100% increase from 0
    }

    return { count, trend };
  } catch (error) {
    console.error(`Error fetching jobs applied for ${days} days:`, error);
    return { count: 0, trend: 0 };
  }
}

export async function getJobsActivityForPeriod() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("No user found for getJobsActivityForPeriod");
      return [];
    }

    // Get current date and calculate the start of current week (Monday)
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1; // Calculate days since Monday
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0); // Start of Monday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // End of Sunday

    console.log(`Fetching jobs for current week: ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`);

    const jobs = await prisma.job.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    // Initialize weekly data structure
    const weeklyData = [
      { day: "Mon", value: 0 },
      { day: "Tue", value: 0 },
      { day: "Wed", value: 0 },
      { day: "Thu", value: 0 },
      { day: "Fri", value: 0 },
      { day: "Sat", value: 0 },
      { day: "Sun", value: 0 }
    ];

    // Count jobs by day of the week (ensuring timezone consistency)
    jobs.forEach(job => {
      const jobDate = new Date(job.createdAt);
      const dayOfWeek = jobDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[dayOfWeek];
      
      const dayData = weeklyData.find(d => d.day === dayName);
      if (dayData) {
        dayData.value++;
      }
    });

    console.log(`Processed ${jobs.length} jobs for current week into weekly data:`, weeklyData);
    
    // Force revalidation to ensure fresh data
    revalidatePath('/dashboard');
    
    return weeklyData;
  } catch (error) {
    console.error("Error fetching job activity data:", error);
    return [
      { day: "Mon", value: 0 },
      { day: "Tue", value: 0 },
      { day: "Wed", value: 0 },
      { day: "Thu", value: 0 },
      { day: "Fri", value: 0 },
      { day: "Sat", value: 0 },
      { day: "Sun", value: 0 }
    ];
  }
}

export async function getActivityDataForPeriod() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("No user found for getActivityDataForPeriod");
      return [];
    }

    // Get activities for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // You can customize this query based on what activity data you want to track
    // This is a simple example that returns job status changes
    const activities = await prisma.job.findMany({
      where: {
        userId: user.id,
        updatedAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        company: true,
        status: true,
        updatedAt: true
      },
      take: 10
    });

    return activities;
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return [];
  }
}

export async function getActivityCalendarData() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("No user found for getActivityCalendarData");
      return { [new Date().getFullYear().toString()]: [] };
    }

    // Get job applications for the last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const jobs = await prisma.job.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: threeYearsAgo
        }
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    console.log(`Found ${jobs.length} jobs for calendar data`);

    // Group jobs by year, then by date
    const jobsByYear = jobs.reduce((acc, job) => {
      const year = job.createdAt.getFullYear().toString();
      const day = job.createdAt.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      if (!acc[year]) {
        acc[year] = {};
      }
      
      acc[year][day] = (acc[year][day] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // Convert to the format expected by the calendar component
    const calendarDataByYear = Object.entries(jobsByYear).reduce((acc, [year, dateData]) => {
      acc[year] = Object.entries(dateData).map(([day, count]) => ({
        day,
        value: count
      }));
      return acc;
    }, {} as Record<string, Array<{ day: string; value: number }>>);

    // If no data, provide current year with empty data
    if (Object.keys(calendarDataByYear).length === 0) {
      const currentYear = new Date().getFullYear().toString();
      calendarDataByYear[currentYear] = [];
    }

    console.log("Calendar data by year:", JSON.stringify(calendarDataByYear));
    
    return calendarDataByYear;
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    const currentYear = new Date().getFullYear().toString();
    return { [currentYear]: [] };
  }
}

export async function getWeeklyActivitiesSummary() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("No user found for getWeeklyActivitiesSummary");
      return [
        { day: "Mon", totalDuration: 0, count: 0 },
        { day: "Tue", totalDuration: 0, count: 0 },
        { day: "Wed", totalDuration: 0, count: 0 },
        { day: "Thu", totalDuration: 0, count: 0 },
        { day: "Fri", totalDuration: 0, count: 0 },
        { day: "Sat", totalDuration: 0, count: 0 },
        { day: "Sun", totalDuration: 0, count: 0 }
      ];
    }
    // Get current week range with proper timezone handling
    const now = new Date();
    console.log('Current date for weekly activities:', now.toISOString());
    
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    console.log('Week range for activities:', {
      startOfWeek: startOfWeek.toISOString(),
      endOfWeek: endOfWeek.toISOString(),
      currentDay,
      mondayOffset
    });
    // Fetch activities for the week
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      select: {
        id: true,
        startTime: true,
        duration: true,
      },
    });
    // Prepare weekly summary with correct day mapping
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const summary = weekDays.map((day) => ({ day, totalDuration: 0, count: 0 }));
    
    activities.forEach((activity) => {
      const date = new Date(activity.startTime);
      const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Convert JavaScript day (0=Sunday) to our week format (0=Monday)
      // Sunday (0) becomes 6, Monday (1) becomes 0, etc.
      const weekDayIndex = jsDay === 0 ? 6 : jsDay - 1;
      const weekDay = weekDays[weekDayIndex];
      
      const daySummary = summary.find((d) => d.day === weekDay);
      if (daySummary) {
        daySummary.count++;
        daySummary.totalDuration += (activity.duration || 0) / 60; // convert minutes to hours
      }
    });
    return summary;
  } catch (error) {
    console.error("Error fetching weekly activities summary:", error);
    return [
      { day: "Mon", totalDuration: 0, count: 0 },
      { day: "Tue", totalDuration: 0, count: 0 },
      { day: "Wed", totalDuration: 0, count: 0 },
      { day: "Thu", totalDuration: 0, count: 0 },
      { day: "Fri", totalDuration: 0, count: 0 },
      { day: "Sat", totalDuration: 0, count: 0 },
      { day: "Sun", totalDuration: 0, count: 0 }
    ];
  }
}