"use server";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";
import { AddEducationFormSchema } from "@/models/AddEductionForm.schema";
import { AddContactInfoFormSchema } from "@/models/addContactInfoForm.schema";
import { AddExperienceFormSchema } from "@/models/addExperienceForm.schema";
import { AddSummarySectionFormSchema } from "@/models/addSummaryForm.schema";
import { AddTechnicalSkillsFormSchema } from "@/models/addTechnicalSkillsForm.schema";
import { AddProjectsFormSchema } from "@/models/addProjectsForm.schema";
import { CreateResumeFormSchema } from "@/models/createResumeForm.schema";
import { ResumeSection, SectionType, Summary } from "@/models/profile.model";
import { getCurrentUser } from "@/utils/user.utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { writeFile } from "fs/promises";
import { processPDFResumeServer } from "@/utils/pdf-server.utils";
import { ParsedResumeData } from "@/utils/pdf.utils";

export const getResumeList = async (
  page = 1,
  limit = 15
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.resume.findMany({
        where: {
          profile: {
            userId: user.id,
          },
        },
        skip,
        take: limit,
        select: {
          id: true,
          profileId: true,
          FileId: true,
          createdAt: true,
          updatedAt: true,
          title: true,
          _count: {
            select: {
              Job: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.resume.count({
        where: {
          profile: {
            userId: user.id,
          },
        },
      }),
    ]);
    return { data, total, success: true };
  } catch (error) {
    const msg = "Failed to get resume list.";
    return handleError(error, msg);
  }
};

export const getResumeById = async (
  resumeId: string
): Promise<any | undefined> => {
  try {
    if (!resumeId) {
      throw new Error("Please provide resume id");
    }
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
      include: {
        ContactInfo: true,
        File: true,
        ResumeSections: {
          include: {
            summary: true,
            workExperiences: {
              include: {
                jobTitle: true,
                Company: true,
                location: true,
              },
            },
            educations: {
              include: {
                location: true,
              },
            },
            others: true,
            licenseOrCertifications: true,
          },
        },
      },
    });
    // Add parsing status fields if present
    if (resume) {
      return {
        ...resume,
      };
    }
    return resume;
  } catch (error) {
    const msg = "Failed to get resume.";
    return handleError(error, msg);
  }
};

export const addContactInfo = async (
  data: z.infer<typeof AddContactInfoFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const res = await prisma.resume.update({
      where: {
        id: data.resumeId,
      },
      data: {
        ContactInfo: {
          connectOrCreate: {
            where: { resumeId: data.resumeId },
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              headline: data.headline,
              email: data.email!,
              phone: data.phone!,
              address: data.address,
            },
          },
        },
      },
    });
    revalidatePath("/dashboard/profile/resume");
    return { data: res, success: true };
  } catch (error) {
    const msg = "Failed to create contact info.";
    return handleError(error, msg);
  }
};

export const updateContactInfo = async (
  data: z.infer<typeof AddContactInfoFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    if (!data.id) {
      throw new Error("Contact Info ID is required for update operation");
    }

    const res = await prisma.contactInfo.update({
      where: {
        id: data.id,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        headline: data.headline,
        email: data.email!,
        phone: data.phone!,
        address: data.address,
      },
    });
    revalidatePath("/dashboard/profile/resume");
    return { data: res, success: true };
  } catch (error) {
    const msg = "Failed to update contact info.";
    return handleError(error, msg);
  }
};

export const createResumeProfile = async (
  title: string,
  fileName: string,
  filePath?: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    //check if title exists
    const value = title.trim().toLowerCase();

    const titleExists = await prisma.resume.findFirst({
      where: {
        title: value,
      },
    });

    if (titleExists) {
      throw new Error("Title already exists!");
    }

    const profile = await prisma.profile.findFirst({
      where: {
        userId: user.id,
      },
    });

    const res =
      profile && profile.id
        ? await prisma.resume.create({
            data: {
              profileId: profile!.id,
              title,
              FileId: fileName
                ? await createFileEntry(fileName, filePath)
                : null,
            },
          })
        : await prisma.profile.create({
            data: {
              userId: user.id,
              resumes: {
                create: [
                  {
                    title,
                    FileId: fileName
                      ? await createFileEntry(fileName, filePath)
                      : null,
                  },
                ],
              },
            },
          });
    // revalidatePath("/dashboard/myjobs", "page");
    return { success: true, data: res };
  } catch (error) {
    const msg = "Failed to create resume.";
    return handleError(error, msg);
  }
};

