"use client";

import { Button } from '@/components/ui/button'
import { Check, ArrowLeft } from 'lucide-react'
import { HeroHeader, SimpleHeader } from '@/components/header'
import { RegisterLink, LoginLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { handleProPlanUpgrade } from '@/actions/pricing.actions'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Pricing() {
    const { isAuthenticated, user, isLoading: authLoading } = useKindeAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
    const searchParams = useSearchParams();

    // Check subscription status
    useEffect(() => {
        const checkSubscription = async () => {
            if (isAuthenticated && user?.email && !authLoading) {
                try {
                    const { getUserSubscriptionStatus } = await import('@/actions/stripe.actions');
                    const status = await getUserSubscriptionStatus();
                    setSubscriptionStatus(status);
                } catch (error) {
                    console.error('Failed to check subscription status:', error);
                }
            }
        };

        checkSubscription();
    }, [isAuthenticated, user?.email, authLoading]);

    // Check if user just logged in and should proceed to checkout
    useEffect(() => {
        if (isAuthenticated && !authLoading && searchParams.get('checkout') === 'true') {
            console.log("User authenticated, proceeding to checkout...");
            handleProPlanClick();
        }
    }, [isAuthenticated, authLoading, searchParams]);

    const handleProPlanClick = async () => {
        console.log("handleProPlanClick called - isAuthenticated:", isAuthenticated, "user:", user?.email);
        
        if (!isAuthenticated) {
            console.log("User not authenticated, cannot proceed with checkout");
            return;
        }
        
        setIsLoading(true);
        
        try {
            console.log("Calling server action for Pro plan upgrade...");
            
            const result = await handleProPlanUpgrade();
            console.log("Server action result:", result);
            
            if (result.success && result.checkoutUrl) {
                console.log("Redirecting to checkout:", result.checkoutUrl);
                window.location.href = result.checkoutUrl;
            } else if (result.redirectTo) {
                console.log("Redirecting to:", result.redirectTo);
                window.location.href = result.redirectTo;
            } else {
                console.error("Server action failed:", result.message);
                alert(result.message || "Failed to start checkout. Please try again.");
            }
        } catch (error) {
            console.error("Error in handleProPlanClick:", error);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <>
                <SimpleHeader />
                <section className="py-16 md:py-32">
                    <div className="mx-auto max-w-5xl px-6">
                        <div className="mx-auto max-w-2xl space-y-6 text-center">
                            <h1 className="text-center text-4xl font-semibold lg:text-5xl">Loading...</h1>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    // If user has subscription, show subscription confirmation
    if (subscriptionStatus?.plan === 'pro') {
        return (
            <>
                <SimpleHeader />
                <section className="py-16 md:py-32">
                    <div className="mx-auto max-w-5xl px-6">
                        <div className="mx-auto max-w-2xl space-y-6 text-center">
                            <h1 className="text-center text-4xl font-semibold lg:text-5xl">You're Already Subscribed!</h1>
                            <p className="text-lg text-muted-foreground">You have an active Pro subscription. Enjoy unlimited job tracking and all premium features.</p>
                            <div className="mt-8">
                                <Button asChild>
                                    <Link href="/dashboard">
                                        Go to Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    // If user is in trial, show trial status
    if (subscriptionStatus?.plan === 'trial') {
        return (
            <>
                <SimpleHeader />
                <section className="py-16 md:py-32">
                    <div className="mx-auto max-w-5xl px-6">
                        <div className="mx-auto max-w-2xl space-y-6 text-center">
                            <h1 className="text-center text-4xl font-semibold lg:text-5xl">Free Trial Active!</h1>
                            <p className="text-lg text-muted-foreground">
                                You have {subscriptionStatus.daysRemaining} days remaining in your free trial. 
                                Enjoy unlimited job tracking and all premium features.
                            </p>
                            <div className="mt-8 space-y-4">
                                <Button asChild>
                                    <Link href="/dashboard">
                                        Continue to Dashboard
                                    </Link>
                                </Button>
                                <div>
                                    <Button variant="outline" onClick={handleProPlanClick} disabled={isLoading}>
                                        {isLoading ? "Loading..." : "Upgrade to Pro"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    }
    
    return (
        <>
            <SimpleHeader />
            <section className="py-16 md:py-32">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="mx-auto max-w-2xl space-y-6 text-center">
                        <h1 className="text-center text-4xl font-semibold lg:text-5xl">Simple, Transparent Pricing</h1>
                        <p className="text-lg text-muted-foreground">
                            Start with a 7-day free trial, then choose the plan that works for you.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-6 md:mt-16 md:grid-cols-5 md:gap-0">
                        {/* Basic Plan */}
                        <div className="rounded-(--radius) flex flex-col justify-between space-y-6 sm:space-y-8 border p-4 sm:p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="font-medium text-lg sm:text-xl">Basic</h2>
                                    <span className="my-3 block text-xl sm:text-2xl font-semibold">$0 / mo</span>
                                    <p className="text-muted-foreground text-xs sm:text-sm">After free trial</p>
                                </div>

                                {isAuthenticated ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled>
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full">
                                        <RegisterLink postLoginRedirectURL="/pricing?checkout=true">Get Started</RegisterLink>
                                    </Button>
                                )}

                                <hr className="border-dashed" />

                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        <span>5 job applications per day</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        <span>Basic dashboard</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        <span>Manual job entry</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-muted-foreground">
                                        <Check className="h-4 w-4" />
                                        <span>Chrome extension</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="dark:bg-muted rounded-(--radius) border p-4 sm:p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)]">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="font-medium text-lg sm:text-xl">Pro</h2>
                                        <span className="my-3 block text-xl sm:text-2xl font-semibold">$10 / mo</span>
                                        <p className="text-muted-foreground text-xs sm:text-sm">After 7-day free trial</p>
                                    </div>

                                    {isAuthenticated ? (
                                        <Button
                                            onClick={handleProPlanClick}
                                            disabled={isLoading}
                                            className="w-full">
                                            {isLoading ? "Loading..." : "Start Free Trial"}
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            disabled={isLoading}
                                            className="w-full">
                                            <LoginLink postLoginRedirectURL="/pricing?checkout=true">
                                                {isLoading ? "Loading..." : "Start Free Trial"}
                                            </LoginLink>
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="text-sm">
                                        <p className="font-medium mb-3">Everything in Basic, plus:</p>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4" />
                                                <span>Unlimited job tracking</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4" />
                                                <span>AI resume review</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4" />
                                                <span>AI job matching</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4" />
                                                <span>Advanced analytics</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4" />
                                                <span>Export functionality</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4" />
                                                <span>Resume parsing</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4" />
                                                <span>Interview tracking</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
} 