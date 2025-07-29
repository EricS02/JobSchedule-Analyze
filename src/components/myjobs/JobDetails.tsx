"use client";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { cn, formatUrl } from "@/lib/utils";
import { JobResponse } from "@/models/job.model";
import { TipTapContentViewer } from "../TipTapContentViewer";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { AiJobMatchSection } from "../profile/AiJobMatchSection";
import { useState } from "react";
import { DownloadFileButton } from "../profile/DownloadFileButton";
import React from "react";
import { useEffect } from "react";
import { Select } from "../ui/select";

// Utility function to format scraped job description text
function formatJobDescription(text: string) {
  // Simple heuristics to split into sections and bullet points
  if (!text) return null;
  
  // If it looks like HTML, render as HTML
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  }
  
  // Check if it's already structured (from our extension)
  if (text.includes('**About:**') || text.includes('**Responsibilities:**') || text.includes('**Requirements:**')) {
    const sections = text.split(/\*\*([^*]+)\*\*:/);
    let content: React.ReactNode[] = [];
    
    for (let i = 1; i < sections.length; i += 2) {
      const sectionTitle = sections[i];
      const sectionContent = sections[i + 1]?.trim() || '';
      
      if (sectionContent) {
        content.push(
          <div key={sectionTitle} className="mb-6">
            <h4 className="font-bold mb-3 text-lg text-blue-600">{sectionTitle}</h4>
            <div className="pl-4 space-y-2">
              {sectionContent.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                
                if (/^[-*•]/.test(trimmed)) {
                  // Bullet point
                  return (
                    <li key={idx} className="list-disc ml-4 text-gray-700">
                      {trimmed.replace(/^[-*•]\s*/, '')}
                    </li>
                  );
                } else {
                  return (
                    <p key={idx} className="text-gray-700 leading-relaxed">
                      {trimmed}
                    </p>
                  );
                }
              })}
            </div>
          </div>
        );
      }
    }
    
    return <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border shadow-sm">{content}</div>;
  }
  
  // Otherwise, format as structured JSX
  // Define section titles to look for
  const sections = [
    "About the Job",
    "Application Instructions",
    "About Ericsson",
    "What You'll Do",
    "You Will Bring",
    "Additional Qualifications & Experience We Value",
    "Why Join Ericsson?",
    "Eligibility Requirements",
    "What Happens Once You Apply?",
    "Additional Information",
    "Job Details",
    "Compensation and Benefits",
    "About",
    "Responsibilities",
    "Requirements",
    "Benefits",
    "Qualifications"
  ];
  
  // Split text into lines
  const lines = text.split(/\n|(?=\b[A-Z][^\n:]{2,40}:)/g);
  let content: React.ReactNode[] = [];
  let currentSection: string | null = null;
  let sectionContent: React.ReactNode[] = [];
  
  const pushSection = () => {
    if (currentSection) {
      content.push(
        <div key={currentSection} className="mb-6">
          <h4 className="font-bold mb-3 text-lg text-blue-600">{currentSection}</h4>
          <div className="pl-4 space-y-2">
            {sectionContent.map((item, idx) => (
              <div key={idx} className="text-gray-700 leading-relaxed">{item}</div>
            ))}
          </div>
        </div>
      );
    }
    sectionContent = [];
  };
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Check if this line is a section title
    const matchedSection = sections.find((s) =>
      trimmed.toLowerCase().startsWith(s.toLowerCase())
    );
    
    if (matchedSection) {
      pushSection();
      currentSection = matchedSection;
      sectionContent = [trimmed.replace(new RegExp(`^${matchedSection}:?`,'i'), '').trim()];
    } else if (/^[-*•]/.test(trimmed)) {
      // Bullet point
      sectionContent.push(
        <li key={sectionContent.length} className="list-disc ml-4 text-gray-700">
          {trimmed.replace(/^[-*•]\s*/, '')}
        </li>
      );
    } else {
      sectionContent.push(trimmed);
    }
  });
  
  pushSection();
  return <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border shadow-sm">{content}</div>;
}