export const createResumeProfileWithParsing = async (
  title: string,
  fileName: string,
  filePath?: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if title exists for this user's profile
    const value = title.trim().toLowerCase();

    const titleExists = await prisma.resume.findFirst({
      where: {
        title: value,
        profile: {
          userId: user.id
        }
      },
    });

    if (titleExists) {
      throw new Error("Title already exists!");
    }

    const profile = await prisma.profile.findFirst({
      where: {
        userId: user.id,
      },
    });

    // Create the resume first
    const resume = profile && profile.id
      ? await prisma.resume.create({
          data: {
            profileId: profile!.id,
            title,
            FileId: fileName
              ? await createFileEntry(fileName, filePath)
              : null,
          },
        })
      : await prisma.profile.create({
          data: {
            userId: user.id,
            resumes: {
              create: [
                {
                  title,
                  FileId: fileName
                    ? await createFileEntry(fileName, filePath)
                    : null,
                },
              ],
            },
          },
        });

    // Get the resume ID - handle both cases
    let resumeId: string;
    if (profile && profile.id) {
      resumeId = resume.id;
    } else {
      // Resume was created as part of profile creation
      const createdProfile = resume as any;
      resumeId = createdProfile.resumes[0].id;
    }

    // If we have a PDF file, attempt to parse it
    if (fileName && filePath && fileName.toLowerCase().endsWith('.pdf')) {
      try {
        console.log('Processing PDF for resume parsing...');
        console.log('File path:', filePath);
        console.log('File name:', fileName);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          throw new Error(`PDF file not found at path: ${filePath}`);
        }
        
        // Get file stats
        const fileStats = fs.statSync(filePath);
        console.log('File size:', fileStats.size, 'bytes');
        
        if (fileStats.size === 0) {
          throw new Error('PDF file is empty');
        }
        
        // Read file with error handling
        console.log('Reading PDF file from disk...');
        const fileBuffer = fs.readFileSync(filePath);
        console.log('File buffer created, size:', fileBuffer.length);
        
        const { extractedText, parsedData } = await processPDFResumeServer(fileBuffer);
        
        console.log('PDF text extracted, length:', extractedText.length);
        
        if (parsedData) {
          console.log('Parsed data available, populating resume sections...');
          await populateResumeFromParsedData(resumeId, parsedData, user.id);
        }
      } catch (parseError) {
        console.warn('PDF parsing failed, but resume was created successfully:', parseError);
        // Continue without parsed data - the resume is still created
      }
    }

    revalidatePath("/dashboard/profile/resume");
    return { success: true, data: resume, resumeId };
  } catch (error) {
    const msg = "Failed to create resume.";
    return handleError(error, msg);
  }
};

