/**
 * Advanced job information extraction utilities
 * Provides comprehensive job data extraction with logo validation and structured parsing
 */

export interface JobExtractionData {
  jobTitle: string;
  company: string;
  location: string;
  jobUrl: string;
  description?: string;
  detailedDescription?: string;
  jobRequirements?: string;
  jobResponsibilities?: string;
  jobBenefits?: string;
  logoUrl?: string;
  source: string;
  salary?: string;
  jobType?: string;
  experienceLevel?: string;
  remoteWork?: string;
  applicationDeadline?: string;
  postedDate?: string;
  companySize?: string;
  industry?: string;
  technologies?: string[];
  skills?: string[];
  education?: string;
  certifications?: string[];
}

export interface LogoValidationResult {
  isValid: boolean;
  logoUrl?: string;
  reason?: string;
  confidence: number;
}

/**
 * Advanced logo extraction with comprehensive validation
 */
export function extractCompanyLogo(document: Document, companyName: string): LogoValidationResult {
  const logoSelectors = [
    // LinkedIn specific selectors
    '.job-details-jobs-unified-top-card__company-logo img',
    '.jobs-unified-top-card__company-logo img',
    '.jobs-unified-top-card__company-logo-image img',
    '[data-test-id="company-logo"] img',
    '.job-details-jobs-unified-top-card__company-logo',
    '.jobs-unified-top-card__company-logo',
    '.jobs-unified-top-card__company-logo-image',
    '[data-test-id="company-logo"]',
    // SVG logos
    '.job-details-jobs-unified-top-card__company-logo svg image',
    '.jobs-unified-top-card__company-logo svg image',
    '.job-details-jobs-unified-top-card__company-logo svg',
    '.jobs-unified-top-card__company-logo svg',
    // Fallback selectors
    '.jobs-box__company-logo img',
    '.jobs-company-logo img',
    '.company-logo img',
    '.logo img',
    // Generic logo containers
    '[class*="logo"] img',
    '[class*="company"] img',
    '[class*="brand"] img'
  ];

  let bestLogoUrl: string | undefined;
  let bestConfidence = 0;

  for (const selector of logoSelectors) {
    const logoElement = document.querySelector(selector);
    if (!logoElement) continue;

    let logoUrl: string | undefined;
    let confidence = 0;

    if (logoElement.tagName === 'IMG') {
      logoUrl = (logoElement as HTMLImageElement).src;
      confidence = 0.8;
    } else if (logoElement.tagName === 'SVG') {
      const imageElement = logoElement.querySelector('image');
      if (imageElement) {
        logoUrl = imageElement.getAttribute('href') || imageElement.getAttribute('xlink:href');
        confidence = 0.7;
      }
    } else {
      // Check for background image
      const computedStyle = window.getComputedStyle(logoElement);
      const bgImage = computedStyle.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch) {
          logoUrl = urlMatch[1];
          confidence = 0.6;
        }
      }
    }

    if (logoUrl && isValidLogoUrl(logoUrl, companyName)) {
      if (confidence > bestConfidence) {
        bestLogoUrl = logoUrl;
        bestConfidence = confidence;
      }
    }
  }

  return {
    isValid: !!bestLogoUrl,
    logoUrl: bestLogoUrl,
    confidence: bestConfidence,
    reason: bestLogoUrl ? 'Valid logo found' : 'No valid logo found'
  };
}

/**
 * Validate logo URL against common generic/placeholder patterns
 */
export function isValidLogoUrl(logoUrl: string, companyName: string): boolean {
  const urlLower = logoUrl.toLowerCase();
  const companyNameLower = companyName.toLowerCase();

  // Reject generic/placeholder logos
  const genericPatterns = [
    'default',
    'placeholder',
    'generic',
    'soti',
    'tata_consultancy_services',
    'doordash',
    'coinbase',
    'linkedin',
    'microsoft',
    'google',
    'apple',
    'amazon',
    'facebook',
    'netflix'
  ];

  // Check if URL contains generic patterns
  for (const pattern of genericPatterns) {
    if (urlLower.includes(pattern)) {
      // Only reject if it's clearly not the actual company
      if (!companyNameLower.includes(pattern)) {
        return false;
      }
    }
  }

  // Reject very small or very large images
  if (urlLower.includes('16x16') || urlLower.includes('32x32') || urlLower.includes('48x48')) {
    return false;
  }

  // Reject data URLs (base64 encoded images)
  if (urlLower.startsWith('data:')) {
    return false;
  }

  // Reject empty or invalid URLs
  if (!logoUrl || logoUrl.trim() === '' || logoUrl === 'null' || logoUrl === 'undefined') {
    return false;
  }

  return true;
}

