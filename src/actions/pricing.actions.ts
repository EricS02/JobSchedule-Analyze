"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createCustomerIfNull, createCheckoutLink } from "./stripe.actions";

export async function handleProPlanUpgrade() {
  try {
    console.log("🔍 handleProPlanUpgrade called");
    console.log("🔍 Request timestamp:", new Date().toISOString());
    
    // Get the Kinde session
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();
    
    console.log("Kinde user in server action:", {
      id: kindeUser?.id,
      email: kindeUser?.email
    });
    
    if (!kindeUser || !kindeUser.email) {
      console.log("No valid Kinde session found in server action");
      // Return redirect URL with proper parameters
      return {
        success: false,
        message: "Not authenticated",
        redirectTo: "/api/auth/login?post_login_redirect_url=" + encodeURIComponent("/pricing?checkout=true")
      };
    }
    
    console.log("Starting checkout process for user:", kindeUser.email);
    
    // Create Stripe customer if doesn't exist
    const customerId = await createCustomerIfNull();
    if (!customerId) {
      throw new Error("Failed to create customer");
    }
    
    console.log("Customer ID:", customerId);

    // Create checkout session
    const checkoutUrl = await createCheckoutLink(customerId);
    console.log("Checkout URL:", checkoutUrl);
    
    if (checkoutUrl) {
      return {
        success: true,
        checkoutUrl,
        message: "Checkout URL generated successfully"
      };
    } else {
      throw new Error("Failed to generate checkout URL");
    }
    
  } catch (error) {
    console.error("Error in handleProPlanUpgrade:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to start checkout. Please try again."
    };
  }
} 