import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { Globe, FileText } from "lucide-react";

// Define the interface for job properties
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  createdAt: Date;
  jobUrl: string | null | undefined;
  jobSourceId: string | null | undefined;
  source?: string | null;
  companyId?: string | null;
  jobCompany?: { 
    id: string;
    label: string;
    value: string;
    logoUrl: string | null;
  } | null;
  Company?: { logoUrl?: string };
}

// Define the props interface
interface RecentJobsCardProps {
  jobs: Job[];
  showSource?: boolean;
}

export default function RecentJobsCard({ jobs, showSource = false }: RecentJobsCardProps) {
  // Function to get source icon
  const getSourceIcon = (source: string | null | undefined) => {
    switch (source) {
      case 'extension':
        return <Globe className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="mb-2">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Recent Jobs Applied</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="flex items-start gap-3 sm:gap-4 w-full">
            <Avatar className="hidden h-8 w-8 sm:flex flex-shrink-0">
              <AvatarImage
                src={(job.jobCompany?.logoUrl || job.Company?.logoUrl || "/images/jobsync-logo.svg")}
                alt="Avatar"
              />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <Link href={`/dashboard/myjobs/${job?.id}`} className="flex-1 min-w-0">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none line-clamp-1">
                  {job.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {job.company}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.location && job.location.includes(' - ') ? (
                    <>
                      <span className="inline-block bg-muted px-1 rounded text-xs mr-1">
                        {job.location.split(' - ')[0]}
                      </span>
                      <span className="line-clamp-1">{job.location.split(' - ')[1]}</span>
                    </>
                  ) : (
                    <span className="inline-block bg-muted px-1 rounded text-xs line-clamp-1">
                      {job.location}
                    </span>
                  )}
                </p>
              </div>
            </Link>
            <div className="ml-auto flex flex-col items-end gap-2 flex-shrink-0">
              {showSource && (
                <div title={`Source: ${job.source || 'manual'}`}> 
                  {getSourceIcon(job.source)}
                </div>
              )}
              <div className="text-xs sm:text-sm font-medium text-right">
                {format(new Date(job.createdAt), "PP")}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
