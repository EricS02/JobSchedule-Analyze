import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/secure-crypto";
import { google } from "googleapis";
import { updateJobStatus } from "@/actions/job.actions";

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

// Dummy status mapping for demonstration
const STATUS_KEYWORDS = [
  { keyword: "interview", status: "interview" },
  { keyword: "rejected", status: "rejected" },
  { keyword: "received", status: "applied" },
];

export async function GET(req: NextRequest) {
  try {
    // Get all users with a Gmail token
    const gmailTokens = await prisma.gmailToken.findMany();    for (const tokenRow of gmailTokens) {
      const accessToken = decrypt(tokenRow.accessToken);
      const refreshToken = decrypt(tokenRow.refreshToken);
      // Set up OAuth2 client
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "postmessage"
      );
      oAuth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
      // Fetch recent emails (last 10 for demo)
      const messagesRes = await gmail.users.messages.list({ userId: "me", maxResults: 10 });
      const messages = messagesRes.data.messages || [];
      for (const msg of messages) {
        const msgData = await gmail.users.messages.get({ userId: "me", id: msg.id! });
        const snippet = msgData.data.snippet?.toLowerCase() || "";
        // Try to match a status keyword
        for (const { keyword, status } of STATUS_KEYWORDS) {
          if (snippet.includes(keyword)) {
            // Improved job matching: match by job title or company in snippet
            const jobs = await prisma.job.findMany({ where: { userId: tokenRow.userId } });
            const matchedJobs = jobs.filter(job => {
              const title = job.title?.toLowerCase() || "";
              const company = job.company?.toLowerCase() || "";
              // Expand this logic as needed (e.g., jobUrl, custom tags)
              return snippet.includes(title) || snippet.includes(company);
            });
            for (const job of matchedJobs) {
              await updateJobStatus(job.id, { id: status, value: status, label: status });
            }
            break;
          }
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to poll Gmail:", error);
    return NextResponse.json({ message: "Failed to poll Gmail" }, { status: 500 });
  }
} 