export const createResumeProfileWithClientExtraction = async (
  title: string,
  fileName: string | null,
  filePath?: string,
  extractedText?: string,
  extractionMetadata?: any
): Promise<any | undefined> => {
  try {
    console.log('🔍 Starting createResumeProfileWithClientExtraction...');
    console.log('- Title:', title);
    console.log('- File name:', fileName);
    console.log('- File path:', filePath);
    console.log('- Extracted text length:', extractedText?.length || 0);
    
    const user = await getCurrentUser();
    console.log('- User found:', !!user);
    if (!user) {
      console.error('❌ User not authenticated');
      return { success: false, message: "User not authenticated" };
    }
    console.log('- User ID:', user.id);

    // Check if title exists for this user's profile
    const value = title.trim().toLowerCase();
    const titleExists = await prisma.resume.findFirst({
      where: {
        title: value,
        profile: {
          userId: user.id
        }
      },
    });

    if (titleExists) {
      throw new Error("Title already exists!");
    }

    // Create profile if it doesn't exist
    console.log('🔍 Looking for existing profile...');
    let profile = await prisma.profile.findFirst({
      where: { userId: user.id },
    });

    if (!profile) {
      console.log('🔍 Creating new profile...');
      profile = await prisma.profile.create({
        data: { userId: user.id },
      });
      console.log('✅ Profile created with ID:', profile.id);
    } else {
      console.log('✅ Found existing profile with ID:', profile.id);
    }

    // Create file entry if file exists
    let fileId: string | undefined;
    if (fileName && filePath) {
      console.log('🔍 Creating file entry...');
      fileId = await createFileEntry(fileName, filePath);
      console.log('✅ File entry created with ID:', fileId);
    } else {
      console.log('⚠️ No file to create entry for');
    }

    // Create resume
    console.log('🔍 Creating resume...');
    console.log('- Profile ID:', profile.id);
    console.log('- File ID:', fileId);
    
    // Add flags for parsing
    let parsingAttempted = false;
    let parsingSucceeded = false;
    let parsingError: string | null = null;

    const resume = await prisma.resume.create({
      data: {
        title,
        profileId: profile.id,
        FileId: fileId,
        // Optionally add fields for parsing status
        // parsingAttempted: false,
        // parsingSucceeded: false,
        // parsingError: null,
      },
    });

    const resumeId = resume.id;
    console.log('✅ Resume created successfully with ID:', resumeId);

    // Process extracted text if available
    if (extractedText && extractedText.trim().length > 100) {
      parsingAttempted = true;
      try {
        console.log('Processing client-extracted text...');
        console.log('- Text length:', extractedText.length);
        console.log('- Extraction method:', extractionMetadata?.extractionMethod || 'unknown');
        
        // Always attempt AI parsing if we have a valid OpenAI API key
        const canUseAI = process.env.OPENAI_API_KEY && 
                        process.env.ENABLE_PDF_PARSING !== 'false';
        
        if (canUseAI) {
          console.log('Attempting AI parsing of client-extracted text...');
          
          // Add timeout for AI parsing to prevent long delays
          const aiParsingPromise = (async () => {
            const { parseResumeWithAI } = await import('@/utils/pdf.utils');
            return await parseResumeWithAI(extractedText);
          })();
          
          // Set a 30-second timeout for AI parsing
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AI parsing timeout')), 30000);
          });
          
          try {
            const parsedData = await Promise.race([aiParsingPromise, timeoutPromise]);
            
            if (parsedData) {
              parsingSucceeded = true;
              console.log('AI parsing successful, populating resume sections...');
              await populateResumeFromParsedData(resumeId, parsedData, user.id);
              console.log('✅ Resume populated with AI-parsed data from client extraction');
            } else {
              parsingError = 'AI parsing returned no usable data';
              console.log('AI parsing returned no usable data');
            }
          } catch (aiError) {
            parsingError = aiError instanceof Error ? aiError.message : 'AI parsing failed';
            console.warn('AI parsing failed:', aiError);
            // Continue without AI parsing - the resume is still created with the file
          }
        } else {
          parsingError = 'AI parsing disabled - missing API key or feature disabled';
          console.log('AI parsing disabled - missing API key or feature disabled');
        }
      } catch (parseError) {
        parsingError = parseError instanceof Error ? parseError.message : String(parseError);
        console.warn('AI parsing of client-extracted text failed:', parseError);
        // Continue without parsed data - the resume is still created with the file
      }
    } else {
      console.log('Client-extracted text too short or missing, skipping AI parsing');
    }

    // Optionally update resume with parsing status
    // await prisma.resume.update({
    //   where: { id: resumeId },
    //   data: {
    //     parsingAttempted,
    //     parsingSucceeded,
    //     parsingError,
    //   },
    // });

    revalidatePath("/dashboard/profile/resume");
    return { 
      success: true, 
      data: resume, 
      resumeId,
      extractionUsed: !!extractedText,
      extractionMethod: extractionMetadata?.extractionMethod || 'none',
      parsingAttempted,
      parsingSucceeded,
      parsingError
    };
  } catch (error) {
    const msg = "Failed to create resume with client extraction.";
    return handleError(error, msg);
  }
};

