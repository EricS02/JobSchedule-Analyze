"use server";
import { delay } from "@/utils/delay";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    delay(1000);
    // Kinde auth uses components for login, not server actions
    // This function is kept for compatibility but should be replaced with Kinde components
    throw new Error("Please use Kinde LoginLink component for authentication");
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return "Something went wrong.";
  }
}
