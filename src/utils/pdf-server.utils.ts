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
    
    // Use dynamic import for better compatibility
    const pdfParse = (await import('pdf-parse')).default;
    
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
 * Server-only PDF text extraction with enhanced error handling
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

    // Get the PDF parser
    const pdfParse = await getPdfParser();

    // Configure parsing options
    const options = {
      // Limit memory usage and processing time
      max: 0, // No page limit by default
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

  } catch (error) {
    console.error('=== PDF Text Extraction Failed ===');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
    });
    
    // Return a user-friendly message instead of throwing
    return 'PDF text extraction encountered an issue. Your PDF has been uploaded successfully and you can manually enter your information below.';
  }
}

/**
 * AI-powered resume parsing with enhanced structure
 */
export async function parseResumeWithAIServer(resumeText: string): Promise<ParsedResumeData> {
  try {
    console.log('=== AI Resume Parsing Starting ===');
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, skipping AI parsing');
      throw new Error('AI parsing not available - OpenAI API key not configured');
    }

    // Import OpenAI dynamically to avoid SSR issues
    const { ChatOpenAI } = await import('@langchain/openai');

    // Sanitize curly braces in resume text to avoid LangChain template errors
    const safeResumeText = resumeText.replace(/[{}]/g, '');

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxTokens: 4000,
    });

    // Enhanced prompt for better parsing
    const systemPrompt = `You are an expert resume parser. Extract structured data from the resume text and return ONLY a valid JSON object with the following structure:

{
  "contactInfo": {
    "firstName": "string",
    "lastName": "string", 
    "headline": "string (professional title/summary)",
    "email": "string",
    "phone": "string",
    "address": "string (optional)"
  },
  "summary": "string (professional summary/objective)",
  "experience": [
    {
      "company": "string",
      "jobTitle": "string",
      "location": "string",
      "description": "string",
      "startDate": "YYYY-MM format or null",
      "endDate": "YYYY-MM format or null", 
      "currentJob": boolean
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string", 
      "location": "string",
      "description": "string (optional)",
      "startDate": "YYYY-MM format or null",
      "endDate": "YYYY-MM format or null"
    }
  ],
  "technicalSkills": [
    {
      "category": "string (e.g., Programming Languages, Frameworks, Tools)",
      "skills": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string (optional)",
      "startDate": "YYYY-MM format or null",
      "endDate": "YYYY-MM format or null"
    }
  ],
  "certifications": [
    {
      "title": "string",
      "organization": "string",
      "issueDate": "YYYY-MM format or null",
      "expirationDate": "YYYY-MM format or null",
      "credentialUrl": "string (optional)"
    }
  ]
}

CRITICAL JSON FORMATTING RULES:
- Return ONLY valid JSON - no markdown formatting, no code blocks
- Do NOT include trailing commas after the last item in arrays or objects
- Do NOT include any text before or after the JSON object
- Ensure all arrays and objects are properly closed
- Use null for missing values, not undefined or empty strings
- All string values must be properly quoted
- Boolean values should be true/false, not "true"/"false"

Content Rules:
- Extract ALL information that is clearly present in the text
- Look for multiple job experiences - don't stop at the first one
- Parse each job experience as a separate entry in the experience array
- Use null for missing dates
- Combine first and last names if they appear together
- Create a professional headline if one isn't explicitly stated
- Group technical skills by categories (Programming Languages, Frameworks, Tools, etc.)
- Extract all projects mentioned in the resume
- Extract all certifications and licenses
- For experience descriptions, include all bullet points and responsibilities
- Ensure all required fields have meaningful values
- Return valid JSON only, no other text`;

    const userPrompt = `Parse this resume text into structured JSON:

${safeResumeText}`;

    console.log('Sending request to OpenAI...');
    const result = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    console.log('OpenAI response received, parsing JSON...');

    // Parse the JSON response
    try {
      let content = typeof result.content === 'string' ? result.content.trim() : String(result.content);
      
      // Remove any markdown code block formatting
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '');
      }
      if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '');
      }
      if (content.endsWith('```')) {
        content = content.replace(/\s*```$/, '');
      }
      
      // Clean up common JSON formatting issues
      content = content.trim();
      
      // Fix trailing commas in arrays and objects
      content = content.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix trailing commas before closing braces
      content = content.replace(/,(\s*})/g, '$1');
      
      // Fix specific case of trailing comma after empty array
      content = content.replace(/\[\s*,\s*\]/g, '[]');
      content = content.replace(/\[\s*,\s*}/g, '[]}');
      
      // Fix trailing comma after empty array before closing brace
      content = content.replace(/\[\s*,\s*(\s*})/g, '[]$1');
      
      // Try to parse the cleaned JSON
      const parsedData: ParsedResumeData = JSON.parse(content);
      
      console.log('=== AI Resume Parsing Successful ===');
      console.log('Parsed data structure:', {
        hasContactInfo: !!parsedData.contactInfo,
        hasExperience: !!parsedData.experience?.length,
        hasEducation: !!parsedData.education?.length,
        hasSkills: !!parsedData.technicalSkills?.length,
        hasProjects: !!parsedData.projects?.length,
        hasCertifications: !!parsedData.certifications?.length
      });
      
      return parsedData;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', result.content);
      console.error('Parse error:', parseError);
      
      // Try additional cleanup if the first attempt failed
      try {
        let content = typeof result.content === 'string' ? result.content.trim() : String(result.content);
        
        // More aggressive cleanup for common AI formatting issues
        content = content.replace(/```json\s*/, '');
        content = content.replace(/```\s*/, '');
        content = content.replace(/\s*```$/, '');
        content = content.replace(/,(\s*[}\]])/g, '$1');
        content = content.replace(/,(\s*})/g, '$1');
        content = content.replace(/,\s*}/g, '}');
        content = content.replace(/,\s*]/g, ']');
        
        // Fix specific case of trailing comma after empty array
        content = content.replace(/\[\s*,\s*\]/g, '[]');
        content = content.replace(/\[\s*,\s*}/g, '[]}');
        content = content.replace(/\[\s*,\s*(\s*})/g, '[]$1');
        
        // Remove any non-JSON text before or after the JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }
        
        const parsedData: ParsedResumeData = JSON.parse(content);
        return parsedData;
      } catch (secondParseError) {
        console.error('Second parse attempt also failed:', secondParseError);
        throw new Error('AI returned invalid JSON format');
      }
    }

  } catch (error) {
    console.error('=== AI Resume Parsing Failed ===');
    console.error('Error parsing resume with AI:', error);
    
    throw new Error('Failed to parse resume content with AI');
  }
}

/**
 * Server-only PDF resume processing pipeline with AI parsing
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

    // Extract text from PDF
    const extractedText = await extractTextFromPDFServer(pdfBuffer);
    
    // Only attempt AI parsing if we have a valid OpenAI API key and sufficient text
    let parsedData: ParsedResumeData | undefined;
    if (process.env.OPENAI_API_KEY && extractedText.trim().length > 100) {
      try {
        parsedData = await parseResumeWithAIServer(extractedText);
        console.log('AI parsing completed successfully');
      } catch (aiError) {
        console.warn('AI parsing failed, continuing with text extraction only:', aiError);
      }
    } else {
      console.log('Skipping AI parsing - insufficient text or no API key');
    }

    console.log('=== PDF Resume Processing Completed ===');
    
    return {
      extractedText,
      parsedData
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