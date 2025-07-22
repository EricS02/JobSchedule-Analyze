import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { sanitizeText } from "./security";

export async function requireAuth() {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  
  if (!kindeUser?.email) {
    throw new Error('Authentication required');
  }
  
  const user = await prisma.user.findUnique({
    where: { email: kindeUser.email }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

export async function requireResourceOwnership(resourceUserId: string) {
  const user = await requireAuth();
  
  if (user.id !== resourceUserId) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

// Enhanced user utils with security
export async function getCurrentUserSecure() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.email) return null;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      console.error('Invalid email format:', user.email);
      return null;
    }
    
    return await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.given_name && user.family_name 
          ? `${sanitizeText(user.given_name)} ${sanitizeText(user.family_name)}` 
          : sanitizeText(user.email),
        lastLoginAt: new Date(),
      },
      create: {
        email: user.email,
        name: user.given_name && user.family_name 
          ? `${sanitizeText(user.given_name)} ${sanitizeText(user.family_name)}` 
          : sanitizeText(user.email),
        password: '',
        lastLoginAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Secure user fetch error:", error);
    return null;
  }
}

// Check if user has subscription access
export async function requireSubscription() {
  const user = await requireAuth();
  
  // Check if user has active subscription or is in trial
  const hasActiveSubscription = user.stripe_subscription_id && user.subscription_status === 'active';
  const isInTrial = user.trial_start_date && user.trial_end_date && new Date() < user.trial_end_date;
  
  if (!hasActiveSubscription && !isInTrial) {
    throw new Error('Subscription required');
  }
  
  return user;
}

// Validate user permissions for specific actions
export async function validateUserAction(action: string, userId: string) {
  const user = await requireAuth();
  
  // Basic ownership check
  if (user.id !== userId) {
    throw new Error(`Insufficient permissions for ${action}`);
  }
  
  // Rate limiting could be added here
  // Additional permission checks could be added here
  
  return user;
}

// Session validation
export async function validateSession() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user?.email) {
    return { valid: false, user: null };
  }
  
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });
  
  return { 
    valid: !!dbUser, 
    user: dbUser 
  };
} 