"use server";

import { stripe, STRIPE_PRICE_IDS, PLAN_LIMITS, TRIAL_CONFIG } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";

interface StripeSubscription {
  status: string;
  current_period_start: number;
  current_period_end: number;
  created: number;
}

// ✅ NEW: Check if user is in trial period
export async function isUserInTrial(userId: string): Promise<{
  isInTrial: boolean;
  trialEndDate?: Date;
  daysRemaining?: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      trial_start_date: true,
      trial_end_date: true,
      has_used_trial: true,
      createdAt: true,
    },
  });

  if (!user) {
    return { isInTrial: false };
  }

  // If user has already used trial, they're not in trial
  if (user.has_used_trial) {
    return { isInTrial: false };
  }

  // If no trial dates set, start trial now
  if (!user.trial_start_date || !user.trial_end_date) {
    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_CONFIG.durationDays);

    await prisma.user.update({
      where: { id: userId },
      data: {
        trial_start_date: trialStart,
        trial_end_date: trialEnd,
      },
    });

    return {
      isInTrial: true,
      trialEndDate: trialEnd,
      daysRemaining: TRIAL_CONFIG.durationDays,
    };
  }

  // Check if trial is still active
  const now = new Date();
  const trialEnd = new Date(user.trial_end_date);
  const isInTrial = now < trialEnd;

  if (!isInTrial && !user.has_used_trial) {
    // Trial has ended, mark as used
    await prisma.user.update({
      where: { id: userId },
      data: { has_used_trial: true },
    });
  }

  const daysRemaining = isInTrial 
    ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    isInTrial,
    trialEndDate: trialEnd,
    daysRemaining,
  };
}

export async function hasSubscription(): Promise<{
  isSubscribed: boolean;
  subscriptionData: any[];
}> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (user && user.email) {
    // Find user by email instead of Kinde ID
    const userDB = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
    });

    console.log("hasSubscription - User lookup:", {
      kindeId: user.id,
      email: user.email,
      foundUser: !!userDB,
      stripeCustomerId: userDB?.stripe_customer_id,
      subscriptionStatus: userDB?.subscription_status
    });

    if (!userDB?.stripe_customer_id) {
      return {
        isSubscribed: false,
        subscriptionData: [],
      };
    }

    // First check the database subscription status
    if (userDB.subscription_status === 'active') {
      console.log("hasSubscription - User has active subscription in database");
      return {
        isSubscribed: true,
        subscriptionData: [],
      };
    }

    // Fallback to Stripe API check
    const subscriptions = await stripe.subscriptions.list({
      customer: String(userDB.stripe_customer_id),
    });

    console.log("hasSubscription - Stripe subscriptions found:", subscriptions.data.length);

    return {
      isSubscribed: subscriptions.data.length > 0,
      subscriptionData: subscriptions.data,
    };
  }

  return {
    isSubscribed: false,
    subscriptionData: [],
  };
}

export async function createCheckoutLink(customer: string) {
  console.log("Creating checkout link for customer:", customer);
  
  try {
    // Check if user is currently in trial
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    let isInTrial = false;
    if (user?.email) {
      const userDB = await prisma.user.findUnique({
        where: { email: user.email },
        select: {
          trial_start_date: true,
          trial_end_date: true,
          has_used_trial: true,
        },
      });
      
      if (userDB && userDB.trial_start_date && userDB.trial_end_date && !userDB.has_used_trial) {
        const now = new Date();
        const trialEnd = new Date(userDB.trial_end_date);
        isInTrial = now < trialEnd;
      }
    }

    const checkout = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer: customer,
      line_items: [
        {
          price: STRIPE_PRICE_IDS.PRO_PLAN,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        // Only add trial period if user is not already in trial
        ...(isInTrial ? {} : { trial_period_days: TRIAL_CONFIG.durationDays }),
      },
    });

    console.log("Checkout session created:", checkout.id);
    console.log("Checkout URL:", checkout.url);
    console.log("User in trial:", isInTrial, "Trial period added:", !isInTrial);
    
    return checkout.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function generateCustomerPortalLink(customerId: string) {
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return portalSession.url;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate portal link");
  }
}

export async function createCustomerIfNull() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  console.log("Creating customer for user:", user?.email);
  
  if (!user || !user.id) {
    console.log("No user found in session");
    return null;
  }

  // Use upsert to handle both create and update cases
  const userDB = await prisma.user.upsert({
    where: { email: user.email || "" },
    update: {
      // Update name if it has changed
      name: user.given_name && user.family_name 
        ? `${user.given_name} ${user.family_name}` 
        : user.email || "",
    },
    create: {
      email: user.email || "",
      name: user.given_name && user.family_name 
        ? `${user.given_name} ${user.family_name}` 
        : user.email || "",
      password: '', // No password needed for Kinde users
    },
  });

  console.log("User from database:", userDB.email, "Stripe customer ID:", userDB.stripe_customer_id);

  if (!userDB.stripe_customer_id) {
    console.log("Creating new Stripe customer...");
    
    const customer = await stripe.customers.create({
      email: user.email || "",
      name: user.given_name && user.family_name 
        ? `${user.given_name} ${user.family_name}` 
        : user.email || "",
    });

    console.log("New Stripe customer created:", customer.id);

    await prisma.user.update({
      where: {
        id: userDB.id,
      },
      data: {
        stripe_customer_id: customer.id,
      },
    });

    console.log("User updated with Stripe customer ID");
    return customer.id;
  }

  console.log("Using existing Stripe customer ID:", userDB.stripe_customer_id);
  return userDB.stripe_customer_id;
}

