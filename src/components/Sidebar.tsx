"use client";
import Link from "next/link";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Briefcase, Settings } from "lucide-react";
import { SIDEBAR_LINKS } from "@/lib/constants";
import NavLink from "./NavLink";
import { usePathname } from "next/navigation";
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useEffect, useState } from 'react';

function Sidebar() {
  const path = usePathname();
  const { isAuthenticated, user } = useKindeAuth();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (isAuthenticated && user?.email) {
        setIsCheckingSubscription(true);
        try {
          const { hasSubscription: checkSubscription } = await import('@/actions/stripe.actions');
          const subscriptionStatus = await checkSubscription();
          console.log('Sidebar - Subscription check:', subscriptionStatus);
          setHasSubscription(subscriptionStatus.isSubscribed);
        } catch (error) {
          console.error('Failed to check subscription status:', error);
        } finally {
          setIsCheckingSubscription(false);
        }
      } else {
        // Reset subscription status when not authenticated
        setHasSubscription(false);
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user?.email]);

  // Filter sidebar links based on subscription status
  const filteredSidebarLinks = SIDEBAR_LINKS.filter(item => {
    // Hide pricing link if user has subscription OR if we're still checking subscription status
    if (item.label === "Pricing" && (hasSubscription || isCheckingSubscription)) {
      console.log('Sidebar - Hiding pricing link for subscribed user or while checking');
      return false;
    }
    
    // Show subscription link only if user has subscription
    if (item.label === "Subscription" && !hasSubscription) {
      console.log('Sidebar - Hiding subscription link for free user');
      return false;
    }
    
    // Show feedback link for all authenticated users
    if (item.label === "Feedback" && !isAuthenticated) {
      console.log('Sidebar - Hiding feedback link for unauthenticated user');
      return false;
    }
    
    return true;
  });

  console.log('Sidebar - hasSubscription:', hasSubscription, 'isChecking:', isCheckingSubscription, 'filteredLinks:', filteredSidebarLinks.length);

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        {/* Removed Briefcase icon and home link */}
        <TooltipProvider delayDuration={800}>
          {filteredSidebarLinks.map((item) => {
            return (
              <div key={item.label} className="text-white fill-color">
                <NavLink
                  label={item.label}
                  Icon={item.icon}
                  route={item.route}
                  pathname={path}
                />
              </div>
            );
          })}
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <NavLink
            label="Settings"
            Icon={Settings}
            route="/dashboard/settings"
            pathname={path}
          />
        </TooltipProvider>
      </nav>
    </aside>
  );
}

export default Sidebar;
