"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { getUserSubscriptionStatus, cancelSubscriptionAtPeriodEnd } from "@/actions/stripe.actions";
import Link from "next/link";

interface SubscriptionDetails {
  plan: "free" | "pro";
  status: "free" | "active" | "canceled" | "past_due" | "not_logged_in" | "user_not_found";
  customerId?: string;
  subscriptionId?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
}

export default function SubscriptionPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeAuth();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadSubscriptionDetails();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const loadSubscriptionDetails = async () => {
    try {
      const status = await getUserSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error("Failed to load subscription details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.subscriptionId) return;
    
    setIsCanceling(true);
    try {
      await cancelSubscriptionAtPeriodEnd(subscription.subscriptionId);
      setCancelSuccess(true);
      // Reload subscription details to show updated status
      await loadSubscriptionDetails();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You must be logged in to view subscription details.</p>
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Subscription Not Found</h1>
          <p className="text-muted-foreground mb-4">Unable to load subscription details.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPro = subscription.plan === "pro";
  const isActive = subscription.status === "active";
  const isCanceled = subscription.cancelAtPeriodEnd;
  const currentPeriodEnd = subscription.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd * 1000) 
    : null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage your JobSchedule subscription and billing preferences
          </p>
        </div>

        {/* Subscription Status Card */}
        <Card className="text-center">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CardTitle className="text-xl">Current Plan</CardTitle>
              {isPro && <Crown className="h-5 w-5 text-yellow-500" />}
            </div>
            <div className="flex justify-center mb-2">
              <Badge variant={isPro ? "default" : "secondary"} className="text-sm">
                {isPro ? "Pro" : "Free"}
              </Badge>
            </div>
            <CardDescription>
              {isPro 
                ? "You have access to all premium features" 
                : "Upgrade to Pro for unlimited job tracking and AI features"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPro ? (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={isActive ? "default" : "destructive"}>
                      {isActive ? "Active" : subscription.status}
                    </Badge>
                    {isCanceled && (
                      <Badge variant="secondary">Canceling</Badge>
                    )}
                  </div>
                </div>

                {/* Billing Period */}
                {currentPeriodEnd && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">Next billing date:</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {currentPeriodEnd.toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">Monthly price:</span>
                  <span className="text-sm">$10.00 USD</span>
                </div>

                {/* Cancelation Notice */}
                {isCanceled && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription will be canceled at the end of the current billing period on{" "}
                      <strong>{currentPeriodEnd?.toLocaleDateString()}</strong>. 
                      You'll continue to have access to all Pro features until then.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Cancelation Success */}
                {cancelSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription has been successfully canceled. You'll continue to have access to all Pro features until the end of your current billing period.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="pt-4">
                  {!isCanceled ? (
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                      variant="destructive"
                      className="w-full"
                    >
                      {isCanceling ? "Canceling..." : "Cancel Subscription"}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <Link href="/pricing">
                        Reactivate Subscription
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Free Plan Limitations:</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Track up to 10 job applications per day</li>
                      <li>• No AI resume review</li>
                      <li>• No AI job matching</li>
                      <li>• Limited analytics</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  asChild
                  className="w-full"
                >
                  <Link href="/pricing">
                    Upgrade to Pro
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 