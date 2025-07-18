"use server";
import { AuthError } from "next-auth";
import { login } from "../auth";
import { delay } from "@/utils/delay";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    delay(1000);
    await login("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
