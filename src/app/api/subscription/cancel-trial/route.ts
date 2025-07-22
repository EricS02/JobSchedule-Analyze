import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        trial_start_date: true,
        trial_end_date: true,
        has_used_trial: true,
        subscription_status: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is currently in trial
    if (dbUser.subscription_status !== 'trial') {
      return NextResponse.json(
        { error: "User is not in trial" },
        { status: 400 }
      );
    }

    // End the trial immediately by setting trial_end_date to now
    const now = new Date();
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        trial_end_date: now,
        subscription_status: 'free',
        has_used_trial: true,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Trial cancelled successfully",
        trialEndDate: now
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error cancelling trial:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 