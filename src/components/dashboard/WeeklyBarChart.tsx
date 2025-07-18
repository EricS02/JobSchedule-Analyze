"use client";
import { barChartData } from "@/lib/data/barChartData";
import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

type WeeklyBarChartProps = {
  data: any[];
  keys: string[];
  groupMode?: "grouped" | "stacked";
  axisLeftLegend: string;
  useSWRData?: boolean;
};

export default function WeeklyBarChart({
  data,
  keys,
  groupMode,
  axisLeftLegend,
  useSWRData = false,
}: WeeklyBarChartProps) {
  // If useSWRData is true, fetch activities data from API
  const { data: swrData, isLoading } = useSWR(useSWRData ? "/api/activities/weekly" : null, fetcher);

  // Use SWR data if available, otherwise fallback to prop
  const chartData = useSWRData && swrData && swrData.data ? swrData.data : data;
  // Detect if activities data (with totalDuration/count) or jobs data (with value)
  const isActivities = chartData && chartData[0] && ("totalDuration" in chartData[0] && "count" in chartData[0]);
  const validatedData = chartData && Array.isArray(chartData) && chartData.length > 0 
    ? chartData.map((d: any) =>
        isActivities
          ? { ...d, "Duration (hrs)": d.totalDuration, "# Activities": d.count }
          : d
      )
    : [
        { day: "Mon", value: 0 },
        { day: "Tue", value: 0 },
        { day: "Wed", value: 0 },
        { day: "Thu", value: 0 },
        { day: "Fri", value: 0 },
        { day: "Sat", value: 0 },
        { day: "Sun", value: 0 }
      ];

  // Calculate totals for display
  const totalDuration = isActivities ? validatedData.reduce((sum, d) => sum + (d["Duration (hrs)"] || 0), 0) : 0;
  const totalCount = isActivities ? validatedData.reduce((sum, d) => sum + (d["# Activities"] || 0), 0) : 0;
  const totalJobs = !isActivities ? validatedData.reduce((sum, day) => sum + (typeof day.value === 'number' ? day.value : 0), 0) : 0;

  // Calculate max value for y-axis ticks
  const maxValue = isActivities
    ? Math.max(...validatedData.map(d => Math.max(d["Duration (hrs)"] || 0, d["# Activities"] || 0)))
    : Math.max(...validatedData.map(d => d.value || 0));

  // Generate unique y-axis ticks based on data range
  const generateYTicks = () => {
    if (maxValue === 0) return [0];
    if (maxValue <= 3) return Array.from({ length: maxValue + 1 }, (_, i) => i);
    if (maxValue <= 5) return [0, 1, 2, 3, 4, 5];
    if (maxValue <= 10) return [0, 2, 4, 6, 8, 10];
    // For larger values, use 5 ticks with reasonable spacing
    const step = Math.ceil(maxValue / 4);
    return Array.from({ length: 5 }, (_, i) => i * step);
  };

  return (
    <Card className="mb-2 lg:mb-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {isActivities ? (
            <>
              Weekly Activities
              <span className="ml-2 text-xs text-muted-foreground">
                (Total: {totalCount} activities, {totalDuration.toFixed(1)} hrs)
              </span>
            </>
          ) : (
            <>
              Weekly Jobs Applied
              <span className="ml-2 text-xs text-muted-foreground">
                (Total: {totalJobs})
              </span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] p-3 pt-0">
        <ResponsiveBar
          data={validatedData}
          keys={isActivities ? ["Duration (hrs)", "# Activities"] : keys}
          indexBy="day"
          margin={{
            top: 20,
            right: 10,
            bottom: 40,
            left: 45,
          }}
          padding={0.6}
          groupMode={isActivities ? "grouped" : groupMode}
          colors={isActivities ? ["#f87171", "#fbbf24"] : groupMode === "stacked" ? { scheme: "nivo" } : "#2a7ef0"}
          enableTotals={groupMode === "stacked" && !isActivities ? true : false}
          theme={{
            text: {
              fill: "#9ca3af",
            },
            tooltip: {
              container: {
                background: "#1e293b",
                color: "#fff",
              },
            },
          }}
          axisTop={null}
          axisRight={null}
          enableGridX={false}
          enableGridY={false}
          enableLabel={true}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "DAYS OF WEEK",
            legendPosition: "middle",
            legendOffset: 32,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isActivities ? "Duration (hrs) / # Activities" : axisLeftLegend,
            legendPosition: "middle",
            legendOffset: -40,
            truncateTickAt: 0,
            format: (value) => Math.floor(value), // Ensure whole numbers only
            tickValues: generateYTicks(), // Use custom tick values to prevent duplicates
          }}
          motionConfig="gentle"
          tooltip={({ value, indexValue, id, color }) => (
            <div
              style={{
                padding: 8,
                background: "#1e293b",
                color: "#fff",
                borderRadius: 4,
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
              }}
            >
              <strong>{indexValue}: {id} = {value}</strong>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
