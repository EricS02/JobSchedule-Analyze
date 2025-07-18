"use server";

import { stripe, STRIPE_PRICE_IDS, PLAN_LIMITS } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";

interface StripeSubscription {
  status: string;
  current_period_start: number;
  current_period_end: number;
  created: number;
}

export async function hasSubscription(): Promise<{
  isSubscribed: boolean;
  subscriptionData: StripeSubscription[];
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
    });

    console.log("Checkout session created:", checkout.id);
    console.log("Checkout URL:", checkout.url);
    
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

export async function checkJobTrackingEligibility(): Promise<{
  isEligible: boolean;
  message: string;
  remainingJobs: number;
}> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.email) {
    return {
      isEligible: false,
      message: "You must be logged in to track jobs.",
      remainingJobs: 0,
    };
  }

  const userDB = await prisma.user.findFirst({
    where: {
      email: user.email,
    },
  });

  if (!userDB) {
    return {
      isEligible: false,
      message: "User not found.",
      remainingJobs: 0,
    };
  }

  // Check if user has active subscription
  const stripeSubscriptionData = await hasSubscription();
  const isSubscribed = stripeSubscriptionData.isSubscribed;

  if (isSubscribed) {
    return {
      isEligible: true,
      message: "Unlimited job tracking with Pro plan.",
      remainingJobs: -1, // unlimited
    };
  }

  // Count jobs created today for free plan
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
      message: `You have reached the daily limit of ${PLAN_LIMITS.FREE.maxJobs} job applications for the free plan. Upgrade to Pro for unlimited job tracking.`,
      remainingJobs: 0,
    };
  }

  return {
    isEligible: true,
    message: `You have ${remainingJobs} job application${remainingJobs !== 1 ? "s" : ""} remaining today on the free plan.`,
    remainingJobs: remainingJobs,
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

export async function getUserSubscriptionStatus() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user || !user.email) {
    return { plan: "free", status: "not_logged_in" };
  }

  const userDB = await prisma.user.findFirst({
    where: { email: user.email },
  });

  if (!userDB) {
    return { plan: "free", status: "user_not_found" };
  }

  if (!userDB.stripe_customer_id) {
    return { plan: "free", status: "free", customerId: undefined };
  }

  // Get subscription details from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: userDB.stripe_customer_id,
    status: 'all',
    limit: 1,
  });

  const subscription = subscriptions.data[0];
  const isSubscribed = subscription && ['active', 'trialing'].includes(subscription.status);

  return {
    plan: isSubscribed ? "pro" : "free",
    status: subscription?.status || "free",
    customerId: userDB.stripe_customer_id,
    subscriptionId: subscription?.id,
    currentPeriodEnd: subscription?.current_period_end,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
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