/**
 * Extract comprehensive job information from LinkedIn job pages
 */
export function extractJobInformation(document: Document): JobExtractionData {
  const jobData: Partial<JobExtractionData> = {
    source: 'linkedin'
  };

  // Extract basic job information
  jobData.jobTitle = extractJobTitle(document);
  jobData.company = extractCompanyName(document);
  jobData.location = extractLocation(document);
  jobData.jobUrl = window.location.href;

  // Extract detailed descriptions
  jobData.description = extractJobDescription(document);
  jobData.detailedDescription = extractDetailedDescription(document);
  jobData.jobRequirements = extractJobRequirements(document);
  jobData.jobResponsibilities = extractJobResponsibilities(document);
  jobData.jobBenefits = extractJobBenefits(document);

  // Extract additional metadata
  jobData.salary = extractSalary(document);
  jobData.jobType = extractJobType(document);
  jobData.experienceLevel = extractExperienceLevel(document);
  jobData.remoteWork = extractRemoteWork(document);
  jobData.applicationDeadline = extractApplicationDeadline(document);
  jobData.postedDate = extractPostedDate(document);
  jobData.companySize = extractCompanySize(document);
  jobData.industry = extractIndustry(document);
  jobData.technologies = extractTechnologies(document);
  jobData.skills = extractSkills(document);
  jobData.education = extractEducation(document);
  jobData.certifications = extractCertifications(document);

  // Extract and validate logo
  const logoResult = extractCompanyLogo(document, jobData.company || '');
  if (logoResult.isValid && logoResult.logoUrl) {
    jobData.logoUrl = logoResult.logoUrl;
  }

  return jobData as JobExtractionData;
}

/**
 * Extract job title with multiple fallback selectors
 */
function extractJobTitle(document: Document): string {
  const selectors = [
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    '[data-test-id="job-title"]',
    'h1[class*="job-title"]',
    'h2[class*="job-title"]',
    '.job-title',
    'h1',
    'h2'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        return text;
      }
    }
  }

  return 'Untitled Job';
}

/**
 * Extract company name with multiple fallback selectors
 */
function extractCompanyName(document: Document): string {
  const selectors = [
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name',
    '[data-test-id="company-name"]',
    '.company-name',
    '[class*="company"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        return text;
      }
    }
  }

  return 'Unknown Company';
}

/**
 * Extract location with multiple fallback selectors
 */
function extractLocation(document: Document): string {
  const selectors = [
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.job-details-jobs-unified-top-card__location',
    '.jobs-unified-top-card__location',
    '[data-test-id="job-location"]',
    '.job-details-jobs-unified-top-card__subline',
    '.jobs-unified-top-card__subline',
    '.location',
    '[class*="location"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        return text;
      }
    }
  }

  return 'Remote';
}

/**
 * Extract job description
 */
function extractJobDescription(document: Document): string {
  const selectors = [
    '.jobs-description__content',
    '.job-description',
    '[data-section="job-description"]',
    '.description',
    '[class*="description"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        return text.substring(0, 2000);
      }
    }
  }

  return '';
}

/**
 * Extract detailed description with structured sections
 */
