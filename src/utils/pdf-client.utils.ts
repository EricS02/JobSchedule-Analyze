/**
 * Client-side PDF text extraction using PDF.js
 * This runs in the browser and doesn't require server-side dependencies
 */

// Use dynamic imports to prevent server-side bundling issues
let pdfjsLib: any = null;

// Create a local worker blob to avoid CDN issues
function createLocalWorker() {
  const workerCode = `
    // Minimal PDF.js worker fallback
    self.onmessage = function(e) {
      // Simple fallback - just signal that worker is "ready"
      self.postMessage({ type: 'ready' });
    };
  `;
  
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}

// Lazy load PDF.js only when needed in browser
async function getPDFJS() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be used in browser environment');
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    
    // Configure PDF.js worker with local fallback
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      try {
        // First try to set up a local worker blob
        const localWorkerUrl = createLocalWorker();
        pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl;
        console.log('📚 PDF.js worker configured with local blob');
      } catch (error) {
        console.log('❌ Failed to create local worker, will use without worker');
        // Don't set any worker - let PDF.js handle it
      }
    }
  }
  
  return pdfjsLib;
}

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata?: any;
  success: boolean;
  error?: string;
}

/**
 * Extract text from a PDF file using PDF.js with no-worker approach
 * @param file - The PDF file to extract text from
 * @returns Promise with extraction result
 */