function JobDetails({ job }: { job: JobResponse }) {
  console.log('JobDetails: job object', {
    id: job.id,
    title: job.JobTitle?.label,
    company: job.Company?.label,
    description: job.description?.substring(0, 100),
    detailedDescription: job.detailedDescription?.substring(0, 100),
    hasDescription: !!job.description,
    hasDetailedDescription: !!job.detailedDescription
  });
  const [aiSectionOpen, setAiSectionOpen] = useState(false);
  const router = useRouter();
  const goBack = () => router.back();
  const getAiJobMatch = async () => {
    setAiSectionOpen(true);
  };
  const getJobType = (code: string) => {
    switch (code) {
      case "FT":
        return "Full-time";
      case "PT":
        return "Part-time";
      case "C":
        return "Contract";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <Button title="Go Back" size="sm" variant="outline" onClick={goBack}>
          <ArrowLeft />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1 cursor-pointer"
          onClick={getAiJobMatch}
          // disabled={loading}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Match with AI
          </span>
        </Button>
      </div>
      {/* ATS Result Display */}
      {job?.id && (
        <Card className="col-span-3">
          <CardHeader className="flex-row justify-between relative">
            <div>
              {job?.Company?.label && (
                <div className="text-lg font-semibold mb-1">{job.Company.label}</div>
              )}
              <CardTitle className="text-2xl font-bold mb-4 mt-2">{job?.JobTitle?.label}</CardTitle>
              {/* Location Section */}
              {job?.Location?.label && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Location:</span>
                  {job.Location.label.includes(' - ') ? (
                    <>
                      <Badge variant="outline" className="text-xs">
                        {job.Location.label.split(' - ')[0]}
                      </Badge>
                      <span>{job.Location.label.split(' - ')[1]}</span>
                    </>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {job.Location.label}
                    </Badge>
                  )}
                </div>
              )}
              {/* Job Type */}
              {job?.jobType && (
                <div className="mb-2">
                  <span className="font-semibold">Type:</span> {getJobType(job?.jobType)}
                </div>
              )}
            </div>
            <div>
              {job?.Resume && job?.Resume?.File && job.Resume?.File?.filePath
                ? DownloadFileButton(
                    job?.Resume?.File?.filePath,
                    job?.Resume?.title,
                    job?.Resume?.File?.fileName
                  )
                : null}
            </div>
          </CardHeader>
          {/* Status and Date */}
          <div className="ml-4 mb-2 flex items-center gap-2">
            {new Date() > job.dueDate && job.Status?.value === "draft" ? (
              <Badge className="bg-red-500">Expired</Badge>
            ) : (
              <Badge
                className={cn(
                  "w-[70px] justify-center",
                  job.Status?.value === "applied" && "bg-cyan-500",
                  job.Status?.value === "interview" && "bg-green-500"
                )}
              >
                {job.Status?.label}
              </Badge>
            )}
            <span>
              {job?.appliedDate ? format(new Date(job?.appliedDate), "PP") : ""}
            </span>
          </div>
          {/* Job URL Section */}
          {job.jobUrl && (
            <div className="my-3 ml-4 flex items-start gap-2">
              <span className="font-semibold mr-2 min-w-fit whitespace-nowrap">Job URL:</span>
              <div className="flex-1 min-w-0 break-words flex items-center gap-2">
                <a
                  href={formatUrl(job.jobUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400 hover:text-blue-600 break-words"
                  aria-label="Job posting URL"
                  style={{ wordBreak: 'break-all' }}
                >
                  {job.jobUrl}
                </a>
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-1"
                  title="Copy URL"
                  aria-label="Copy job URL"
                  onClick={() => navigator.clipboard.writeText(job.jobUrl)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75A2.25 2.25 0 0015 9.75v-6A2.25 2.25 0 0012.75 1.5h-6A2.25 2.25 0 004.5 3.75v6A2.25 2.25 0 006.75 12H9zm6 0h1.25A2.25 2.25 0 0018.5 9.75v-6A2.25 2.25 0 0016.25 1.5h-6A2.25 2.25 0 008 3.75v6A2.25 2.25 0 0010.25 12H15zm-6 6h6m-6 0a2.25 2.25 0 01-2.25-2.25v-6A2.25 2.25 0 019 7.5h6A2.25 2.25 0 0117.25 9.75v6A2.25 2.25 0 0115 18zm-6 0a2.25 2.25 0 01-2.25-2.25v-6A2.25 2.25 0 019 7.5h6A2.25 2.25 0 0117.25 9.75v6A2.25 2.25 0 0115 18z" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
          {/* Detailed Job Description Section */}
          {(job?.detailedDescription || job?.description) && (
            <div className="my-4 ml-4">
              <h4 className="font-bold mb-2">Job Description</h4>
              {formatJobDescription(job.detailedDescription || job.description)}
            </div>
          )}
          <CardFooter></CardFooter>
        </Card>
      )}
      {
        <AiJobMatchSection
          jobId={job?.id}
          aISectionOpen={aiSectionOpen}
          triggerChange={setAiSectionOpen}
        />
      }
    </>
  );
}

export default JobDetails;
