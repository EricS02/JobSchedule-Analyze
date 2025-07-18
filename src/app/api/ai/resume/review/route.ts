import "server-only";

import { auth } from "@/auth";
import { NextApiRequest, NextApiResponse } from "next";
import {
  getResumeReviewByOpenAi,
  getResumeReviewWithSubscriptionCheck,
} from "@/actions/ai.actions";
import { NextRequest, NextResponse } from "next/server";
import { Resume } from "@/models/profile.model";
import { AiModel } from "@/models/ai.model";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const POST = async (req: NextRequest, res: NextApiResponse) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  console.log("AI Review - User check:", {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email
  });

  if (!user) {
    return res.status(401).json({ message: "Not Authenticated" });
  }
  const { selectedModel, resume } = (await req.json()) as {
    selectedModel: AiModel;
    resume: Resume;
  };
  try {
    if (!resume || !selectedModel) {
      throw new Error("Resume or selected model is required");
    }

    console.log("AI Review - Calling subscription check for user:", user.email);
    
    // Use subscription-checked version
    const result = await getResumeReviewWithSubscriptionCheck(resume, selectedModel.model);
    
    console.log("AI Review - Subscription check result:", {
      success: result.success,
      error: result.error
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 403, statusText: "Subscription Required" }
      );
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = "Error getting AI response.";
    console.error(message, error);
    if (error instanceof Error) {
      if (error.message === "fetch failed") {
        error.message = "Fetch failed, please make sure OpenAI service is available.";
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500, statusText: error.message }
      );
    }
    return NextResponse.json(
      { error: message },
      { status: 500, statusText: message }
    );
  }
};