export async function extractTextFromPDFClient(file: File): Promise<PDFExtractionResult> {
  try {
    console.log('🔍 Starting client-side PDF text extraction...');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF extraction can only be performed in browser environment');
    }

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('File is not a PDF');
    }

    if (file.size === 0) {
      throw new Error('PDF file is empty');
    }

    if (file.size > 1 * 1024 * 1024) { // 1MB limit
      throw new Error('PDF file is too large (max 1MB)');
    }

    // Load PDF.js dynamically
    console.log('📚 Loading PDF.js library...');
    const pdfjs = await getPDFJS();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('📄 File converted to ArrayBuffer, size:', arrayBuffer.byteLength);

    // Load PDF document without worker to avoid CDN issues
    console.log('📖 Loading PDF document without worker...');
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      disableWorker: true,  // Force disable worker
      disableAutoFetch: true,
      disableStream: true,
      verbosity: 0,
      useSystemFonts: true,
      isEvalSupported: false,  // Disable eval for security
      maxImageSize: 1024 * 1024, // Limit image size
      cMapPacked: false
    });

    // Add a timeout to prevent hanging forever
    const timeoutMs = 15000; // 15 seconds
    let timeoutHandle: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error('PDF loading timed out after 15 seconds. The file may be corrupted or too large.'));
      }, timeoutMs);
    });

    let pdf;
    try {
      pdf = await Promise.race([
        loadingTask.promise,
        timeoutPromise
      ]);
      clearTimeout(timeoutHandle);
    } catch (err) {
      clearTimeout(timeoutHandle);
      console.error('❌ Error or timeout while loading PDF:', err);
      
      // Check if it's a timeout error and try OCR fallback
      const isTimeoutError = err instanceof Error && err.message.includes('timed out');
      if (isTimeoutError) {
        console.warn('⚠️ PDF loading timed out. Trying OCR fallback...');
        const ocrResult = await ocrSpaceExtractTextFromPDF(file);
        if (ocrResult.success && ocrResult.text.trim().length > 0) {
          ocrResult.metadata = {
            ...ocrResult.metadata,
            userMessage: 'Text extracted using OCR (optical character recognition) because PDF loading timed out.',
            usedOcr: true,
            originalMethod: 'pdfjs-timeout'
          };
          return ocrResult;
        }
      }
      
      return {
        text: '',
        pageCount: 0,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error while loading PDF',
        metadata: {
          userMessage: isTimeoutError 
            ? 'PDF loading timed out and OCR extraction also failed. The file may be corrupted or too large.'
            : 'PDF loading failed. Please try a different file.',
          triedPdfjs: true,
          triedOcr: isTimeoutError
        }
      };
    }

    console.log('📚 PDF loaded successfully');
    console.log('- Pages:', pdf.numPages);

    let fullText = '';
    let processedPages = 0;

    // Extract text from each page
    let firstPageRawItems = null;
    let firstPageText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`📖 Processing page ${pageNum}/${pdf.numPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Debug: Log raw textContent.items for the first page
        if (pageNum === 1) {
          firstPageRawItems = textContent.items;
          console.log('🔬 First page raw textContent.items:', firstPageRawItems);
          // Minimal extraction: join all str fields
          firstPageText = textContent.items
            .filter((item: any) => 'str' in item)
            .map((item: any) => item.str)
            .join(' ');
          console.log('🔬 First page raw joined text:', firstPageText);
        }

        // Extract text items and join them
        const pageText = textContent.items
          .filter((item: any) => 'str' in item && item.str.trim().length > 0)
          .map((item: any) => item.str)
          .join(' ');

        if (pageText.trim()) {
          fullText += pageText + '\n\n';
          console.log(`✅ Page ${pageNum} extracted: ${pageText.length} characters`);
        } else {
          console.log(`⚠️ Page ${pageNum} contains no text`);
        }

        processedPages++;
      } catch (pageError) {
        console.error(`❌ Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    // Clean up the extracted text
    const cleanedText = fullText
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    console.log('✅ PDF text extraction completed successfully!');
    console.log(`- Total text length: ${cleanedText.length} characters`);
    console.log(`- Processed pages: ${processedPages}/${pdf.numPages}`);
    
    if (cleanedText.length > 0) {
      console.log('- First 200 characters:', cleanedText.substring(0, 200));
    }

    // Check if we got meaningful text from PDF.js
    const hasMeaningfulText = cleanedText.trim().length > 50; // At least 50 characters
    const firstPageHasText = firstPageText.trim().length > 0;

    if (!hasMeaningfulText || !firstPageHasText) {
      console.warn('⚠️ PDF.js extraction returned insufficient text. Trying OCR fallback...');
      
      // OCR fallback
      const ocrResult = await ocrSpaceExtractTextFromPDF(file);
      if (ocrResult.success && ocrResult.text.trim().length > 0) {
        // Add user-facing message about OCR usage
        ocrResult.metadata = {
          ...ocrResult.metadata,
          userMessage: 'Text extracted using OCR (optical character recognition) because PDF text extraction was insufficient.',
          usedOcr: true,
          originalMethod: 'pdfjs'
        };
        return ocrResult;
      } else {
        return {
          text: '',
          pageCount: pdf.numPages,
          success: false,
          error: 'Unable to extract text from this PDF. The file may be image-based, corrupted, or password-protected.',
          metadata: {
            userMessage: 'PDF text extraction failed. Please ensure the PDF contains selectable text or try a different file.',
            triedPdfjs: true,
            triedOcr: true
          }
        };
      }
    }

    return {
      text: cleanedText,
      pageCount: pdf.numPages,
      metadata: {
        processedPages,
        totalPages: pdf.numPages,
        extractionMethod: 'pdfjs-no-worker',
        workerDisabled: true,
        userMessage: 'Text extracted successfully using PDF.js'
      },
      success: true
    };

  } catch (error) {
    console.error('❌ PDF text extraction failed:', error);
    
    let errorMessage = 'Unknown error occurred';
    let shouldTryOcr = false;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Determine if we should try OCR fallback based on error type
      if (errorMessage.includes('timed out') || 
          errorMessage.includes('Invalid PDF') ||
          errorMessage.includes('corrupted') ||
          errorMessage.includes('password') ||
          errorMessage.includes('encrypted')) {
        shouldTryOcr = true;
      }
      
      // Provide more specific error messages for common issues
      if (errorMessage.includes('worker')) {
        errorMessage = 'PDF worker configuration failed. Using fallback method.';
      } else if (errorMessage.includes('fetch')) {
        errorMessage = 'Network connectivity issue. Please check your connection.';
      } else if (errorMessage.includes('Invalid PDF')) {
        errorMessage = 'The uploaded file is not a valid PDF document.';
      }
    }
    
    // Try OCR fallback for certain types of errors
    if (shouldTryOcr) {
      console.warn('⚠️ PDF.js failed with error that suggests OCR might help. Trying OCR fallback...');
      try {
        const ocrResult = await ocrSpaceExtractTextFromPDF(file);
        if (ocrResult.success && ocrResult.text.trim().length > 0) {
          ocrResult.metadata = {
            ...ocrResult.metadata,
            userMessage: 'Text extracted using OCR (optical character recognition) because PDF.js extraction failed.',
            usedOcr: true,
            originalMethod: 'pdfjs-error',
            originalError: errorMessage
          };
          return ocrResult;
        }
      } catch (ocrError) {
        console.error('❌ OCR fallback also failed:', ocrError);
      }
    }
    
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: errorMessage,
      metadata: {
        userMessage: shouldTryOcr 
          ? 'PDF extraction failed and OCR fallback also failed. The file may be corrupted, password-protected, or in an unsupported format.'
          : 'PDF extraction failed. Please try a different file.',
        triedPdfjs: true,
        triedOcr: shouldTryOcr,
        originalError: errorMessage
      }
    };
  }
}

/**
 * Check if PDF.js is supported in the current browser
 */
export function isPDFJSSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 
           typeof ArrayBuffer !== 'undefined' && 
           typeof Uint8Array !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Extract text with progress callback - no worker version
 */