const createFileEntry = async (
  fileName: string | undefined,
  filePath: string | undefined
) => {
  const newFileEntry = await prisma.file.create({
    data: {
      fileName: fileName!,
      filePath: filePath!,
      fileType: "resume",
    },
  });
  return newFileEntry.id;
};

const populateResumeFromParsedData = async (
  resumeId: string,
  parsedData: ParsedResumeData,
  userId: string
) => {
  try {
    // Create contact info if available
    if (parsedData.contactInfo) {
      const { firstName, lastName, headline, email, phone, address } = parsedData.contactInfo;
      if (firstName && lastName && headline && email && phone) {
        await prisma.resume.update({
          where: { id: resumeId },
          data: {
            ContactInfo: {
              create: {
                firstName,
                lastName,
                headline,
                email,
                phone,
                address: address || null,
              },
            },
          },
        });
        console.log('Contact info created from parsed data');
      }
    }

    // Create summary section if available
    if (parsedData.summary) {
      // First create the summary
      const summary = await prisma.summary.create({
        data: {
          content: parsedData.summary,
        },
      });

      // Then create the resume section and link it to the summary
      await prisma.resumeSection.create({
        data: {
          resumeId,
          sectionTitle: "Professional Summary",
          sectionType: SectionType.SUMMARY,
          summaryId: summary.id,
        },
      });
      console.log('Summary section created from parsed data');
    }

    // Create experience sections if available
    if (parsedData.experience && parsedData.experience.length > 0) {
      for (const exp of parsedData.experience) {
        if (exp.company && exp.jobTitle && exp.description) {
          // Find or create job title
          const jobTitle = await prisma.jobTitle.upsert({
            where: { value: exp.jobTitle.toLowerCase().replace(/\s+/g, '-') },
            update: {},
            create: {
              label: exp.jobTitle,
              value: exp.jobTitle.toLowerCase().replace(/\s+/g, '-'),
              createdBy: userId,
            },
          });

          // Find or create company
          const company = await prisma.company.upsert({
            where: { value: exp.company.toLowerCase().replace(/\s+/g, '-') },
            update: {},
            create: {
              label: exp.company,
              value: exp.company.toLowerCase().replace(/\s+/g, '-'),
              createdBy: userId,
            },
          });

          // Find or create location
          const location = await prisma.location.upsert({
            where: { value: exp.location?.toLowerCase().replace(/\s+/g, '-') || 'remote' },
            update: {},
            create: {
              label: exp.location || 'Remote',
              value: exp.location?.toLowerCase().replace(/\s+/g, '-') || 'remote',
              createdBy: userId,
            },
          });

          // Create experience section
          await prisma.resumeSection.create({
            data: {
              resumeId,
              sectionTitle: "Work Experience",
              sectionType: SectionType.EXPERIENCE,
              workExperiences: {
                create: {
                  jobTitle: {
                    connect: { id: jobTitle.id }
                  },
                  Company: {
                    connect: { id: company.id }
                  },
                  location: {
                    connect: { id: location.id }
                  },
                  description: exp.description,
                  startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
                  endDate: exp.endDate ? new Date(exp.endDate) : new Date(),
                  currentJob: exp.currentJob || false,
                },
              },
            },
          });
        }
      }
      console.log(`Created ${parsedData.experience.length} experience entries from parsed data`);
    }

    // Create education sections if available
    if (parsedData.education && parsedData.education.length > 0) {
      for (const edu of parsedData.education) {
        if (edu.institution && edu.degree && edu.fieldOfStudy) {
          // Find or create location
          const location = await prisma.location.upsert({
            where: { value: edu.location?.toLowerCase().replace(/\s+/g, '-') || 'unknown' },
            update: {},
            create: {
              label: edu.location || 'Unknown',
              value: edu.location?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
              createdBy: userId,
            },
          });

          // Create education section
          await prisma.resumeSection.create({
            data: {
              resumeId,
              sectionTitle: "Education",
              sectionType: SectionType.EDUCATION,
              educations: {
                create: {
                  institution: edu.institution,
                  degree: edu.degree,
                  fieldOfStudy: edu.fieldOfStudy,
                  location: {
                    connect: { id: location.id }
                  },
                  description: edu.description || null,
                  startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
                  endDate: edu.endDate ? new Date(edu.endDate) : new Date(),
                },
              },
            },
          });
        }
      }
      console.log(`Created ${parsedData.education.length} education entries from parsed data`);
    }

    // Create technical skills sections if available
    if (parsedData.technicalSkills && parsedData.technicalSkills.length > 0) {
      for (const skillGroup of parsedData.technicalSkills) {
        if (skillGroup.category && skillGroup.skills && skillGroup.skills.length > 0) {
          await prisma.resumeSection.create({
            data: {
              resumeId,
              sectionTitle: skillGroup.category,
              sectionType: SectionType.OTHER,
              others: {
                create: {
                  title: skillGroup.category,
                  content: skillGroup.skills.join(', '),
                },
              },
            },
          });
        }
      }
      console.log(`Created ${parsedData.technicalSkills.length} technical skills sections from parsed data`);
    }

    // Create projects sections if available
    if (parsedData.projects && parsedData.projects.length > 0) {
      for (const project of parsedData.projects) {
        if (project.title && project.description) {
          let content = project.description;
          if (project.technologies && project.technologies.length > 0) {
            content += `\n\nTechnologies: ${project.technologies.join(', ')}`;
          }
          if (project.url) {
            content += `\n\nURL: ${project.url}`;
          }

          await prisma.resumeSection.create({
            data: {
              resumeId,
              sectionTitle: "Projects",
              sectionType: SectionType.PROJECT,
              others: {
                create: {
                  title: project.title,
                  content: content,
                },
              },
            },
          });
        }
      }
      console.log(`Created ${parsedData.projects.length} project entries from parsed data`);
    }

    // Create certifications sections if available
    if (parsedData.certifications && parsedData.certifications.length > 0) {
      for (const cert of parsedData.certifications) {
        if (cert.title && cert.organization) {
          await prisma.resumeSection.create({
            data: {
              resumeId,
              sectionTitle: "Certifications",
              sectionType: SectionType.CERTIFICATION,
              licenseOrCertifications: {
                create: {
                  title: cert.title,
                  organization: cert.organization,
                  issueDate: cert.issueDate ? new Date(cert.issueDate) : new Date(),
                  expirationDate: cert.expirationDate ? new Date(cert.expirationDate) : new Date(),
                  credentialUrl: cert.credentialUrl || null,
                },
              },
            },
          });
        }
      }
      console.log(`Created ${parsedData.certifications.length} certification entries from parsed data`);
    }

  } catch (error) {
    console.error('Error populating resume from parsed data:', error);
    // Don't throw - we want the resume creation to succeed even if parsing fails
  }
};

