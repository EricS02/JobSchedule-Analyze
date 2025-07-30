"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";
import {
  ListCollapse,
  MoreHorizontal,
  Pencil,
  Tags,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useState } from "react";
import { JobResponse, JobStatus } from "@/models/job.model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteAlertDialog } from "../DeleteAlertDialog";

type MyJobsTableProps = {
  jobs: JobResponse[];
  jobStatuses: JobStatus[];
  deleteJob: (id: string) => void;
  editJob: (id: string) => void;
  onChangeJobStatus: (id: string, status: JobStatus) => void;
};

function MyJobsTable({
  jobs,
  jobStatuses,
  deleteJob,
  editJob,
  onChangeJobStatus,
}: MyJobsTableProps) {
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

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Company Logo</span>
              </TableHead>
              <TableHead className="hidden md:table-cell">Date Applied</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden sm:table-cell">Company</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job: JobResponse) => {
              return (
                <TableRow key={job.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Company logo"
                      className="aspect-square rounded-md object-cover"
                      height="32"
                      src={job.Company?.logoUrl || "/images/jobsync-logo.svg"}
                      width="32"
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell w-[120px]">
                    {job.appliedDate ? format(job.appliedDate, "PP") : "N/A"}
                  </TableCell>
                  <TableCell className="font-medium cursor-pointer max-w-[150px] sm:max-w-[200px]">
                    <Link href={`/dashboard/myjobs/${job?.id}`} className="block truncate">
                      {job.JobTitle?.label}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium hidden sm:table-cell max-w-[120px]">
                    <span className="block truncate">{job.Company?.label}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[120px]">
                    <div className="flex flex-col gap-1">
                      {job.Location?.label && (
                        <div className="text-sm">
                          {job.Location.label.includes(' - ') ? (
                            <>
                              <Badge variant="outline" className="text-xs mb-1">
                                {job.Location.label.split(' - ')[0]}
                              </Badge>
                              <div className="text-muted-foreground truncate">
                                {job.Location.label.split(' - ')[1]}
                              </div>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs truncate">
                              {job.Location.label}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date() > job.dueDate && job.Status?.value === "draft" ? (
                      <Badge className="bg-red-500 text-xs">Expired</Badge>
                    ) : (
                      <Badge
                        className={cn(
                          "w-[60px] sm:w-[70px] justify-center text-xs",
                          job.Status?.value === "applied" && "bg-cyan-500",
                          job.Status?.value === "interview" && "bg-green-500"
                        )}
                      >
                        {job.Status?.label}
                        {job.applied && job.Status?.value === "applied" && (
                          <span className="ml-1">✓</span>
                        )}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs">{job.JobSource?.label}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                          data-testid="job-actions-menu-btn"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => viewJobDetails(job?.id)}
                          >
                            <ListCollapse className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => editJob(job.id)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Tags className="mr-2 h-4 w-4" />
                              Change status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent className="p-0">
                                {jobStatuses.map((status) => (
                                  <DropdownMenuItem
                                    key={status.id}
                                    onClick={() => {
                                      onChangeJobStatus(job.id, status);
                                    }}
                                    disabled={job.Status && status.id === job.Status.id}
                                  >
                                    <span>{status.label}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                            {/* <Command>
                                <CommandList>
                                  <CommandGroup>
                                    {jobStatuses.map((status) => (
                                      <CommandItem
                                        className="cursor-pointer"
                                        key={status.id}
                                        value={status.label}
                                        onSelect={(value) => {
                                          onChangeJobStatus(value);
                                        }}
                                      >
                                        {status.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command> */}
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => onDeleteJob(job.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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

export default MyJobsTable;
