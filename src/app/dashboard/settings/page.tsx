import { redirect } from "next/navigation";

export default function Settings() {
  // Redirect to dashboard since settings functionality has been moved to header
  redirect("/dashboard");
}
