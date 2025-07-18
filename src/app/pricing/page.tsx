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
    const [hasSubscription, setHasSubscription] = useState(false);
    const searchParams = useSearchParams();

    // Check subscription status
    useEffect(() => {
        const checkSubscription = async () => {
            if (isAuthenticated && user?.email && !authLoading) {
                try {
                    const { hasSubscription: checkSubscription } = await import('@/actions/stripe.actions');
                    const subscriptionStatus = await checkSubscription();
                    setHasSubscription(subscriptionStatus.isSubscribed);
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
    if (hasSubscription) {
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
    
    return (
        <>
            {/* Use conditional header based on authentication status */}
            {isAuthenticated ? <SimpleHeader /> : <HeroHeader />}
            <section className="py-12 sm:py-16 md:py-24 lg:py-32">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    {/* Back to Dashboard button for authenticated users */}
                    {isAuthenticated && (
                        <div className="mb-6 sm:mb-8">
                            <Button
                                variant="ghost"
                                asChild
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <Link href="/dashboard">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    )}

                    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 text-center">
                        <h1 className="text-center text-3xl sm:text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1>
                        <p className="text-sm sm:text-base">JobSchedule is a job application tracking system that helps you track your job applications with the power of AI.</p>
                    </div>

                    <div className="mt-8 grid gap-6 md:mt-16 md:grid-cols-5 md:gap-0">
                        <div className="rounded-(--radius) flex flex-col justify-between space-y-6 sm:space-y-8 border p-4 sm:p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="font-medium text-lg sm:text-xl">Free</h2>
                                    <span className="my-3 block text-xl sm:text-2xl font-semibold">$0 / mo</span>
                                    <p className="text-muted-foreground text-xs sm:text-sm">Perfect for getting started</p>
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

                                <ul className="list-outside space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                    {[
                                        'Track up to 10 job applications',
                                        'Basic job application dashboard',
                                        'Manual job entry',
                                        'Job status tracking',
                                        'Basic analytics'
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="dark:bg-muted rounded-(--radius) border p-4 sm:p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)]">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="font-medium text-lg sm:text-xl">Pro</h2>
                                        <span className="my-3 block text-xl sm:text-2xl font-semibold">$10 / mo</span>
                                        <p className="text-muted-foreground text-xs sm:text-sm">For serious job seekers</p>
                                    </div>

                                    {isAuthenticated ? (
                                        <Button
                                            onClick={handleProPlanClick}
                                            disabled={isLoading}
                                            className="w-full">
                                            {isLoading ? "Loading..." : "Upgrade to Pro"}
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            disabled={isLoading}
                                            className="w-full">
                                            <LoginLink postLoginRedirectURL="/pricing?checkout=true">
                                                {isLoading ? "Loading..." : "Get Started"}
                                            </LoginLink>
                                        </Button>
                                    )}
                                </div>

                                <div>
                                    <div className="text-xs sm:text-sm font-medium">Everything in free plus:</div>

                                    <ul className="mt-4 list-outside space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                        {[
                                            'Unlimited job tracking',
                                            'AI-powered resume review',
                                            'AI job matching',
                                            'Advanced analytics',
                                            'Export job data',
                                            'Priority support',
                                            'Chrome extension',
                                            'Resume parsing',
                                            'Interview tracking',
                                            'Custom job categories'
                                        ].map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-2">
                                                <Check className="size-3" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
} 