import "server-only";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { CurrentUser } from "@/models/user.model";
import { getCurrentUserSecure } from "@/lib/auth";
import logger from "@/lib/logger";

// Centralize user fetching to ensure consistency
export async function getCurrentUser() {
  try {
    const user = await getCurrentUserSecure();
    
    if (user) {
      logger.debug(`User authenticated: ${user.email}`, { userId: user.id });
    } else {
      logger.debug("No valid session found");
    }
    
    // If this is a new user, run relationship fixing
    if (user) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });
      
      if (!existingUser) {
        logger.info(`New user created: ${user.email}`, { userId: user.id });
        try {
          // Import and run the relationship fixing function
          const { ensureUserJobRelationships } = await import('@/actions/job.actions');
          const result = await ensureUserJobRelationships();
          if (result.success) {
            logger.info(`Successfully fixed ${result.fixedCount} job relationships for new user`, { userId: user.id });
          } else {
            logger.warn(`Failed to fix job relationships for new user: ${result.message}`, { userId: user.id });
          }
        } catch (error) {
          logger.error("Error running job relationship fixing for new user", error as Error, { userId: user.id });
        }
      }
    }
    
    return user;
  } catch (error) {
    logger.error("Error getting current user", error as Error);
    return null;
  }
}
