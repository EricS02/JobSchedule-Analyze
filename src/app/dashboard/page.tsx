import {
  getActivityCalendarData,
  getJobsAppliedForPeriod,
  getRecentJobs,
  getJobsActivityForPeriod,
} from "@/actions/dashboard.actions";
import { checkJobTrackingEligibility } from "@/actions/stripe.actions";
import ActivityCalendar from "@/components/dashboard/ActivityCalendar";
import JobsApplied from "@/components/dashboard/JobsAppliedCard";
import NumberCard from "@/components/dashboard/NumberCard";
import RecentJobsCard from "@/components/dashboard/RecentJobsCard";
import WeeklyBarChart from "@/components/dashboard/WeeklyBarChart";
import DailyJobLimitCard from "@/components/dashboard/DailyJobLimitCard";
import UpgradeSuccessMessage from "@/components/dashboard/UpgradeSuccessMessage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  const [
    { count: jobsAppliedLast7Days, trend: trendFor7Days },
    { count: jobsAppliedLast30Days, trend: trendFor30Days },
    recentJobs,
    weeklyData,
    activityCalendarData,
    jobTrackingEligibility,
  ] = await Promise.all([
    getJobsAppliedForPeriod(7),
    getJobsAppliedForPeriod(30),
    getRecentJobs(),
    getJobsActivityForPeriod(),
    getActivityCalendarData(),
    checkJobTrackingEligibility(),
  ]);

  const activityCalendarDataKeys = Object.keys(activityCalendarData);

  return (
    <div className="w-full">
      <UpgradeSuccessMessage />
      
      {/* Main dashboard grid - original 3-column layout */}
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-3 auto-rows-max items-start">
        {/* Left side - Stats cards and Weekly chart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats cards - 4 cards in a row on large screens */}
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <JobsApplied />
            <NumberCard label="Last 7 days" num={jobsAppliedLast7Days} trend={trendFor7Days} />
            <NumberCard label="Last 30 days" num={jobsAppliedLast30Days} trend={trendFor30Days} />
          </div>
          
          {/* Weekly jobs chart - spans full width */}
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="jobs">Weekly Jobs</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs" className="w-full">
              <WeeklyBarChart
                data={weeklyData}
                keys={["value"]}
                axisLeftLegend="NUMBER OF JOBS APPLIED"
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right side - Side cards (hidden on mobile/tablet) */}
        <div className="hidden lg:block space-y-4">
          <DailyJobLimitCard initialEligibility={jobTrackingEligibility} />
          <RecentJobsCard jobs={recentJobs} />
        </div>
        
        {/* Mobile/tablet side cards */}
        <div className="lg:hidden space-y-4">
          <DailyJobLimitCard initialEligibility={jobTrackingEligibility} />
          <RecentJobsCard jobs={recentJobs} />
        </div>
      </div>
      
      {/* Activity calendar - full width at bottom, bigger on mobile/tablet */}
      <div className="w-full mt-6 lg:mt-4 p-6 lg:p-0">
        <Tabs defaultValue={activityCalendarDataKeys.at(-1)} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-base sm:text-sm">
            {activityCalendarDataKeys.map((year) => (
              <TabsTrigger key={year} value={year} className="text-base sm:text-sm">
                {year}
              </TabsTrigger>
            ))}
          </TabsList>
          {activityCalendarDataKeys.map((year) => (
            <TabsContent key={year} value={year} className="w-full mt-4 lg:mt-2">
              <div className="scale-125 lg:scale-100 origin-top-left">
                <ActivityCalendar year={year} data={activityCalendarData[year]} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
} 