// ✅ UPDATED: Enhanced job tracking eligibility with trial support
export async function checkJobTrackingEligibility(): Promise<{
  isEligible: boolean;
  message: string;
  remainingJobs: number;
  plan: 'free' | 'trial' | 'pro';
  trialInfo?: {
    daysRemaining: number;
    trialEndDate: Date;
  };
}> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user || !user.email) {
    return {
      isEligible: false,
      message: "You must be logged in to track jobs.",
      remainingJobs: 0,
      plan: 'free',
    };
  }

  const userDB = await prisma.user.findFirst({
    where: { email: user.email },
  });

  if (!userDB) {
    return {
      isEligible: false,
      message: "User not found.",
      remainingJobs: 0,
      plan: 'free',
    };
  }

  // Check if user has active subscription (Pro plan)
  const stripeSubscriptionData = await hasSubscription();
  const isSubscribed = stripeSubscriptionData.isSubscribed;

  if (isSubscribed) {
    return {
      isEligible: true,
      message: "Unlimited job tracking with Pro plan.",
      remainingJobs: -1, // unlimited
      plan: 'pro',
    };
  }

  // Check if user is in trial period
  const trialInfo = await isUserInTrial(userDB.id);
  
  if (trialInfo.isInTrial) {
    return {
      isEligible: true,
      message: `Unlimited job tracking during your ${trialInfo.daysRemaining}-day free trial.`,
      remainingJobs: -1, // unlimited during trial
      plan: 'trial',
      trialInfo: {
        daysRemaining: trialInfo.daysRemaining!,
        trialEndDate: trialInfo.trialEndDate!,
      },
    };
  }

  // User is on basic plan (after trial or never had trial)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayJobCount = await prisma.job.count({
    where: {
      userId: userDB.id,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const remainingJobs = Math.max(0, PLAN_LIMITS.FREE.maxJobs - todayJobCount);

  if (remainingJobs === 0) {
    return {
      isEligible: false,
      message: "Upgrade now for full features.",
      remainingJobs: 0,
      plan: 'free',
    };
  }

  return {
    isEligible: true,
    message: `You have ${remainingJobs} job application${remainingJobs !== 1 ? "s" : ""} remaining today.`,
    remainingJobs: remainingJobs,
    plan: 'free',
  };
}

export async function checkAIFeatureEligibility(): Promise<{
  isEligible: boolean;
  message: string;
}> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) {
    return {
      isEligible: false,
      message: "You must be logged in to use AI features.",
    };
  }

  const stripeSubscriptionData = await hasSubscription();
  const isSubscribed = stripeSubscriptionData.isSubscribed;

  if (!isSubscribed) {
    return {
      isEligible: false,
      message: "AI features are only available with the Pro plan. Upgrade to unlock AI resume review and job matching.",
    };
  }

  return {
    isEligible: true,
    message: "AI features available with Pro plan.",
  };
}

// ✅ UPDATED: Enhanced subscription status with trial info
export type SubscriptionStatus = {
  plan: 'free' | 'trial' | 'pro';
  status: string;
  customerId?: string;
  subscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
  trialEndDate?: Date;
  daysRemaining?: number;
  currentPeriodEnd?: number;
};

export async function getUserSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user || !user.email) {
    return { plan: 'free', status: 'not_logged_in' };
  }

  const userDB = await prisma.user.findFirst({
    where: { email: user.email },
  });

  if (!userDB) {
    return { plan: 'free', status: 'user_not_found' };
  }

  console.log(`getUserSubscriptionStatus: User ${userDB.email}, stripe_customer_id: ${userDB.stripe_customer_id}, subscription_status: ${userDB.subscription_status}, has_used_trial: ${userDB.has_used_trial}`);

  // First check if user has an active Stripe subscription (this takes precedence)
  if (userDB.stripe_customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: userDB.stripe_customer_id,
      status: 'all',
      limit: 1,
    });

    const subscription = subscriptions.data[0];
    const isSubscribed = subscription && ['active', 'trialing'].includes(subscription.status);

    console.log(`getUserSubscriptionStatus: Found ${subscriptions.data.length} subscriptions, first subscription status: ${subscription?.status}, isSubscribed: ${isSubscribed}`);

    if (isSubscribed) {
      console.log(`getUserSubscriptionStatus: Returning PRO plan for user ${userDB.email}`);
      return {
        plan: "pro",
        status: subscription.status,
        customerId: userDB.stripe_customer_id,
        subscriptionId: subscription.id,
        cancelAtPeriodEnd: false, // Default value since we can't access the property
      };
    }
  }

  // If no active Stripe subscription, check trial status
  const trialInfo = await isUserInTrial(userDB.id);
  
  console.log(`getUserSubscriptionStatus: Trial info - isInTrial: ${trialInfo.isInTrial}, daysRemaining: ${trialInfo.daysRemaining}`);
  
  if (trialInfo.isInTrial) {
    console.log(`getUserSubscriptionStatus: Returning TRIAL plan for user ${userDB.email}`);
    return {
      plan: "trial",
      status: "trialing",
      trialEndDate: trialInfo.trialEndDate,
      daysRemaining: trialInfo.daysRemaining,
    };
  }

  // Default to free
  console.log(`getUserSubscriptionStatus: Returning FREE plan for user ${userDB.email}`);
  return { 
    plan: "free", 
    status: "free", 
    customerId: userDB.stripe_customer_id ?? undefined
  };
}

export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
  try {
    console.log("Canceling subscription at period end:", subscriptionId);
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log("Subscription canceled at period end:", subscription.id);
    
    // Update user's subscription status in database
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (user?.email) {
      await prisma.user.updateMany({
        where: { email: user.email },
        data: { subscription_status: 'canceled' },
      });
    }

    return { success: true, subscription };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
} 