export const editResume = async (
  id: string,
  title: string,
  fileId?: string,
  fileName?: string,
  filePath?: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if title exists for this user's other resumes
    const value = title.trim().toLowerCase();
    const titleExists = await prisma.resume.findFirst({
      where: {
        title: value,
        id: { not: id }, // Exclude current resume
        profile: {
          userId: user.id
        }
      },
    });

    if (titleExists) {
      throw new Error("Title already exists!");
    }

    let resolvedFileId = fileId;

    if (!fileId && fileName && filePath) {
      resolvedFileId = await createFileEntry(fileName, filePath);
    }

    if (resolvedFileId) {
      const isValidFileId = await prisma.file.findFirst({
        where: { id: resolvedFileId },
      });

      if (!isValidFileId) {
        throw new Error(
          `The provided FileId "${resolvedFileId}" does not exist.`
        );
      }
    }

    const res = await prisma.resume.update({
      where: { id },
      data: {
        title,
        FileId: resolvedFileId || null,
      },
    });
    return { success: true, data: res };
  } catch (error) {
    const msg = "Failed to update resume or file.";
    return handleError(error, msg);
  }
};

export const deleteResumeById = async (
  resumeId: string,
  fileId?: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    if (fileId) {
      await deleteFile(fileId);
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.contactInfo.deleteMany({
        where: {
          resumeId: resumeId,
        },
      });

      await prisma.summary.deleteMany({
        where: {
          ResumeSection: {
            resumeId: resumeId,
          },
        },
      });

      await prisma.workExperience.deleteMany({
        where: {
          ResumeSection: {
            resumeId: resumeId,
          },
        },
      });

      await prisma.education.deleteMany({
        where: {
          ResumeSection: {
            resumeId: resumeId,
          },
        },
      });

      await prisma.resumeSection.deleteMany({
        where: {
          resumeId: resumeId,
        },
      });

      await prisma.resume.delete({
        where: { id: resumeId },
      });
    });
    return { success: true };
  } catch (error) {
    const msg = "Failed to delete resume.";
    return handleError(error, msg);
  }
};

