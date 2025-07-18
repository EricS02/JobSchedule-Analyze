# PDF Resume Parsing Feature

## Overview
This feature automatically extracts text content from uploaded PDF resumes and uses AI to parse it into structured data (contact info, experience, education, etc.).

## Setup Instructions

### 1. Install Dependencies
The following packages are already installed:
- `pdf-parse` - For extracting text from PDF files
- `@langchain/openai` - For AI-powered text parsing
- `@langchain/core` - LangChain core functionality

### 2. Environment Configuration
Add the following environment variables to your `.env.local` file:

```bash
# Enable/disable PDF parsing (default: true)
ENABLE_PDF_PARSING=true

# OpenAI API key for AI parsing (optional - if not provided, only text extraction will work)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. How It Works

#### PDF Text Extraction
- When a PDF is uploaded, the system extracts raw text using `pdf-parse`
- This happens automatically for all PDF uploads

#### AI-Powered Parsing (Optional)
- If `OPENAI_API_KEY` is provided, the system uses GPT-3.5-turbo to parse the extracted text
- The AI identifies and structures:
  - Contact Information (name, email, phone, address, headline)
  - Professional Summary
  - Work Experience (company, job title, location, description, dates)
  - Education (institution, degree, field of study, location, dates)

#### Database Population
- Automatically creates structured resume sections from parsed data
- Creates related entities (companies, job titles, locations) as needed
- Links everything properly in the database

### 4. Usage

#### For Users
1. Create a new resume and upload a PDF file
2. The system automatically processes the PDF
3. Structured data appears in the resume sections
4. Users can edit/refine the auto-populated data

#### For Developers
```typescript
// Use the new parsing-enabled function
import { createResumeProfileWithParsing } from '@/actions/profile.actions';

const result = await createResumeProfileWithParsing(
  title, 
  fileName, 
  filePath
);
```

### 5. Features

#### Automatic Data Population
- ✅ Contact Information
- ✅ Professional Summary
- ✅ Work Experience with company/title/location matching
- ✅ Education history
- ✅ Date parsing (flexible format support)

#### Fallback Handling
- If AI parsing fails, resume creation still succeeds
- Only text extraction is performed without OpenAI API key
- Graceful error handling prevents upload failures

#### Smart Entity Matching
- Reuses existing companies, job titles, and locations
- Creates new entities only when needed
- Maintains data consistency across the system

### 6. Configuration Options

```typescript
// In the API route, you can control parsing behavior:
const enablePdfParsing = process.env.ENABLE_PDF_PARSING !== 'false';
const isPdfFile = file?.name?.toLowerCase().endsWith('.pdf');

if (enablePdfParsing && isPdfFile) {
  // Use parsing
  response = await createResumeProfileWithParsing(title, fileName, filePath);
} else {
  // Standard creation
  response = await createResumeProfile(title, fileName, filePath);
}
```

### 7. Testing
1. Upload a PDF resume through the standard resume creation flow
2. Check the console logs for parsing progress
3. Verify that structured data appears in the resume sections
4. Test with different PDF formats and content structures

### 8. Troubleshooting

#### Common Issues
- **No structured data appears**: Check if `OPENAI_API_KEY` is set correctly
- **PDF not recognized**: Ensure file extension is `.pdf`
- **Parsing fails**: Check console logs for specific error messages
- **Performance issues**: Large PDFs may take longer to process

#### Debug Logging
The system includes comprehensive logging:
- PDF text extraction success/failure
- AI parsing attempts and results
- Database population progress
- Error details for troubleshooting

### 9. Future Enhancements
- Support for DOC/DOCX files
- Custom parsing templates
- Batch processing for multiple resumes
- Enhanced AI prompts for specific resume formats
- Preview of parsed data before saving 