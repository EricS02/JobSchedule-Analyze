import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp } from "lucide-react";

interface NumberCardProps {
  label: string;
  num: number;
  trend: number;
}

export default function NumberCard({ label, num, trend }: NumberCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs sm:text-sm">{label}</CardDescription>
        <CardTitle className="text-2xl sm:text-3xl lg:text-4xl">{num}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 text-xs text-muted-foreground">
          {trend}%{" "}
          {trend > 0 ? (
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Progress value={trend} aria-label={`${trend}% increase`} className="w-full" />
      </CardFooter>
    </Card>
  );
}
