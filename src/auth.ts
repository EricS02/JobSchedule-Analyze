import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const { getUser, isAuthenticated, getPermissions, getOrganization, getOrganizations, createOrg, updateOrg, deleteOrg, getToken, refreshTokens, logout, login, register } = getKindeServerSession();

// Helper function to get user session
export async function getUserSession() {
  return await getKindeServerSession();
}
