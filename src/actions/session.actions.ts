"use server";

import { getCurrentUser } from "@/utils/user.utils";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";

/**
 * Save a value to server-side session storage
 */
export const saveToSession = async (key: string, value: any): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const stringifiedValue = JSON.stringify(value);

    // Upsert the session data
    const session = await prisma.userSession.upsert({
      where: {
        userId_key: {
          userId: user.id,
          key: key,
        },
      },
      update: {
        value: stringifiedValue,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        key: key,
        value: stringifiedValue,
      },
    });

    return { success: true, data: session };
  } catch (error) {
    const msg = "Failed to save session data. ";
    return handleError(error, msg);
  }
};

/**
 * Get a value from server-side session storage
 */
export const getFromSession = async (key: string, defaultValue: any = null): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return defaultValue;
    }

    const session = await prisma.userSession.findUnique({
      where: {
        userId_key: {
          userId: user.id,
          key: key,
        },
      },
    });

    if (!session) {
      return defaultValue;
    }

    try {
      return JSON.parse(session.value);
    } catch (parseError) {
      console.error("Failed to parse session value:", parseError);
      return defaultValue;
    }
  } catch (error) {
    console.error("Failed to get session data:", error);
    return defaultValue;
  }
};

/**
 * Remove a value from server-side session storage
 */
export const removeFromSession = async (key: string): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    await prisma.userSession.delete({
      where: {
        userId_key: {
          userId: user.id,
          key: key,
        },
      },
    });

    return { success: true };
  } catch (error) {
    const msg = "Failed to remove session data. ";
    return handleError(error, msg);
  }
};

/**
 * Get all session data for a user
 */
export const getAllSessionData = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const sessions = await prisma.userSession.findMany({
      where: {
        userId: user.id,
      },
    });

    const sessionData: Record<string, any> = {};
    sessions.forEach((session) => {
      try {
        sessionData[session.key] = JSON.parse(session.value);
      } catch (parseError) {
        console.error(`Failed to parse session value for key ${session.key}:`, parseError);
      }
    });

    return { success: true, data: sessionData };
  } catch (error) {
    const msg = "Failed to get all session data. ";
    return handleError(error, msg);
  }
};

/**
 * Clear all session data for a user
 */
export const clearAllSessionData = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    await prisma.userSession.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    const msg = "Failed to clear session data. ";
    return handleError(error, msg);
  }
};

/**
 * Clean up old session data (older than 30 days)
 */
export const cleanupOldSessionData = async (): Promise<any | undefined> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedCount = await prisma.userSession.deleteMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return { success: true, deletedCount: deletedCount.count };
  } catch (error) {
    const msg = "Failed to cleanup old session data. ";
    return handleError(error, msg);
  }
}; 