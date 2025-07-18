/**
 * Server-only PDF processing utilities
 * This file should only be imported in server-side code (API routes, server actions)
 */

import { ParsedResumeData } from './pdf.utils';

/**
 * Simple PDF parser import with fallback handling
 */
async function getPdfParser() {
  try {
    // Check if we're in a server environment
    if (typeof window !== 'undefined') {
      throw new Error('PDF parsing is only available on the server side');
    }

    console.log('Importing pdf-parse...');
    
    // Use require for better stability in server environment
    const pdfParse = require('pdf-parse');
    
    if (typeof pdfParse !== 'function') {
      throw new Error('pdf-parse is not a function');
    }

    console.log('pdf-parse imported successfully');
    return pdfParse;
  } catch (error) {
    console.error('Failed to import pdf-parse:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Cannot find module')) {
        throw new Error('PDF parsing library not installed. Please install pdf-parse.');
      } else if (error.message.includes('ENOENT')) {
        throw new Error('PDF parsing library has dependency issues. Please restart the development server.');
      }
    }
    
    throw error;
  }
}

/**
 * Server-only PDF text extraction with graceful fallback
 * Currently disabled due to pdf-parse library issues
 */
export async function extractTextFromPDFServer(pdfBuffer: Buffer): Promise<string> {
  try {
    // Ensure we're running on the server side
    if (typeof window !== 'undefined') {
      throw new Error('PDF extraction can only be done on the server side');
    }

    console.log('=== PDF Text Extraction Starting ===');
    console.log('Buffer size:', pdfBuffer.length);

    // Comprehensive buffer validation
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Invalid PDF buffer: empty or null');
    }

    if (pdfBuffer.length < 100) {
      throw new Error('PDF file is too small to be valid');
    }

    // Check for PDF header
    const headerBytes = pdfBuffer.slice(0, 8);
    const header = headerBytes.toString('ascii', 0, 4);
    
    console.log('PDF header check:', header);
    
    if (header !== '%PDF') {
      throw new Error(`Invalid PDF format. Expected '%PDF' header, got: '${header}'`);
    }

    console.log('PDF buffer validation successful');

    // Temporarily disable PDF parsing due to library issues
    console.log('PDF text extraction is temporarily disabled due to library compatibility issues');
    
    return 'PDF text extraction is currently unavailable. Your PDF has been uploaded successfully and you can manually enter your information below. We are working on resolving the text extraction feature.';

    /* 
    // TODO: Re-enable when pdf-parse issues are resolved
    // Get the PDF parser
    const pdfParse = await getPdfParser();

    // Configure parsing options
    const options = {
      // Limit memory usage and processing time
      max: 0, // No page limit by default
      version: 'default',
      // Disable potentially problematic features
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    };

    console.log('Starting PDF parsing...');
    
    try {
      const data = await pdfParse(pdfBuffer, options);
      
      console.log('PDF parsing completed successfully');
      console.log('- Text length:', data.text?.length || 0);
      console.log('- Number of pages:', data.numpages || 0);
      console.log('- PDF info:', data.info || 'No info available');

      const extractedText = data.text || '';

      if (!extractedText || extractedText.trim().length === 0) {
        console.warn('PDF parsed but no text content found');
        return 'No readable text content found in this PDF. The document may contain only images or be formatted in a way that prevents text extraction.';
      }

      console.log('=== PDF Text Extraction Successful ===');
      console.log('Extracted text preview:', extractedText.substring(0, 200));
      
      return extractedText;
    } catch (parseError) {
      console.error('PDF parsing failed:', parseError);
      
      // Handle specific PDF parsing errors
      if (parseError instanceof Error) {
        if (parseError.message.includes('Invalid PDF')) {
          throw new Error('The uploaded file appears to be corrupted or is not a valid PDF.');
        } else if (parseError.message.includes('encrypted') || parseError.message.includes('password')) {
          throw new Error('The PDF is password protected and cannot be processed.');
        } else if (parseError.message.includes('ENOENT')) {
          throw new Error('PDF parsing library has file access issues. Please try again or restart the server.');
        } else if (parseError.message.includes('timeout')) {
          throw new Error('PDF processing timed out. The file may be too large or complex.');
        }
      }
      
      throw new Error(`PDF parsing failed: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
    */

  } catch (error) {
    console.error('=== PDF Text Extraction Failed ===');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
    });
    
    // Return a user-friendly message instead of throwing
    return 'PDF text extraction is currently unavailable. Your PDF has been uploaded successfully and you can manually enter your information below.';
  }
}

/**
 * Server-only PDF resume processing pipeline
 */
export async function processPDFResumeServer(pdfBuffer: Buffer): Promise<{
  extractedText: string;
  parsedData?: ParsedResumeData;
}> {
  try {
    // Ensure we're running on the server side
    if (typeof window !== 'undefined') {
      throw new Error('PDF processing can only be done on the server side');
    }

    console.log('=== PDF Resume Processing Starting ===');

    // Extract text from PDF (currently returns fallback message)
    const extractedText = await extractTextFromPDFServer(pdfBuffer);
    
    // Skip AI parsing since text extraction is disabled
    console.log('Skipping AI parsing - text extraction is currently disabled');

    console.log('=== PDF Resume Processing Completed ===');
    
    return {
      extractedText,
      parsedData: undefined
    };
  } catch (error) {
    console.error('=== PDF Resume Processing Failed ===');
    console.error('Error processing PDF resume:', error);
    
    // Return a graceful fallback instead of throwing
    return {
      extractedText: 'PDF processing encountered an issue. Your PDF has been uploaded successfully and you can manually enter your information below.',
      parsedData: undefined
    };
  }
} 