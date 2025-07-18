"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Crown, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { checkJobTrackingEligibility } from "@/actions/stripe.actions";
import Link from "next/link";

interface DailyJobLimitCardProps {
  className?: string;
  initialEligibility?: {
    isEligible: boolean;
    message: string;
    remainingJobs: number;
  } | null;
}

export default function DailyJobLimitCard({ className, initialEligibility }: DailyJobLimitCardProps) {
  const [eligibility, setEligibility] = useState(initialEligibility);
  const [loading, setLoading] = useState(!initialEligibility);

  // If we have initial data from server, use it and don't fetch again
  useEffect(() => {
    if (initialEligibility) {
      setEligibility(initialEligibility);
      setLoading(false);
      return;
    }

    const fetchEligibility = async () => {
      try {
        const result = await checkJobTrackingEligibility();
        setEligibility(result);
      } catch (error) {
        console.error("Failed to fetch job tracking eligibility:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [initialEligibility]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Daily Job Limit</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!eligibility) {
    return null;
  }

  // If user has unlimited jobs (Pro plan), don't show this card
  if (eligibility.remainingJobs === -1) {
    return null;
  }

  const maxJobs = 10; // PLAN_LIMITS.FREE.maxJobs
  const usedJobs = maxJobs - eligibility.remainingJobs;
  const percentage = (usedJobs / maxJobs) * 100;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-0.5">
          <CardTitle className="text-lg">Daily Job Limit</CardTitle>
          <CardDescription>
            Free plan: {maxJobs} job applications per day
          </CardDescription>
        </div>
        <Calendar className="w-8 h-8 ml-auto text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used today</span>
            <span className="font-medium">
              {usedJobs} / {maxJobs}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">{eligibility.remainingJobs}</span> applications remaining today
          </div>
          
          {eligibility.remainingJobs === 0 ? (
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-600 font-medium">Limit reached</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Free plan</span>
            </div>
          )}
        </div>

        {eligibility.remainingJobs === 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              You've reached your daily limit. Upgrade to Pro for unlimited job tracking.
            </p>
            <Button asChild size="sm" className="w-full">
              <Link href="/pricing">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 