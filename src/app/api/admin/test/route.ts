import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// List of admin emails who can grant premium access
const ADMIN_EMAILS = [
  'jobschedule4@gmail.com',
  // Add more admin emails here
];

export async function GET() {
  try {
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();
    
    const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);
    
    return NextResponse.json({
      success: true,
      currentUser: {
        email: currentUser?.email || 'not_logged_in',
        isAdmin: isAdmin
      },
      adminEmails: ADMIN_EMAILS,
      message: isAdmin 
        ? "You have admin access" 
        : "You don't have admin access"
    });
    
  } catch (error) {
    console.error("Admin test error:", error);
    return NextResponse.json(
      { error: "Failed to check admin status" },
      { status: 500 }
    );
  }
} 