import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import path from "path";
import fs from "fs";
import { getTimestampedFileName } from "@/lib/utils";
import prisma from "@/lib/db";

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
          console.log('📁 Creating upload directory...');
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log('✅ Upload directory created');
        } else {
          console.log('✅ Upload directory already exists');
        }
      } catch (dirError) {
        console.error('❌ Failed to create upload directory:', dirError);
        throw new Error(`Failed to create upload directory: ${dirError instanceof Error ? dirError.message : 'Unknown error'}`);
      }
      
      const timestampedFileName = getTimestampedFileName(file.name);
      filePath = path.join(uploadDir, timestampedFileName);
      console.log('- Final file path:', filePath);
      
      try {
        const { uploadFile } = await import("@/actions/profile.actions");
      await uploadFile(file, uploadDir, filePath);
        console.log('✅ File uploaded successfully');
      } catch (uploadError) {
        console.error('❌ File upload failed:', uploadError);
        throw new Error(`File upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }
    } else {
      console.log('⚠️ No file provided for upload');
    }

    if (resumeId && title) {
      if (fileId && file?.name) {
        const { deleteFile } = await import("@/actions/profile.actions");
        await deleteFile(fileId);
        fileId = undefined;
      }

              const { editResume } = await import("@/actions/profile.actions");
        const res = await editResume(
        resumeId,
        title,
        fileId,
        file?.name,
        filePath
      );
      return NextResponse.json(res, { status: 200 });
    }

    // Handle client-extracted text or fallback to server-side processing
    let response;
    
    if (extractedText && extractedText.trim().length > 50) {
      console.log('Creating resume with client-extracted text');
      console.log('- Extracted text length:', extractedText.length);
      if (extractionMetadata) {
        console.log('- Extraction metadata:', extractionMetadata);
      }
      
      // Use the new client extraction function
              const { createResumeProfileWithClientExtraction } = await import("@/actions/profile.actions");
        response = await createResumeProfileWithClientExtraction(
        title,
        file?.name ?? null,
        filePath,
        extractedText,
        extractionMetadata ? JSON.parse(extractionMetadata) : undefined
      );
    } else {
      console.log('Creating resume without text extraction');
              const { createResumeProfile } = await import("@/actions/profile.actions");
        response = await createResumeProfile(
        title,
        file?.name ?? null,
        filePath
      );
    }
    
    // Check if the response indicates success
    if (response && response.success) {
      return NextResponse.json(response, { status: 201 });
    } else {
      // Handle error response from the action
      const errorMessage = response?.message || response?.error || 'Failed to create resume';
      console.error('Resume creation failed:', response);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Resume API error:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    const isProd = process.env.NODE_ENV === 'production';
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message ?? "Resume update or File upload failed",
          ...(isProd ? {} : { stack: error.stack })
        },
        {
          status: 500,
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "An unexpected error occurred while processing the resume",
        },
        {
          status: 500,
        }
      );
    }
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
