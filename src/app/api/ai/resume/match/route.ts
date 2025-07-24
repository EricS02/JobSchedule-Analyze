import "server-only";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resume } from "@/models/profile.model";
import { AiModel } from "@/models/ai.model";
import { JobResponse } from "@/models/job.model";

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export const POST = async (req: NextRequest) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const userId = user?.id;
  if (!user) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
  }
  const { resumeId, jobId, selectedModel } = (await req.json()) as {
    resumeId: string;
    jobId: string;
    selectedModel: AiModel;
  };
  try {
    if (!resumeId || !jobId || !selectedModel) {
      throw new Error("ResumeId, Job Id and selectedModel is required");
    }

    const { getResumeById } = await import("@/actions/profile.actions");
    const { getJobDetails } = await import("@/actions/job.actions");
    const { getJobMatchWithSubscriptionCheck } = await import("@/actions/ai.actions");
    
    const [resume, { job }]: [Resume, { job: JobResponse }] = await Promise.all(
      [getResumeById(resumeId), getJobDetails(jobId)]
    );

    // Use subscription-checked version
    const result = await getJobMatchWithSubscriptionCheck(resume, job, selectedModel.model);
    
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
        error.message =
          "Fetch failed, please make sure selected AI provider service is running.";
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
