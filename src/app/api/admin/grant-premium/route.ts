import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// List of admin emails who can grant premium access
const ADMIN_EMAILS = [
  'jobschedule4@gmail.com',
  // Add more admin emails here
];

export async function POST(request: NextRequest) {
  try {
    // Check if the current user is an admin
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();
    
    if (!currentUser?.email || !ADMIN_EMAILS.includes(currentUser.email)) {
      console.log(`Admin access denied for: ${currentUser?.email}`);
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { email, action } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!['grant', 'revoke'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'grant' or 'revoke'" },
        { status: 400 }
      );
    }

    // Check if the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      );
    }

    if (action === 'grant') {
      // Grant premium access
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          subscription_status: 'active',
          stripe_subscription_id: 'admin_granted',
          has_used_trial: true,
          trial_end_date: new Date('2099-12-31'), // Far future date
        },
      });
      
      console.log(`Admin ${currentUser.email} granted premium access to ${email}`);
      
      return NextResponse.json({
        success: true,
        message: `Premium access granted to ${email}`,
        user: { 
          email: updatedUser.email, 
          subscription_status: updatedUser.subscription_status,
          updated_at: new Date().toISOString()
        }
      });
      
    } else if (action === 'revoke') {
      // Revoke premium access
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          subscription_status: 'free',
          stripe_subscription_id: null,
          has_used_trial: false,
          trial_end_date: null,
        },
      });
      
      console.log(`Admin ${currentUser.email} revoked premium access from ${email}`);
      
      return NextResponse.json({
        success: true,
        message: `Premium access revoked from ${email}`,
        user: { 
          email: updatedUser.email, 
          subscription_status: updatedUser.subscription_status,
          updated_at: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error("Admin premium access error:", error);
    return NextResponse.json(
      { error: "Failed to update premium access" },
      { status: 500 }
    );
  }
} 