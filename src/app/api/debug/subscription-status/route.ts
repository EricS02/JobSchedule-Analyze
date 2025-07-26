import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    console.log('🔍 === SUBSCRIPTION STATUS DEBUG ===');
    
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('🔍 User email:', user.email);

    // Get the user from database with all subscription-related fields
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        email: true,
        trial_start_date: true,
        trial_end_date: true,
        has_used_trial: true,
        subscription_status: true,
        stripe_customer_id: true,
        created_at: true,
      },
    });

    console.log('🔍 Database user:', dbUser);

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate trial status
    const now = new Date();
    const trialStart = dbUser.trial_start_date;
    const trialEnd = dbUser.trial_end_date;
    
    let trialStatus = {
      hasTrialStart: !!trialStart,
      hasTrialEnd: !!trialEnd,
      trialStartDate: trialStart,
      trialEndDate: trialEnd,
      isCurrentlyInTrial: false,
      trialExpired: false,
      daysRemaining: 0,
    };

    if (trialStart && trialEnd) {
      const trialEndDate = new Date(trialEnd);
      trialStatus.isCurrentlyInTrial = now < trialEndDate && !dbUser.has_used_trial;
      trialStatus.trialExpired = now >= trialEndDate;
      
      if (trialStatus.isCurrentlyInTrial) {
        const diffTime = trialEndDate.getTime() - now.getTime();
        trialStatus.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    console.log('🔍 Trial status:', trialStatus);
    console.log('🔍 Subscription status:', dbUser.subscription_status);

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        subscription_status: dbUser.subscription_status,
        stripe_customer_id: dbUser.stripe_customer_id,
        created_at: dbUser.created_at,
      },
      trial: trialStatus,
      canCancelTrial: trialStatus.isCurrentlyInTrial && dbUser.subscription_status === 'trial',
      debug: {
        currentTime: now.toISOString(),
        hasUsedTrial: dbUser.has_used_trial,
      }
    });

  } catch (error) {
    console.error('Error in subscription status debug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 