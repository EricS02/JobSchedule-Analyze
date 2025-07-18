import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Missing stripe signature or webhook secret" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCancellation(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: any) {
  const customerId = subscription.customer;
  
  const user = await prisma.user.findFirst({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
    },
  });

  console.log(`Subscription ${subscription.status} for user: ${user.id}`);
}

async function handleSubscriptionCancellation(subscription: any) {
  const customerId = subscription.customer;
  
  const user = await prisma.user.findFirst({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscription_status: "canceled",
    },
  });

  console.log(`Subscription canceled for user: ${user.id}`);
}

async function handlePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer;
  
  const user = await prisma.user.findFirst({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscription_status: "active",
    },
  });

  console.log(`Payment succeeded for user: ${user.id}`);
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  
  const user = await prisma.user.findFirst({
    where: { stripe_customer_id: customerId },
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscription_status: "past_due",
    },
  });

  console.log(`Payment failed for user: ${user.id}`);
} 