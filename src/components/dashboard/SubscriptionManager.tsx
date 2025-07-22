"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Crown, Clock, AlertCircle, CreditCard, X, RefreshCw } from "lucide-react";
import { getUserSubscriptionStatus, cancelSubscriptionAtPeriodEnd } from "@/actions/stripe.actions";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import { analytics } from "@/lib/analytics";

interface SubscriptionStatus {
  plan: "free" | "trial" | "pro";
  status: string;
  customerId?: string;
  subscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
  trialEndDate?: Date;
  daysRemaining?: number;
  currentPeriodEnd?: number;
}

export default function SubscriptionManager() {
  const { isAuthenticated } = useKindeAuth();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubscriptionStatus();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh subscription status when user returns from successful upgrade
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true" && isAuthenticated) {
      // Small delay to ensure webhook has processed
      const timer = setTimeout(() => {
        loadSubscriptionStatus();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, isAuthenticated]);

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

  const handleCancelSubscription = async () => {
    if (!subscription?.subscriptionId) return;
    
    setIsCanceling(true);
    try {
      await cancelSubscriptionAtPeriodEnd(subscription.subscriptionId);
      
      // Track subscription cancellation
      analytics.trackSubscriptionEvent('canceled', {
        plan: subscription.plan,
        subscriptionId: subscription.subscriptionId
      });
      
      setCancelSuccess(true);
      await loadSubscriptionStatus(); // Refresh status
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleCancelTrial = async () => {
    setIsCanceling(true);
    try {
      // Call API to end trial immediately
      const response = await fetch('/api/subscription/cancel-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setCancelSuccess(true);
        await loadSubscriptionStatus(); // Refresh status
      } else {
        throw new Error('Failed to cancel trial');
      }
    } catch (error) {
      console.error("Failed to cancel trial:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleUpgrade = () => {
    // Track upgrade click
    analytics.trackSubscriptionEvent('upgrade_clicked', {
      currentPlan: subscription.plan,
      status: subscription.status
    });
    
    window.location.href = "/pricing";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSubscriptionStatus();
    setIsRefreshing(false);
  };

  if (!isAuthenticated || isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const isPro = subscription.plan === "pro";
  const isTrial = subscription.plan === "trial";
  const isActive = subscription.status === "active";
  const isCanceled = subscription.cancelAtPeriodEnd;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Subscription</CardTitle>
            {isPro && <Crown className="h-4 w-4 text-yellow-500" />}
            {isTrial && <Clock className="h-4 w-4 text-blue-500" />}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant={isPro ? "default" : isTrial ? "secondary" : "outline"}>
              {isPro ? "Pro" : isTrial ? "Trial" : "Free"}
            </Badge>
          </div>
        </div>
        <CardDescription>
          {isPro 
            ? "You have access to all features" 
            : isTrial
            ? `Free trial - ${subscription.daysRemaining} days remaining`
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
            {isCanceled && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>Subscription will end on {new Date(subscription.currentPeriodEnd! * 1000).toLocaleDateString()}</span>
              </div>
            )}

            {cancelSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {isPro 
                    ? "Subscription successfully canceled. You'll continue to have access until the end of your billing period."
                    : "Trial successfully canceled. You've been moved to the free plan."
                  }
                </span>
              </div>
            )}
            <div className="space-y-3">
              <Button 
                asChild
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Link href="/pricing">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </Link>
              </Button>
              
              {!isCanceled && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your Pro subscription? You'll continue to have access to all Pro features until the end of your current billing period on{" "}
                        <strong>{subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString() : 'the end of your billing period'}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isCanceling ? "Canceling..." : "Yes, Cancel Subscription"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ) : isTrial ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {subscription.daysRemaining} days remaining in your free trial
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  Enjoy unlimited job tracking and AI features
                </p>
              </div>
            </div>
            
            {cancelSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>Trial successfully canceled. You've been moved to the free plan.</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Button 
                onClick={handleUpgrade}
                className="w-full"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Trial
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Free Trial</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your free trial? This will immediately end your trial and you'll be moved to the free plan with limited features.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Trial</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelTrial}
                      disabled={isCanceling}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isCanceling ? "Canceling..." : "Yes, Cancel Trial"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Free Plan Limitations:</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>• Track up to 5 job applications per day</li>
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
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 