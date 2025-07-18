import "server-only";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { CurrentUser } from "@/models/user.model";
import { logInfo, logError, logWarn } from "@/lib/logger";

// Centralize user fetching to ensure consistency
export async function getCurrentUser() {
  try {
    // Get the session from Kinde
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.email) {
      logWarn("No valid session found");
      return null;
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    
    // Use upsert to handle both create and update cases
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        // Update name if it has changed
        name: user.given_name && user.family_name 
          ? `${user.given_name} ${user.family_name}` 
          : user.email,
      },
      create: {
        email: user.email,
        name: user.given_name && user.family_name 
          ? `${user.given_name} ${user.family_name}` 
          : user.email,
        password: '', // No password needed for Kinde users
      },
    });
    
    // Log the user ID for debugging
    logInfo(`Current user ID: ${dbUser.id}`, { userId: dbUser.id, email: dbUser.email });
    
    // If this is a new user (wasn't found before), run relationship fixing
    if (!existingUser) {
      logInfo(`New user created: ${dbUser.email}, running job relationship fixing...`, {
        userId: dbUser.id,
        email: dbUser.email,
      });
      try {
        // Import and run the relationship fixing function
        const { ensureUserJobRelationships } = await import('@/actions/job.actions');
        const result = await ensureUserJobRelationships();
        if (result.success) {
          logInfo(`Successfully fixed ${result.fixedCount} job relationships for new user`, {
            userId: dbUser.id,
            fixedCount: result.fixedCount,
          });
        } else {
          logWarn(`Failed to fix job relationships for new user: ${result.message}`, {
            userId: dbUser.id,
            error: result.message,
          });
        }
      } catch (error) {
        logError("Error running job relationship fixing for new user", error, {
          userId: dbUser.id,
        });
      }
    }
    
    return dbUser;
  } catch (error) {
    logError("Error getting current user", error);
    return null;
  }
}
