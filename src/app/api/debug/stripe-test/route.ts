import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import prisma from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 Stripe test endpoint called");
    
    // Get the Kinde session
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();
    
    if (!kindeUser || !kindeUser.email) {
      return NextResponse.json({
        success: false,
        message: "No valid Kinde session found",
        stripeConfig: {
          priceId: STRIPE_PRICE_IDS.PRO_PLAN,
          priceIdValid: STRIPE_PRICE_IDS.PRO_PLAN.startsWith('price_'),
        }
      });
    }
    
    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: kindeUser.email },
    });
    
    // Test Stripe price retrieval
    let priceTest = null;
    try {
      if (STRIPE_PRICE_IDS.PRO_PLAN.startsWith('price_')) {
        const price = await stripe.prices.retrieve(STRIPE_PRICE_IDS.PRO_PLAN);
        priceTest = {
          success: true,
          priceId: price.id,
          unitAmount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
        };
      } else {
        priceTest = {
          success: false,
          error: "Price ID format invalid - should start with 'price_'",
          currentValue: STRIPE_PRICE_IDS.PRO_PLAN,
        };
      }
    } catch (error) {
      priceTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
    
    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        stripe_customer_id: user.stripe_customer_id
      } : null,
      stripeConfig: {
        priceId: STRIPE_PRICE_IDS.PRO_PLAN,
        priceIdValid: STRIPE_PRICE_IDS.PRO_PLAN.startsWith('price_'),
        priceTest,
      }
    });
    
  } catch (error) {
    console.error("Stripe test error:", error);
    return NextResponse.json({
      success: false,
      message: "Error testing Stripe configuration",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 