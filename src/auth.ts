import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const { getUser, isAuthenticated, getPermissions, getOrganization } = getKindeServerSession();

// Helper function to get user session
export async function getUserSession() {
  return await getKindeServerSession();
}
