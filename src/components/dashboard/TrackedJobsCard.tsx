import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Job } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Chrome, ExternalLink } from "lucide-react";
import Link from "next/link";

interface TrackedJobsCardProps {
  jobs: Job[];
}

export default function TrackedJobsCard({ jobs }: TrackedJobsCardProps) {
  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-0.5">
          <CardTitle className="text-lg">Extension Tracked Jobs</CardTitle>
          <CardDescription>
            Jobs tracked via the browser extension
          </CardDescription>
        </div>
        <Chrome className="w-8 h-8 ml-auto text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No jobs have been tracked with the extension yet.
          </p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex flex-col space-y-1">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium hover:underline"
                  >
                    {job.title}
                  </Link>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{job.company}</span>
                    <span className="mx-1">•</span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {job.jobUrl && (
                    <Link
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-full hover:bg-accent"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="sr-only">Open job listing</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 