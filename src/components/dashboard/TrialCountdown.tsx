"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserSubscriptionStatus } from "@/actions/stripe.actions";
import Link from "next/link";

interface TrialCountdownProps {
  className?: string;
}

export default function TrialCountdown({ className }: TrialCountdownProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        const status = await getUserSubscriptionStatus();
        setSubscriptionStatus(status);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptionStatus();
  }, []);

  if (loading || subscriptionStatus?.plan !== 'trial') {
    return null;
  }

  const daysRemaining = subscriptionStatus.daysRemaining || 0;
  const isLastDay = daysRemaining <= 1;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-blue-500" />
          Free Trial
        </CardTitle>
        <CardDescription>
          {isLastDay 
            ? "Last day of your free trial!" 
            : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Crown className="h-4 w-4" />
          <span>Enjoy unlimited job tracking and AI features</span>
        </div>
        
        {isLastDay && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>Upgrade today to keep all features!</span>
          </div>
        )}

        <Button asChild size="sm" className="w-full">
          <Link href="/pricing">
            <Crown className="w-4 h-4 mr-2" />
            {isLastDay ? "Upgrade Now" : "Upgrade to Pro"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
} 