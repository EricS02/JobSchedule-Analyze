"use client";
import { Resume, ResumeSection, SectionType } from "@/models/profile.model";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "../ui/card";
import AddResumeSection, { AddResumeSectionRef } from "./AddResumeSection";
import ContactInfoCard from "./ContactInfoCard";
import { useRef } from "react";
import SummarySectionCard from "./SummarySectionCard";
import ExperienceCard from "./ExperienceCard";
import EducationCard from "./EducationCard";
import OtherSectionCard from "./OtherSectionCard";
import AiResumeReviewSection from "./AiResumeReviewSection";
import { DownloadFileButton } from "./DownloadFileButton";
import { FileText, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { WorkExperience, Education } from "@/models/profile.model";

function ResumeContainer({ resume }: { resume: any }) {
  const resumeSectionRef = useRef<AddResumeSectionRef>(null);
  
  if (!resume) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resume Not Found</CardTitle>
          <CardDescription>The requested resume could not be found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { title, ContactInfo, ResumeSections, File, parsingAttempted, parsingSucceeded, parsingError } = resume;
  const summarySection = ResumeSections?.find(
    (section: ResumeSection) => section.sectionType === SectionType.SUMMARY
  );
  const experienceSection = ResumeSections?.find(
    (section: ResumeSection) => section.sectionType === SectionType.EXPERIENCE
  );
  const educationSection = ResumeSections?.find(
    (section: ResumeSection) => section.sectionType === SectionType.EDUCATION
  );
  
  // Get all other sections (Technical Skills, Projects, etc.)
  const otherSections = ResumeSections?.filter(
    (section: ResumeSection) => section.sectionType === SectionType.OTHER || section.sectionType === SectionType.PROJECT
  ) || [];
  
  const hasStructuredContent = ContactInfo || (ResumeSections && ResumeSections.length > 0);
  
  const openContactInfoDialog = () => {
    resumeSectionRef.current?.openContactInfoDialog(ContactInfo!);
  };
  const openSummaryDialogForEdit = () => {
    resumeSectionRef.current?.openSummaryDialog(summarySection!);
  };
  const openExperienceDialogForEdit = (experienceId: string) => {
    const section: ResumeSection = {
      ...experienceSection!,
      workExperiences: experienceSection?.workExperiences?.filter(
        (exp: WorkExperience) => exp.id === experienceId
      ),
    };
    resumeSectionRef.current?.openExperienceDialog(section);
  };
  const openEducationDialogForEdit = (educationId: string) => {
    const section: ResumeSection = {
      ...educationSection!,
      educations: educationSection?.educations?.filter(
        (edu: Education) => edu.id === educationId
      ),
    };
    resumeSectionRef.current?.openEducationDialog(section);
  };
  
  const openTechnicalSkillsDialogForEdit = (section: ResumeSection) => {
    resumeSectionRef.current?.openTechnicalSkillsDialog(section);
  };
  
  const openProjectsDialogForEdit = (section: ResumeSection) => {
    resumeSectionRef.current?.openProjectsDialog(section);
  };

  return (
    <>
      {/* Parsing status indicator */}
      {parsingAttempted && (
        <div className={`rounded-md p-3 mb-4 text-sm font-medium ${parsingSucceeded ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
          {parsingSucceeded ? (
            <>✅ Resume parsing succeeded! Structured data was auto-populated.</>
          ) : (
            <>
              ⚠️ Resume parsing failed. {parsingError && <span className="ml-2">{parsingError}</span>}
            </>
          )}
        </div>
      )}
      <Card>
        <CardHeader className="flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl break-words">Resume: {title}</CardTitle>
            <CardDescription className="mt-2">
              {File?.fileName && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{File.fileName}</span>
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {File?.filePath && DownloadFileButton(File.filePath, title, File.fileName)}
            <AddResumeSection resume={resume} ref={resumeSectionRef} />
            <AiResumeReviewSection resume={resume} />
          </div>
        </CardHeader>
        {File && !hasStructuredContent && (
          <CardContent>
            <div className="text-center py-6 sm:py-8 space-y-4">
              <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground" />
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">PDF Resume Uploaded</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Your resume has been uploaded as a PDF file. You can download it using the button above.
                </p>
                <div className="text-xs sm:text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md p-3 mt-4 mx-auto max-w-md">
                  <p className="font-medium">💡 Need structured data?</p>
                  <p>Your PDF has been uploaded successfully. For the best experience, consider adding structured sections below to help with job applications and tracking.</p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  To get the most out of JobSchedule, add structured content sections below.
                </p>
              </div>
              <Button
                onClick={() => resumeSectionRef.current?.openContactInfoDialog(ContactInfo!)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Contact Information
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      {ContactInfo && (
        <ContactInfoCard
          contactInfo={ContactInfo}
          openDialog={openContactInfoDialog}
        />
      )}
      {summarySection && (
        <SummarySectionCard
          summarySection={summarySection}
          openDialogForEdit={openSummaryDialogForEdit}
        />
      )}
      {experienceSection && (
        <ExperienceCard
          experienceSection={experienceSection}
          openDialogForEdit={openExperienceDialogForEdit}
        />
      )}
      {educationSection && (
        <EducationCard
          educationSection={educationSection}
          openDialogForEdit={openEducationDialogForEdit}
        />
      )}
      {otherSections.map((section: ResumeSection) => (
        <OtherSectionCard
          key={section.id}
          section={section}
          openDialogForEdit={() => {
            if (section.sectionType === SectionType.PROJECT) {
              openProjectsDialogForEdit(section);
            } else {
              openTechnicalSkillsDialogForEdit(section);
            }
          }}
        />
      ))}
    </>
  );
}

export default ResumeContainer;
