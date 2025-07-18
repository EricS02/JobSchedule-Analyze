import { ChatOpenAI } from "@langchain/openai";

export interface ParsedResumeData {
  contactInfo?: {
    firstName: string;
    lastName: string;
    headline: string;
    email: string;
    phone: string;
    address?: string;
  };
  summary?: string;
  experience?: Array<{
    company: string;
    jobTitle: string;
    location: string;
    description: string;
    startDate?: string;
    endDate?: string;
    currentJob?: boolean;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    location: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }>;
  technicalSkills?: Array<{
    category: string;
    skills: string[];
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    title: string;
    organization: string;
    issueDate?: string;
    expirationDate?: string;
    credentialUrl?: string;
  }>;
}

/**
 * Extracts text content from a PDF buffer
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // Ensure we're running on the server side
    if (typeof window !== 'undefined') {
      throw new Error('PDF extraction can only be done on the server side');
    }

    // Dynamic import to avoid issues with Next.js SSR
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Uses AI to parse resume text into structured data
 */
export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  try {
    // Sanitize curly braces in resume text to avoid LangChain template errors
    const safeResumeText = resumeText.replace(/[{}]/g, '');

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxTokens: 4000,
    });

    // Create the prompt without template variables to avoid parsing issues
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

    const result = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    // Parse the JSON response
    try {
      let content = result.content.trim();
      
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
      return parsedData;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', result.content);
      console.error('Parse error:', parseError);
      
      // Try additional cleanup if the first attempt failed
      try {
        let content = result.content.trim();
        
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
    console.error('Error parsing resume with AI:', error);
    
    // Log the raw AI response for debugging
    if (error instanceof Error && error.message.includes('AI returned invalid JSON format')) {
      console.error('Raw AI response that failed to parse:', result?.content);
    }
    
    throw new Error('Failed to parse resume content');
  }
}

/**
 * Complete PDF resume processing pipeline
 */
export async function processPDFResume(pdfBuffer: Buffer): Promise<{
  extractedText: string;
  parsedData?: ParsedResumeData;
}> {
  try {
    // Ensure we're running on the server side
    if (typeof window !== 'undefined') {
      throw new Error('PDF processing can only be done on the server side');
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(pdfBuffer);
    
    // Only attempt AI parsing if we have a valid OpenAI API key
    let parsedData: ParsedResumeData | undefined;
    if (process.env.OPENAI_API_KEY && extractedText.trim().length > 100) {
      try {
        parsedData = await parseResumeWithAI(extractedText);
      } catch (aiError) {
        console.warn('AI parsing failed, continuing with text extraction only:', aiError);
      }
    }

    return {
      extractedText,
      parsedData
    };
  } catch (error) {
    console.error('Error processing PDF resume:', error);
    throw error;
  }
} 