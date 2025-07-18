"use server";

import { revalidatePath } from "next/cache";

export async function refreshDashboard() {
  console.log("Manual dashboard refresh triggered");
  revalidatePath('/dashboard', 'page');
  revalidatePath('/', 'page');
  return { success: true, timestamp: new Date().toISOString() };
} 