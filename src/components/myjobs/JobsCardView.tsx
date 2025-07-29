"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreHorizontal, ExternalLink, Building2, MapPin, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobResponse, JobStatus } from "@/models/job.model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteAlertDialog } from "../DeleteAlertDialog";
import Image from "next/image";

type JobsCardViewProps = {
  jobs: JobResponse[];
  jobStatuses: JobStatus[];
  deleteJob: (id: string) => void;
  editJob: (id: string) => void;
  onChangeJobStatus: (id: string, status: JobStatus) => void;
};

function JobsCardView({
  jobs,
  jobStatuses,
  deleteJob,
  editJob,
  onChangeJobStatus,
}: JobsCardViewProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState("");
  const router = useRouter();

  const viewJobDetails = (jobId: string) => {
    router.push(`/dashboard/myjobs/${jobId}`);
  };

  const onDeleteJob = (jobId: string) => {
    setAlertOpen(true);
    setJobIdToDelete(jobId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-500";
      case "interview":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "draft":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "interview":
        return "Interview";
      case "rejected":
        return "Rejected";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job: JobResponse) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={job.Company?.logoUrl || "/images/jobsync-logo.svg"}
                      alt={`${job.Company?.label || 'Company'} logo`}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover border"
                      onError={(e) => {
                        // Fallback to default logo if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/jobsync-logo.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                      {job.JobTitle?.label || job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {job.Company?.label || job.company}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => viewJobDetails(job.id)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editJob(job.id)}>
                      <Building2 className="mr-2 h-4 w-4" />
                      Edit Job
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {jobStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status.id}
                        onClick={() => onChangeJobStatus(job.id, status)}
                        disabled={job.Status && status.id === job.Status.id}
                      >
                        <span>{status.label}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDeleteJob(job.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Location */}
                {job.Location?.label && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">
                      {job.Location.label.includes(' - ') ? (
                        <>
                          <Badge variant="outline" className="text-xs mr-1">
                            {job.Location.label.split(' - ')[0]}
                          </Badge>
                          {job.Location.label.split(' - ')[1]}
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {job.Location.label}
                        </Badge>
                      )}
                    </span>
                  </div>
                )}

                {/* Date Applied */}
                {job.appliedDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Applied {format(new Date(job.appliedDate), "MMM d, yyyy")}</span>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(job.Status?.value || 'draft')} text-white`}>
                    {getStatusText(job.Status?.value || 'draft')}
                  </Badge>
                  
                  {/* Source */}
                  {job.JobSource?.label && (
                    <span className="text-xs text-muted-foreground">
                      via {job.JobSource.label}
                    </span>
                  )}
                </div>

                {/* Job URL */}
                {job.jobUrl && (
                  <div className="pt-2">
                    <Link
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Original Posting
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <DeleteAlertDialog
        pageTitle="job"
        open={alertOpen}
        onOpenChange={setAlertOpen}
        onDelete={() => deleteJob(jobIdToDelete)}
      />
    </>
  );
}

export default JobsCardView; 