function extractDetailedDescription(document: Document): string {
  const descriptionElement = document.querySelector('.jobs-description__content');
  if (!descriptionElement) return '';

  const sections: Record<string, string> = {
    about: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    qualifications: '',
    skills: '',
    experience: '',
    education: '',
    compensation: '',
    workEnvironment: '',
    companyCulture: '',
    growthOpportunities: '',
    applicationProcess: '',
    additionalInfo: '',
    purpose: '',
    accountability: '',
    mainActivities: '',
    knowledgeRequirements: '',
    softSkills: '',
    jobComplexities: '',
    whatWeOffer: ''
  };

  // Look for structured sections
  const sectionElements = descriptionElement.querySelectorAll('h3, h4, strong, h2, p strong');
  sectionElements.forEach(section => {
    const sectionText = section.textContent?.toLowerCase() || '';
    let content = '';

    // Get content from next sibling or parent
    const nextElement = section.nextElementSibling;
    if (nextElement) {
      content = nextElement.textContent?.trim() || '';
    } else {
      const parent = section.parentElement;
      if (parent) {
        content = parent.textContent?.replace(sectionText, '').trim() || '';
      }
    }

    // Map sections based on keywords
    if (sectionText.includes('about') || sectionText.includes('description') || sectionText.includes('overview')) {
      sections.about = content;
    } else if (sectionText.includes('responsibility') || sectionText.includes('duties') || sectionText.includes('what you\'ll do')) {
      sections.responsibilities = content;
    } else if (sectionText.includes('requirement') || sectionText.includes('qualification') || sectionText.includes('what you\'ll bring')) {
      sections.requirements = content;
    } else if (sectionText.includes('benefit') || sectionText.includes('perk') || sectionText.includes('compensation')) {
      sections.benefits = content;
    } else if (sectionText.includes('education') || sectionText.includes('degree')) {
      sections.education = content;
    } else if (sectionText.includes('skill') || sectionText.includes('technology')) {
      sections.skills = content;
    } else if (sectionText.includes('experience') || sectionText.includes('background')) {
      sections.experience = content;
    } else if (sectionText.includes('salary') || sectionText.includes('pay') || sectionText.includes('compensation')) {
      sections.compensation = content;
    } else if (sectionText.includes('work environment') || sectionText.includes('remote') || sectionText.includes('hybrid')) {
      sections.workEnvironment = content;
    } else if (sectionText.includes('culture') || sectionText.includes('values') || sectionText.includes('mission')) {
      sections.companyCulture = content;
    } else if (sectionText.includes('growth') || sectionText.includes('career') || sectionText.includes('development')) {
      sections.growthOpportunities = content;
    } else if (sectionText.includes('application') || sectionText.includes('apply') || sectionText.includes('process')) {
      sections.applicationProcess = content;
    } else if (sectionText.includes('additional') || sectionText.includes('note') || sectionText.includes('other')) {
      sections.additionalInfo = content;
    } else if (sectionText.includes('purpose')) {
      sections.purpose = content;
    } else if (sectionText.includes('accountability')) {
      sections.accountability = content;
    } else if (sectionText.includes('main activities')) {
      sections.mainActivities = content;
    } else if (sectionText.includes('knowledge') || sectionText.includes('skill requirements')) {
      sections.knowledgeRequirements = content;
    } else if (sectionText.includes('soft skills')) {
      sections.softSkills = content;
    } else if (sectionText.includes('complexities') || sectionText.includes('thinking challenges')) {
      sections.jobComplexities = content;
    } else if (sectionText.includes('what we offer') || sectionText.includes('benefits')) {
      sections.whatWeOffer = content;
    }
  });

  // Create structured description
  const structuredDescription = Object.entries(sections)
    .filter(([_, content]) => content.length > 0)
    .map(([section, content]) => {
      const title = section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1');
      return `**${title}:**\n${content}`;
    })
    .join('\n\n');

  return structuredDescription.substring(0, 5000);
}

/**
 * Extract job requirements
 */
function extractJobRequirements(document: Document): string {
  const selectors = [
    '[data-section="job-requirements"]',
    '.job-requirements',
    '.requirements',
    '[class*="requirement"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        return text.substring(0, 3000);
      }
    }
  }

  return '';
}

/**
 * Extract job responsibilities
 */
function extractJobResponsibilities(document: Document): string {
  const selectors = [
    '[data-section="job-responsibilities"]',
    '.job-responsibilities',
    '.responsibilities',
    '[class*="responsibility"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        return text.substring(0, 3000);
      }
    }
  }

  return '';
}

/**
 * Extract job benefits
 */
function extractJobBenefits(document: Document): string {
  const selectors = [
    '[data-section="job-benefits"]',
    '.job-benefits',
    '.benefits',
    '[class*="benefit"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        return text.substring(0, 2000);
      }
    }
  }

  return '';
}

/**
 * Extract salary information
 */
function extractSalary(document: Document): string {
  const salaryPatterns = [
    /\$[\d,]+(?:-\$[\d,]+)?/g,
    /\d{1,3}(?:,\d{3})*(?:-\d{1,3}(?:,\d{3})*)?\s*(?:USD|dollars?|k|K)/g,
    /salary[:\s]*\$?[\d,]+/gi,
    /compensation[:\s]*\$?[\d,]+/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of salaryPatterns) {
    const matches = allText.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }

  return '';
}

