"use client";
import Link from "next/link";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SIDEBAR_LINKS } from "@/lib/constants";
import NavLink from "./NavLink";
import { usePathname, useSearchParams } from "next/navigation";
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useEffect, useState } from 'react';

function Sidebar() {
  const path = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useKindeAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (isAuthenticated && user?.email) {
        setIsCheckingSubscription(true);
        try {
          const { getUserSubscriptionStatus } = await import('@/actions/stripe.actions');
          const status = await getUserSubscriptionStatus();
          console.log('Sidebar - Subscription check:', status);
          setSubscriptionStatus(status);
        } catch (error) {
          console.error('Failed to check subscription status:', error);
        } finally {
          setIsCheckingSubscription(false);
        }
      } else {
        // Reset subscription status when not authenticated
        setSubscriptionStatus(null);
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user?.email]);

  // Refresh subscription status when user returns from successful upgrade
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true" && isAuthenticated && user?.email) {
      // Small delay to ensure webhook has processed
      const timer = setTimeout(async () => {
        setIsCheckingSubscription(true);
        try {
          const { getUserSubscriptionStatus } = await import('@/actions/stripe.actions');
          const status = await getUserSubscriptionStatus();
          console.log('Sidebar - Refresh after upgrade:', status);
          setSubscriptionStatus(status);
        } catch (error) {
          console.error('Failed to refresh subscription status:', error);
        } finally {
          setIsCheckingSubscription(false);
        }
      }, 1500); // Slightly longer delay for sidebar
      return () => clearTimeout(timer);
    }
  }, [searchParams, isAuthenticated, user?.email]);

  // Filter sidebar links based on subscription status
  const filteredSidebarLinks = SIDEBAR_LINKS.filter(item => {
    // Show pricing link for all users (free, trial, pro)
    if (item.label === "Pricing") {
      return true;
    }
    
    // Show subscription link for all authenticated users
    if (item.label === "Subscription" && !isAuthenticated) {
      console.log('Sidebar - Hiding subscription link for unauthenticated user');
      return false;
    }
    
    // Show feedback link for all authenticated users
    if (item.label === "Feedback" && !isAuthenticated) {
      console.log('Sidebar - Hiding feedback link for unauthenticated user');
      return false;
    }
    
    return true;
  });

  const hasSubscription = subscriptionStatus?.plan === 'pro';
  const isInTrial = subscriptionStatus?.plan === 'trial';
  const trialDaysRemaining = subscriptionStatus?.daysRemaining;

  console.log('Sidebar - subscriptionStatus:', subscriptionStatus, 'isChecking:', isCheckingSubscription, 'filteredLinks:', filteredSidebarLinks.length);

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        {/* Removed Briefcase icon and home link */}
        <TooltipProvider delayDuration={800}>
          {filteredSidebarLinks.map((item) => {
            // Add trial indicator for subscription link
            const isSubscriptionLink = item.label === "Subscription";
            const showTrialBadge = isSubscriptionLink && isInTrial && trialDaysRemaining;
            
            return (
              <div key={item.label} className="text-white fill-color relative">
                <NavLink
                  label={item.label}
                  Icon={item.icon}
                  route={item.route}
                  pathname={path}
                />
                {showTrialBadge && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {trialDaysRemaining}
                  </div>
                )}
              </div>
            );
          })}
        </TooltipProvider>
      </nav>

    </aside>
  );
}

export default Sidebar;
