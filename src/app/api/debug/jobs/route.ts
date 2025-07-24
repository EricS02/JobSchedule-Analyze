import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        locationId: true,
        status: true,
        applied: true,
        jobsAppliedLocation: {
          select: {
            id: true,
            label: true,
            value: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Debug jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
} 