export async function extractTextFromPDFWithProgress(
  file: File,
  onProgress?: (progress: { current: number; total: number; percentage: number }) => void
): Promise<PDFExtractionResult> {
  try {
    console.log('🔍 Starting PDF extraction with progress tracking...');

    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF extraction can only be performed in browser environment');
    }

    if (!file || file.type !== 'application/pdf') {
      throw new Error('Invalid PDF file');
    }

    // Load PDF.js dynamically
    const pdfjs = await getPDFJS();

    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF without worker
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      disableWorker: true,
      disableAutoFetch: true,
      disableStream: true,
      verbosity: 0,
      useSystemFonts: true,
      isEvalSupported: false,
      maxImageSize: 1024 * 1024,
      cMapPacked: false
    });
    
    const pdf = await loadingTask.promise;

    let fullText = '';
    const totalPages = pdf.numPages;

    onProgress?.({ current: 0, total: totalPages, percentage: 0 });

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .filter((item: any) => 'str' in item && item.str.trim().length > 0)
          .map((item: any) => item.str)
          .join(' ');

        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }

        const percentage = Math.round((pageNum / totalPages) * 100);
        onProgress?.({ current: pageNum, total: totalPages, percentage });

      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
      }
    }

    const cleanedText = fullText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    return {
      text: cleanedText,
      pageCount: totalPages,
      success: true,
      metadata: { workerDisabled: true }
    };

  } catch (error) {
    console.error('❌ PDF extraction with progress failed:', error);
    
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Alternative extraction method with disabled worker as fallback
 */
export async function extractTextFromPDFWithoutWorker(file: File): Promise<PDFExtractionResult> {
  // This is now the same as the main extraction method since we always disable worker
  return extractTextFromPDFClient(file);
}

// OCR.space fallback for PDF extraction
async function ocrSpaceExtractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    console.log('🟡 Falling back to OCR.space for PDF text extraction...');
    
    // Check if we have an API key in environment (for server-side) or use free tier
    const apiKey = process.env.OCR_SPACE_API_KEY;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2'); // Use more accurate OCR engine
    
    // Add API key if available
    if (apiKey) {
      formData.append('apikey', apiKey);
      console.log('🔑 Using OCR.space API key');
    } else {
      console.log('⚠️ No OCR.space API key found, using free tier (limited requests)');
    }

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 OCR.space API error response:', errorText);
      
      if (response.status === 403) {
        throw new Error('OCR.space API access denied. This may be due to rate limiting or missing API key. Please try again later or contact support.');
      } else if (response.status === 429) {
        throw new Error('OCR.space API rate limit exceeded. Please try again in a few minutes.');
      } else {
        throw new Error(`OCR.space API returned ${response.status}: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('🔬 OCR.space API response:', data);
    
    if (data && data.ParsedResults && data.ParsedResults.length > 0) {
      const ocrText = data.ParsedResults.map((r: any) => r.ParsedText).join('\n');
      console.log('🟢 OCR.space extraction successful!');
      console.log('🟢 OCR text length:', ocrText.length);
      console.log('🟢 First 200 characters:', ocrText.substring(0, 200));
      
      return {
        text: ocrText,
        pageCount: 1, // OCR.space doesn't provide page count
        success: true,
        metadata: { 
          ocr: true, 
          ocrSpace: true,
          userMessage: 'Text extracted using OCR (optical character recognition)',
          extractionMethod: 'ocr-space'
        },
      };
    } else {
      console.error('🔴 OCR.space extraction failed:', data);
      const errorMsg = data?.ErrorMessage || data?.ErrorDetails || 'No text found in the document';
      return {
        text: '',
        pageCount: 0,
        success: false,
        error: `OCR extraction failed: ${errorMsg}`,
        metadata: {
          userMessage: 'OCR extraction failed. The document may not contain readable text.',
          ocrFailed: true,
          errorDetails: data
        }
      };
    }
  } catch (err) {
    console.error('🔴 OCR.space extraction error:', err);
    
    // Try server-side OCR as fallback
    console.log('🟡 Client-side OCR failed, trying server-side OCR...');
    try {
      const serverOcrResult = await performServerSideOCR(file);
      if (serverOcrResult.success) {
        return serverOcrResult;
      }
    } catch (serverError) {
      console.error('🔴 Server-side OCR also failed:', serverError);
    }
    
    // Provide more specific error messages
    let userMessage = 'OCR extraction failed. Please try again.';
    if (err instanceof Error) {
      if (err.message.includes('rate limit')) {
        userMessage = 'OCR service is temporarily unavailable due to high usage. Please try again in a few minutes.';
      } else if (err.message.includes('access denied')) {
        userMessage = 'OCR service is currently unavailable. Please try again later or contact support.';
      } else if (err.message.includes('network')) {
        userMessage = 'OCR extraction failed due to network error. Please check your connection and try again.';
      }
    }
    
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: err instanceof Error ? err.message : 'Network error during OCR extraction',
      metadata: {
        userMessage,
        ocrError: true,
        errorDetails: err,
        triedServerSide: true
      }
    };
  }
}

// Server-side OCR fallback
async function performServerSideOCR(file: File): Promise<PDFExtractionResult> {
  try {
    console.log('🟡 Attempting server-side OCR...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/ai/resume/ocr', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server OCR failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.text) {
      console.log('🟢 Server-side OCR successful!');
      console.log('🟢 Server OCR text length:', data.text.length);
      
      return {
        text: data.text,
        pageCount: data.pageCount || 1,
        success: true,
        metadata: {
          ...data.metadata,
          userMessage: 'Text extracted using server-side OCR (optical character recognition)',
          usedOcr: true,
          serverSide: true
        }
      };
    } else {
      throw new Error(data.error || 'Server OCR returned no text');
    }
    
  } catch (error) {
    console.error('🔴 Server-side OCR error:', error);
    throw error;
  }
} 