/**
 * Extract job type
 */
function extractJobType(document: Document): string {
  const jobTypePatterns = [
    /full.?time/gi,
    /part.?time/gi,
    /contract/gi,
    /temporary/gi,
    /internship/gi,
    /freelance/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of jobTypePatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return '';
}

/**
 * Extract experience level
 */
function extractExperienceLevel(document: Document): string {
  const levelPatterns = [
    /entry.?level/gi,
    /junior/gi,
    /senior/gi,
    /lead/gi,
    /principal/gi,
    /director/gi,
    /manager/gi,
    /executive/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of levelPatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return '';
}

/**
 * Extract remote work information
 */
function extractRemoteWork(document: Document): string {
  const remotePatterns = [
    /remote/gi,
    /hybrid/gi,
    /on.?site/gi,
    /work.?from.?home/gi,
    /wfh/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of remotePatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return '';
}

/**
 * Extract application deadline
 */
function extractApplicationDeadline(document: Document): string {
  const deadlinePatterns = [
    /deadline[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
    /apply.?by[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
    /closing[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of deadlinePatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return '';
}

/**
 * Extract posted date
 */
function extractPostedDate(document: Document): string {
  const datePatterns = [
    /posted[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
    /published[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
    /listed[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of datePatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return '';
}

/**
 * Extract company size
 */
function extractCompanySize(document: Document): string {
  const sizePatterns = [
    /(\d+)-(\d+)\s+employees/gi,
    /(\d+)\+?\s+employees/gi,
    /startup/gi,
    /small.?business/gi,
    /medium.?sized/gi,
    /large.?company/gi,
    /fortune\s+\d+/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of sizePatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return '';
}

/**
 * Extract industry
 */
function extractIndustry(document: Document): string {
  const industryPatterns = [
    /technology/gi,
    /healthcare/gi,
    /finance/gi,
    /education/gi,
    /retail/gi,
    /manufacturing/gi,
    /consulting/gi,
    /non.?profit/gi,
    /government/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of industryPatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return '';
}

/**
 * Extract technologies mentioned
 */
function extractTechnologies(document: Document): string[] {
  const techPatterns = [
    /javascript|js/gi,
    /python/gi,
    /java/gi,
    /react/gi,
    /angular/gi,
    /vue/gi,
    /node\.?js/gi,
    /typescript/gi,
    /sql/gi,
    /mongodb/gi,
    /aws/gi,
    /azure/gi,
    /docker/gi,
    /kubernetes/gi,
    /git/gi,
    /agile/gi,
    /scrum/gi
  ];

  const allText = document.body.textContent || '';
  const technologies: string[] = [];
  
  for (const pattern of techPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      technologies.push(...matches);
    }
  }

  return [...new Set(technologies)]; // Remove duplicates
}

/**
 * Extract skills mentioned
 */
function extractSkills(document: Document): string[] {
  const skillPatterns = [
    /leadership/gi,
    /communication/gi,
    /problem.?solving/gi,
    /teamwork/gi,
    /project.?management/gi,
    /analytical/gi,
    /creative/gi,
    /detail.?oriented/gi,
    /time.?management/gi,
    /customer.?service/gi
  ];

  const allText = document.body.textContent || '';
  const skills: string[] = [];
  
  for (const pattern of skillPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      skills.push(...matches);
    }
  }

  return [...new Set(skills)]; // Remove duplicates
}

/**
 * Extract education requirements
 */
function extractEducation(document: Document): string {
  const educationPatterns = [
    /bachelor/gi,
    /master/gi,
    /phd/gi,
    /degree/gi,
    /diploma/gi,
    /certification/gi,
    /high.?school/gi,
    /college/gi,
    /university/gi
  ];

  const allText = document.body.textContent || '';
  
  for (const pattern of educationPatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return '';
}

/**
 * Extract certifications mentioned
 */
function extractCertifications(document: Document): string[] {
  const certPatterns = [
    /pmp/gi,
    /scrum.?master/gi,
    /aws.?certified/gi,
    /azure.?certified/gi,
    /google.?cloud/gi,
    /cisco/gi,
    /microsoft/gi,
    /oracle/gi,
    /salesforce/gi
  ];

  const allText = document.body.textContent || '';
  const certifications: string[] = [];
  
  for (const pattern of certPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      certifications.push(...matches);
    }
  }

  return [...new Set(certifications)]; // Remove duplicates
} 