export const uploadFile = async (file: File, dir: string, path: string) => {
  const bytes = await file.arrayBuffer();
  const buffer = new Uint8Array(bytes);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await writeFile(path, buffer);
};

export const deleteFile = async (fileId: string) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
      },
    });

    const filePath = file?.filePath as string;

    const fullFilePath = path.join(filePath);
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }
    fs.unlinkSync(filePath);

    await prisma.file.delete({
      where: {
        id: fileId,
      },
    });

    console.log("file deleted successfully!");
  } catch (error) {
    const msg = "Failed to delete file.";
    return handleError(error, msg);
  }
};

export const addResumeSummary = async (
  data: z.infer<typeof AddSummarySectionFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    const res = await prisma.resumeSection.create({
      data: {
        resumeId: data.resumeId!,
        sectionTitle: data.sectionTitle!,
        sectionType: SectionType.SUMMARY,
      },
    });

    // First create the summary
    const summary = await prisma.summary.create({
      data: {
        content: data.content!,
      },
    });

    // Then update the resume section to link to the summary
    const updatedSection = await prisma.resumeSection.update({
      where: {
        id: res.id,
      },
      data: {
        summaryId: summary.id,
      },
    });
    /* Warning: a dynamic page path "/dashboard/profile/resume/[id]" was passed 
      to "revalidatePath", but the "type" parameter is missing. 
      This has no effect by default, 
      see more info here https://nextjs.org/docs/app/api-reference/functions/revalidatePath
      revalidatePath("/dashboard/profile/resume/[id]", "page");
    */
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { data: updatedSection, success: true };
  } catch (error) {
    const msg = "Failed to create summary.";
    return handleError(error, msg);
  }
};

export const updateResumeSummary = async (
  data: z.infer<typeof AddSummarySectionFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    const res = await prisma.resumeSection.update({
      where: {
        id: data.id,
      },
      data: {
        sectionTitle: data.sectionTitle!,
      },
    });

    // First get the resume section to find the summary ID
    const resumeSection = await prisma.resumeSection.findUnique({
      where: { id: data.id },
      include: { summary: true },
    });

    if (!resumeSection?.summaryId) {
      throw new Error("Summary not found for this section");
    }

    // Update the summary directly
    const summary = await prisma.summary.update({
      where: {
        id: resumeSection.summaryId,
      },
      data: {
            content: data.content!,
      },
    });
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { data: summary, success: true };
  } catch (error) {
    const msg = "Failed to update summary.";
    return handleError(error, msg);
  }
};

