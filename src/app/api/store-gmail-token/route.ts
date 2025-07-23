import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/secure-crypto";

export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = user.id;
    const { accessToken, refreshToken } = await req.json();
    if (!accessToken || !refreshToken) {
      return NextResponse.json({ message: "Missing token(s)" }, { status: 400 });
    }
    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt(refreshToken);
    // Upsert the Gmail token for this user
    await prisma.gmailToken.upsert({
      where: { userId },
      update: { accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken },
      create: { userId, accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to store Gmail token:", error);
    return NextResponse.json({ message: "Failed to store Gmail token" }, { status: 500 });
  }
} 