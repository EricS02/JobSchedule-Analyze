import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import path from "path";
import fs from "fs";
import { getTimestampedFileName } from "@/lib/utils";
import prisma from "@/lib/db";
import { processPDFResumeServer } from "@/utils/pdf-server.utils";

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export const POST = async (req: NextRequest, res: NextResponse) => {
  console.log('🚀 Resume API POST request received');
  
  try {
    const { getUser } = getKindeServerSession();
    const session = await getUser();
    console.log('🔐 Session check completed');
    console.log('- Session exists:', !!session);
    console.log('- User exists:', !!session?.email);
    
    const userId = session?.id;
    console.log('- User ID:', userId);
    
    const dataPath = process.env.NODE_ENV !== "production" ? "data" : "/data";
    console.log('- Data path:', dataPath);
    
    let filePath;

    if (!session || !session.email) {
      console.log('❌ Authentication failed');
      return NextResponse.json(
        {
          success: false,
          error: "Not Authenticated",
        },
        {
          status: 401,
        }
      );
    }
    
    console.log('✅ Authentication successful');
    
    console.log('📝 Parsing form data...');
    const formData = await req.formData();
    console.log('✅ Form data parsed successfully');
    
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;
    const resumeId = (formData.get("id") as string) ?? null;
    const extractedText = formData.get("extractedText") as string | null;
    const extractionMetadata = formData.get("extractionMetadata") as string | null;
    let fileId: string | undefined =
      (formData.get("fileId") as string) ?? undefined;
    
    console.log('📋 Form data extracted:');
    console.log('- Title:', title);
    console.log('- File exists:', !!file);
    console.log('- Resume ID:', resumeId);
    console.log('- Extracted text length:', extractedText?.length || 0);
    console.log('- Extraction metadata exists:', !!extractionMetadata);
    console.log('- File ID:', fileId);
    
    // Simple test to see if we can reach this point
    console.log('🧪 Testing basic functionality...');
    try {
      const testResult = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database test successful:', testResult);
    } catch (dbError) {
      console.error('❌ Database test failed:', dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
    
    if (file && file.name) {
      console.log('📁 Processing file upload...');
      console.log('- File name:', file.name);
      console.log('- File size:', file.size);
      console.log('- File type:', file.type);
      
      // Validate file size (1MB limit)
      const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
      if (file.size > MAX_FILE_SIZE) {
        console.log('❌ File size validation failed');
        return NextResponse.json(
          {
            success: false,
            error: "File size must be less than 1MB",
          },
          {
            status: 400,
          }
        );
      }
      
      const uploadDir = path.join(dataPath, "files", "resumes");
      console.log('- Upload directory:', uploadDir);
      
      // Ensure directory exists
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log('✅ Created upload directory');
        }
      } catch (dirError) {
        console.error('❌ Failed to create upload directory:', dirError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create upload directory",
          },
          {
            status: 500,
          }
        );
      }
      
      // Generate unique filename
      const timestamp = getTimestampedFileName(file.name);
      const fileExtension = path.extname(file.name);
      const fileName = `${timestamp}${fileExtension}`;
      filePath = path.join(uploadDir, fileName);
      
      console.log('- Generated filename:', fileName);
      console.log('- Full file path:', filePath);
      
      // Convert file to buffer for processing
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));
      console.log('- File converted to buffer, size:', buffer.length);
      
      // Process PDF with enhanced extraction and AI parsing
      let processedText = extractedText || '';
      let parsedData = null;
      
      if (file.type === 'application/pdf') {
        console.log('📄 Processing PDF with enhanced extraction...');
        try {
          const pdfResult = await processPDFResumeServer(buffer);
          processedText = pdfResult.extractedText;
          parsedData = pdfResult.parsedData;
          
          console.log('✅ PDF processing completed');
          console.log('- Extracted text length:', processedText.length);
          console.log('- AI parsed data available:', !!parsedData);
          
          if (parsedData) {
            console.log('- Parsed data structure:', {
              hasContactInfo: !!parsedData.contactInfo,
              hasExperience: !!parsedData.experience?.length,
              hasEducation: !!parsedData.education?.length,
              hasSkills: !!parsedData.technicalSkills?.length,
              hasProjects: !!parsedData.projects?.length,
              hasCertifications: !!parsedData.certifications?.length
            });
          }
        } catch (pdfError) {
          console.error('❌ PDF processing failed:', pdfError);
          // Continue with file upload even if PDF processing fails
          processedText = 'PDF processing encountered an issue. You can manually enter your information below.';
        }
      }
      
      // Save file to disk
      try {
        fs.writeFileSync(filePath, buffer);
        console.log('✅ File saved to disk');
      } catch (writeError) {
        console.error('❌ Failed to save file:', writeError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to save file",
          },
          {
            status: 500,
          }
        );
      }
      
      // Get or create user profile
      let profile = await prisma.profile.findFirst({
        where: { userId: userId }
      });
      
      if (!profile) {
        if (!userId) {
          return NextResponse.json(
            { success: false, error: "User ID is required" },
            { status: 400 }
          );
        }
        profile = await prisma.profile.create({
          data: { userId: userId }
        });
        console.log('✅ Created user profile');
      }
      
      // Create or update resume in database
      try {
        console.log('💾 Saving resume to database...');
        
        let resume;
        if (resumeId) {
          // Update existing resume
          resume = await prisma.resume.update({
            where: { id: resumeId },
            data: {
              title: title || file.name,
            },
            include: {
              File: true,
              profile: true
            }
          });
          console.log('✅ Resume updated in database');
        } else {
          // Create File record first
          const fileRecord = await prisma.file.create({
            data: {
              fileName: fileName,
              filePath: filePath,
              fileType: file.type,
            }
          });
          
          // Create new resume
          resume = await prisma.resume.create({
            data: {
              title: title || file.name,
              profileId: profile.id,
              FileId: fileRecord.id,
            },
            include: {
              File: true,
              profile: true
            }
          });
          console.log('✅ Resume created in database');
        }
        
        console.log('🎉 Resume processing completed successfully');
        console.log('- Resume ID:', resume.id);
        console.log('- File path:', resume.File?.filePath);
        console.log('- File name:', resume.File?.fileName);
        
        return NextResponse.json({
          success: true,
          resume: {
            id: resume.id,
            title: resume.title,
            fileName: resume.File?.fileName,
            filePath: resume.File?.filePath,
            fileSize: file.size,
            extractedText: processedText,
            parsedData: parsedData,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
          },
          message: "Resume uploaded and processed successfully",
        });
        
      } catch (dbError) {
        console.error('❌ Database operation failed:', dbError);
        
        // Clean up file if database operation fails
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('🧹 Cleaned up file after database error');
          }
        } catch (cleanupError) {
          console.error('❌ Failed to clean up file:', cleanupError);
        }
        
        return NextResponse.json(
          {
            success: false,
            error: "Failed to save resume to database",
          },
          {
            status: 500,
          }
        );
      }
    } else {
      console.log('❌ No file provided');
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error('❌ Resume API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
};

export const GET = async (req: NextRequest, res: NextApiResponse) => {
  const { getUser } = getKindeServerSession();
  const session = await getUser();
  const userId = session?.id;

  try {
    if (!session || !session.email) {
      return NextResponse.json(
        {
          error: "Not Authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("filePath");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    const fullFilePath = path.join(filePath);
    if (!fs.existsSync(fullFilePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileType = path.extname(fullFilePath).toLowerCase();
    const fileName = path.basename(fullFilePath);

    let contentType;

    if (fileType === ".pdf") {
      contentType = "application/pdf";
    } else if (fileType === ".doc" || fileType === ".docx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    const fileContent = fs.readFileSync(fullFilePath);

    const response = new NextResponse(fileContent, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message ?? "File download failed",
        },
        {
          status: 500,
        }
      );
    }
  }
};
