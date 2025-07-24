import { redirect } from "next/navigation";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default function Settings() {
  // Redirect to dashboard since settings functionality has been moved to header
  redirect("/dashboard");
}