export const addExperience = async (
  data: z.infer<typeof AddExperienceFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    if (!data.sectionId && !data.sectionTitle) {
      throw new Error("SectionTitle is required.");
    }

    const section = !data.sectionId
      ? await prisma.resumeSection.create({
          data: {
            resumeId: data.resumeId!,
            sectionTitle: data.sectionTitle!,
            sectionType: SectionType.EXPERIENCE,
          },
        })
      : undefined;

    const experience = await prisma.resumeSection.update({
      where: {
        id: section ? section.id : data.sectionId,
      },
      data: {
        workExperiences: {
          create: {
            jobTitleId: data.title,
            companyId: data.company,
            locationId: data.location,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.jobDescription,
          },
        },
      },
    });
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { data: experience, success: true };
  } catch (error) {
    const msg = "Failed to create experience.";
    return handleError(error, msg);
  }
};

export const updateExperience = async (
  data: z.infer<typeof AddExperienceFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    // const res = await prisma.resumeSection.update({
    //   where: {
    //     id: data.id,
    //   },
    //   data: {
    //     sectionTitle: data.sectionTitle!,
    //   },
    // });

    const summary = await prisma.workExperience.update({
      where: {
        id: data.id,
      },
      data: {
        jobTitleId: data.title,
        companyId: data.company,
        locationId: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.jobDescription,
      },
    });
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { data: summary, success: true };
  } catch (error) {
    const msg = "Failed to update experience.";
    return handleError(error, msg);
  }
};

export const addEducation = async (
  data: z.infer<typeof AddEducationFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    const section = !data.sectionId
      ? await prisma.resumeSection.create({
          data: {
            resumeId: data.resumeId!,
            sectionTitle: data.sectionTitle!,
            sectionType: SectionType.EDUCATION,
          },
        })
      : undefined;

    const education = await prisma.resumeSection.update({
      where: {
        id: section ? section.id : data.sectionId,
      },
      data: {
        educations: {
          create: {
            institution: data.institution,
            degree: data.degree,
            fieldOfStudy: data.fieldOfStudy,
            locationId: data.location,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description,
          },
        },
      },
    });
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { data: education, success: true };
  } catch (error) {
    const msg = "Failed to create education.";
    return handleError(error, msg);
  }
};

export const updateEducation = async (
  data: z.infer<typeof AddEducationFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    // const res = await prisma.resumeSection.update({
    //   where: {
    //     id: data.id,
    //   },
    //   data: {
    //     sectionTitle: data.sectionTitle!,
    //   },
    // });

    const summary = await prisma.education.update({
      where: {
        id: data.id,
      },
      data: {
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        locationId: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
      },
    });
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { data: summary, success: true };
  } catch (error) {
    const msg = "Failed to update education.";
    return handleError(error, msg);
  }
};

export const addTechnicalSkills = async (
  data: z.infer<typeof AddTechnicalSkillsFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    const res = await prisma.resumeSection.create({
      data: {
        resumeId: data.resumeId!,
        sectionTitle: data.sectionTitle!,
        sectionType: SectionType.OTHER,
        others: {
          create: {
            title: data.title!,
            content: data.content!,
          },
        },
      },
    });
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { data: res, success: true };
  } catch (error) {
    const msg = "Failed to create technical skills.";
    return handleError(error, msg);
  }
};

export const addProjects = async (
  data: z.infer<typeof AddProjectsFormSchema>
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }
    
    let content = data.content!;
    if (data.url) {
      content += `\n\nURL: ${data.url}`;
    }
    
    const res = await prisma.resumeSection.create({
      data: {
        resumeId: data.resumeId!,
        sectionTitle: data.sectionTitle!,
        sectionType: SectionType.PROJECT,
        others: {
          create: {
            title: data.title!,
            content: content,
          },
        },
      },
    });
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { data: res, success: true };
  } catch (error) {
    const msg = "Failed to create project.";
    return handleError(error, msg);
  }
};

export const deleteOtherSection = async (
  otherSectionId: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    await prisma.otherSection.delete({
      where: {
        id: otherSectionId,
      },
    });
    
    revalidatePath("/dashboard/profile/resume/[id]", "page");
    return { success: true };
  } catch (error) {
    const msg = "Failed to delete section.";
    return handleError(error, msg);
  }
};
