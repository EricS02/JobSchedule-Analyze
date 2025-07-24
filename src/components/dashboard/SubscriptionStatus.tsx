"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, AlertCircle } from "lucide-react";
import { getUserSubscriptionStatus } from "@/actions/stripe.actions";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import type { SubscriptionStatus } from "@/actions/stripe.actions";

export default function SubscriptionStatus() {
  const { isAuthenticated } = useKindeAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubscriptionStatus();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await getUserSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = "/pricing";
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (!subscription) {
    return null;
  }

  const isPro = subscription.plan === "pro";
  const isActive = subscription.status === "active";
  const isCanceled = subscription.cancelAtPeriodEnd;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Subscription</CardTitle>
            {isPro && <Crown className="h-4 w-4 text-yellow-500" />}
          </div>
          <Badge variant={isPro ? "default" : "secondary"}>
            {isPro ? "Pro" : "Free"}
          </Badge>
        </div>
        <CardDescription>
          {isPro 
            ? "You have access to all features" 
            : "Upgrade to Pro for unlimited job tracking and AI features"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPro ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Status:</span>
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? "default" : "destructive"}>
                  {isActive ? "Active" : subscription.status}
                </Badge>
                {isCanceled && (
                  <Badge variant="secondary">Canceling</Badge>
                )}
              </div>
            </div>
            <Button 
              asChild
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Link href="/dashboard/subscription">
                Manage Subscription
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Free Plan Limitations:</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>• Track up to 10 job applications</li>
                  <li>• No AI resume review</li>
                  <li>• No AI job matching</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="w-full"
              size="sm"
            >
              Upgrade to Pro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 