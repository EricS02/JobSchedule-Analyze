import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🟡 Server-side OCR endpoint called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size (1MB limit)
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 1MB' },
        { status: 400 }
      );
    }

    console.log('📄 Processing PDF file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Convert file to buffer for server-side processing
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Try OCR.space API with server-side API key
    const ocrResult = await performOCRWithAPIKey(buffer, file.name);
    
    if (ocrResult.success) {
      return NextResponse.json({
        success: true,
        text: ocrResult.text,
        pageCount: ocrResult.pageCount,
        metadata: {
          ...ocrResult.metadata,
          serverSide: true,
          extractionMethod: 'server-ocr'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: ocrResult.error,
        metadata: {
          ...ocrResult.metadata,
          serverSide: true
        }
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Server-side OCR error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server-side OCR processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function performOCRWithAPIKey(buffer: Buffer, filename: string) {
  try {
    console.log('🟡 Attempting server-side OCR with API key...');
    
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ No OCR.space API key found in environment variables');
      return {
        success: false,
        error: 'OCR service not configured',
        metadata: { noApiKey: true }
      };
    }

    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: 'application/pdf' }), filename);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2');
    formData.append('apikey', apiKey);

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 OCR.space API error:', response.status, errorText);
      
      if (response.status === 403) {
        return {
          success: false,
          error: 'OCR API access denied. Please check API key configuration.',
          metadata: { apiError: true, status: response.status }
        };
      } else if (response.status === 429) {
        return {
          success: false,
          error: 'OCR API rate limit exceeded. Please try again later.',
          metadata: { rateLimit: true, status: response.status }
        };
      } else {
        return {
          success: false,
          error: `OCR API error: ${response.status} ${response.statusText}`,
          metadata: { apiError: true, status: response.status }
        };
      }
    }

    const data = await response.json();
    console.log('🔬 OCR.space API response received');

    if (data && data.ParsedResults && data.ParsedResults.length > 0) {
      const ocrText = data.ParsedResults.map((r: any) => r.ParsedText).join('\n');
      console.log('🟢 Server-side OCR successful!');
      console.log('🟢 OCR text length:', ocrText.length);
      
      return {
        success: true,
        text: ocrText,
        pageCount: 1,
        metadata: {
          ocr: true,
          ocrSpace: true,
          serverSide: true,
          userMessage: 'Text extracted using server-side OCR (optical character recognition)',
          extractionMethod: 'server-ocr-space'
        }
      };
    } else {
      console.error('🔴 OCR.space extraction failed:', data);
      const errorMsg = data?.ErrorMessage || data?.ErrorDetails || 'No text found in the document';
      return {
        success: false,
        error: `OCR extraction failed: ${errorMsg}`,
        metadata: {
          ocrFailed: true,
          errorDetails: data,
          serverSide: true
        }
      };
    }

  } catch (error) {
    console.error('🔴 Server-side OCR error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Server-side OCR processing failed',
      metadata: {
        ocrError: true,
        errorDetails: error,
        serverSide: true
      }
    };
  }
} 