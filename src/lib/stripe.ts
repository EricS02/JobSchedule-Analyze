import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Stripe price IDs - replace with your actual price IDs
export const STRIPE_PRICE_IDS = {
  PRO_PLAN: process.env.STRIPE_PRO_PRICE_ID || 'price_your_pro_plan_id_here',
} as const;

// Validate price ID format
if (!STRIPE_PRICE_IDS.PRO_PLAN.startsWith('price_')) {
  console.warn('⚠️ STRIPE_PRO_PRICE_ID should start with "price_". Current value:', STRIPE_PRICE_IDS.PRO_PLAN);
}

// ✅ UPDATED: New pricing structure with trial
export const PLAN_LIMITS = {
  FREE: {
    maxJobs: 5,
    aiFeatures: false,
  },
  TRIAL: {
    maxJobs: -1, // unlimited
    aiFeatures: true,
    durationDays: 7,
  },
  PRO: {
    maxJobs: -1, // unlimited
    aiFeatures: true,
  },
} as const;

export const TRIAL_CONFIG = {
  durationDays: 7,
  startOnSignup: true,
} as const; 