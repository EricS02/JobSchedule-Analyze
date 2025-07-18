"use client";
import { ResponsiveCalendar } from "@nivo/calendar";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export default function ActivityCalendar({
  year,
  data,
}: {
  year: string;
  data: any[];
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const emptyColor = isDark ? "#23272f" : "#eeeeee";
  const colors = isDark
    ? ["#0a4369", "#1976d2", "#42a5f5", "#90caf9"] // dark to light blue
    : ["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"];
  const borderColor = isDark ? "#2d3748" : "#ffffff";
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [{ day: new Date().toISOString().split('T')[0], value: 0 }];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Activity Calendar (Jobs Applied)</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <div className="w-full h-full">
          <ResponsiveCalendar
            data={safeData}
            from={new Date(parseInt(year), 0, 1)}
            to={new Date(parseInt(year), 11, 31)}
            emptyColor={emptyColor}
            colors={colors}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            yearSpacing={40}
            monthBorderColor={borderColor}
            dayBorderWidth={2}
            dayBorderColor={borderColor}
            theme={{
              text: {
                fill: "#9ca3af",
              },
              tooltip: {
                container: {
                  background: isDark ? "#1e293b" : "#fff",
                  color: isDark ? "#fff" : "#222",
                },
              },
            }}
            legends={[
              {
                anchor: "bottom-right",
                direction: "row",
                translateY: 36,
                itemCount: 4,
                itemWidth: 42,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: "right-to-left",
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function FormattedDate({ date, formatString }: { date: Date, formatString: string }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only show client-side formatted date after mounting
  if (!mounted) {
    return <span suppressHydrationWarning>{format(new Date(date), formatString)}</span>;
  }
  
  return <span>{format(new Date(date), formatString)}</span>;
}
