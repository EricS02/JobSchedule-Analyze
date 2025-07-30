// JobSchedule LinkedIn Content Script
console.log("🚀 JobSchedule: Content script loaded");

// Global variables
let currentJobData = null;
let trackButton = null;
let isProcessingClick = false;
let lastProcessedUrl = null;
let initializedUrls = new Set();
let processedJobs = new Set(); // Track processed jobs to prevent duplicates
let currentJobIdentifier = null; // Track current job being processed
let isInitializing = false; // Prevent multiple initializations
let clickTimeout = null; // Track click timeout

// Advanced logo extraction with comprehensive validation
function extractCompanyLogo(document, companyName) {
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

  let bestLogoUrl = undefined;
  let bestConfidence = 0;

  for (const selector of logoSelectors) {
    const logoElement = document.querySelector(selector);
    if (!logoElement) continue;

    let logoUrl = undefined;
    let confidence = 0;

    if (logoElement.tagName === 'IMG') {
      logoUrl = logoElement.src;
      confidence = 0.8;
    } else if (logoElement.tagName === 'SVG') {
      const imageElement = logoElement.querySelector('image');
      if (imageElement) {
        logoUrl = imageElement.getAttribute('href') || imageElement.getAttribute('xlink:href') || undefined;
        confidence = 0.7;
      }
    } else {
      // Check for background image
      const computedStyle = window.getComputedStyle(logoElement);
      const bgImage = computedStyle.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch) {
          logoUrl = urlMatch[1] || undefined;
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

// Validate logo URL against common generic/placeholder patterns
function isValidLogoUrl(logoUrl, companyName) {
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

// Extract comprehensive job information
function extractJobInformation() {
  const jobData = {
    source: 'linkedin'
  };

  // Extract basic job information
  jobData.jobTitle = extractJobTitle();
  jobData.company = extractCompanyName();
  jobData.location = extractLocation();
  jobData.jobUrl = window.location.href;

  // Extract detailed descriptions
  jobData.description = extractJobDescription();
  jobData.detailedDescription = extractDetailedDescription();
  jobData.jobRequirements = extractJobRequirements();
  jobData.jobResponsibilities = extractJobResponsibilities();
  jobData.jobBenefits = extractJobBenefits();

  // Extract additional metadata
  jobData.salary = extractSalary();
  jobData.jobType = extractJobType();
  jobData.experienceLevel = extractExperienceLevel();
  jobData.remoteWork = extractRemoteWork();
  jobData.applicationDeadline = extractApplicationDeadline();
  jobData.postedDate = extractPostedDate();
  jobData.companySize = extractCompanySize();
  jobData.industry = extractIndustry();
  jobData.technologies = extractTechnologies();
  jobData.skills = extractSkills();
  jobData.education = extractEducation();
  jobData.certifications = extractCertifications();

  // Extract and validate logo
  const logoResult = extractCompanyLogo(document, jobData.company || '');
  if (logoResult.isValid && logoResult.logoUrl) {
    jobData.logoUrl = logoResult.logoUrl;
  }

  return jobData;
}

// Extract job title with multiple fallback selectors
function extractJobTitle() {
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

// Extract company name with multiple fallback selectors
function extractCompanyName() {
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

// Extract location with multiple fallback selectors
function extractLocation() {
  const selectors = [
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.job-details-jobs-unified-top-card__location',
    '.jobs-unified-top-card__location',
    '[data-test-id="job-location"]',
    '.job-details-jobs-unified-top-card__subline',
    '.jobs-unified-top-card__subline',
    '.location',
    '[class*="location"]',
    // Additional LinkedIn selectors
    '.jobs-unified-top-card__metadata-item',
    '.job-details-jobs-unified-top-card__metadata-item',
    '[data-test-id="job-location"]',
    '.jobs-unified-top-card__subline-item',
    '.job-details-jobs-unified-top-card__subline-item'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && !text.toLowerCase().includes('remote')) {
        // Check if it's actually a location (not remote indicator)
        if (text.includes(',') || text.includes('City') || text.includes('State') || text.includes('Country')) {
          return text;
        }
        // Also check for common location patterns
        if (/^[A-Za-z\s,]+$/.test(text) && text.length > 3) {
          return text;
        }
      }
    }
  }

  // If no specific location found, check if it's actually remote
  const remoteSelectors = [
    '[data-test-id="remote-indicator"]',
    '.jobs-unified-top-card__remote-indicator',
    '.job-details-jobs-unified-top-card__remote-indicator'
  ];

  for (const selector of remoteSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      return 'Remote';
    }
  }

  return 'Location not specified';
}

// Extract job description
function extractJobDescription() {
  const selectors = [
    // LinkedIn specific selectors
    '.jobs-description__content',
    '.job-description',
    '[data-section="job-description"]',
    '.description',
    '[class*="description"]',
    // Additional LinkedIn selectors
    '.jobs-box__html-content',
    '.jobs-description-content__text',
    '.job-description-content',
    '.jobs-description__content-text',
    '.jobs-box__content',
    // Fallback selectors
    '[data-test-id="job-description"]',
    '.job-details-jobs-unified-top-card__job-description',
    '.jobs-unified-top-card__job-description'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        console.log("🚀 JobSchedule: Found job description with selector:", selector);
        console.log("🚀 JobSchedule: Description length:", text.length);
        return text.substring(0, 5000); // Increased limit
      }
    }
  }

  console.log("🚀 JobSchedule: No job description found with any selector");
  return '';
}

// Extract detailed description with structured sections
function extractDetailedDescription() {
  const descriptionElement = document.querySelector('.jobs-description__content');
  if (!descriptionElement) return '';

  const sections = {
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

// Extract job requirements
function extractJobRequirements() {
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

// Extract job responsibilities
function extractJobResponsibilities() {
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

// Extract job benefits
function extractJobBenefits() {
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

// Extract salary information
function extractSalary() {
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

// Extract job type
function extractJobType() {
  const jobTypePatterns = [
    /full.?time/gi,
    /part.?time/gi,
    /contract/gi,
    /temporary/gi,
    /internship/gi,
    /freelance/gi,
    /permanent/gi,
    /seasonal/gi,
    /volunteer/gi
  ];

  // Also check specific LinkedIn elements
  const jobTypeSelectors = [
    '[data-test-id="job-type"]',
    '.jobs-unified-top-card__job-type',
    '.job-details-jobs-unified-top-card__job-type',
    '.job-type',
    '[class*="job-type"]'
  ];

  // First try LinkedIn-specific selectors
  for (const selector of jobTypeSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        return text;
      }
    }
  }

  // Then check patterns in all text
  const allText = document.body.textContent || '';
  
  for (const pattern of jobTypePatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return 'Full-time'; // Default to full-time if not specified
}

// Extract experience level
function extractExperienceLevel() {
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

// Extract remote work information
function extractRemoteWork() {
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

// Extract application deadline
function extractApplicationDeadline() {
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

// Extract posted date
function extractPostedDate() {
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

// Extract company size
function extractCompanySize() {
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

// Extract industry
function extractIndustry() {
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

// Extract technologies mentioned
function extractTechnologies() {
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
  const technologies = [];
  
  for (const pattern of techPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      technologies.push(...matches);
    }
  }

  return [...new Set(technologies)]; // Remove duplicates
}

// Extract skills mentioned
function extractSkills() {
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
  const skills = [];
  
  for (const pattern of skillPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      skills.push(...matches);
    }
  }

  return [...new Set(skills)]; // Remove duplicates
}

// Extract education requirements
function extractEducation() {
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

// Extract certifications mentioned
function extractCertifications() {
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
  const certifications = [];
  
  for (const pattern of certPatterns) {
    const matches = allText.match(pattern);
    if (matches) {
      certifications.push(...matches);
    }
  }

  return [...new Set(certifications)]; // Remove duplicates
}

// Main function to initialize job tracking
function initializeJobTracking() {
  try {
    // Only run on LinkedIn job pages
    if (!window.location.href.includes('linkedin.com/jobs/')) {
      return;
    }

    // Prevent multiple initializations
    if (isInitializing) {
      console.log("🚀 JobSchedule: Already initializing, skipping");
      return;
    }

    // Prevent multiple initializations for the same URL
    const currentUrl = window.location.href;
    if (initializedUrls.has(currentUrl)) {
      console.log("🚀 JobSchedule: Already initialized for this URL, skipping");
      return;
    }

    isInitializing = true;
    console.log("🚀 JobSchedule: LinkedIn job page detected");
    
    // Wait for page to load completely, then create track button
    setTimeout(() => {
      createTrackButton();
      setupApplyButtonMonitoring();
      initializedUrls.add(currentUrl);
      
      // Clean up old URLs to prevent memory leaks (keep only last 10)
      if (initializedUrls.size > 10) {
        const urlsArray = Array.from(initializedUrls);
        initializedUrls.clear();
        urlsArray.slice(-5).forEach(url => initializedUrls.add(url));
      }
      
      console.log("🚀 JobSchedule: Initialization completed for URL:", currentUrl);
      isInitializing = false;
    }, 2000);
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error initializing job tracking:", error);
    isInitializing = false;
  }
}

// Extract job data when needed - now using enhanced extraction
function extractJobData() {
  try {
    console.log("🚀 JobSchedule: Starting enhanced job data extraction for URL:", window.location.href);
    
    // Use the comprehensive job information extraction
    const jobData = extractJobInformation();
    
    console.log("🚀 JobSchedule: Enhanced job data extracted:", {
      jobTitle: jobData.jobTitle?.substring(0, 50),
      company: jobData.company?.substring(0, 50),
      location: jobData.location?.substring(0, 50),
      hasLogo: !!jobData.logoUrl,
      hasDescription: !!jobData.description,
      hasDetailedDescription: !!jobData.detailedDescription,
      hasRequirements: !!jobData.jobRequirements,
      hasResponsibilities: !!jobData.jobResponsibilities,
      hasBenefits: !!jobData.jobBenefits,
      salary: jobData.salary,
      jobType: jobData.jobType,
      experienceLevel: jobData.experienceLevel,
      remoteWork: jobData.remoteWork,
      technologies: jobData.technologies?.length || 0,
      skills: jobData.skills?.length || 0
    });
    
    // Enhanced validation with fallbacks
    if (!jobData.jobTitle || jobData.jobTitle === 'Untitled Job') {
      console.log("🚀 JobSchedule: Job title not found, trying fallback extraction");
      // Try to extract from page title or URL
      const pageTitle = document.title;
      if (pageTitle && pageTitle.includes('|')) {
        const titlePart = pageTitle.split('|')[0].trim();
        if (titlePart && titlePart.length > 0) {
          jobData.jobTitle = titlePart;
          console.log("🚀 JobSchedule: Using page title as job title:", titlePart);
        }
      }
    }
    
    if (!jobData.company || jobData.company === 'Unknown Company') {
      console.log("🚀 JobSchedule: Company not found, trying fallback extraction");
      // Try to extract from page title or URL
      const pageTitle = document.title;
      if (pageTitle && pageTitle.includes('|')) {
        const parts = pageTitle.split('|');
        if (parts.length > 1) {
          const companyPart = parts[1].trim();
          if (companyPart && companyPart.length > 0) {
            jobData.company = companyPart;
            console.log("🚀 JobSchedule: Using page title as company:", companyPart);
          }
        }
      }
    }
    
    if (!jobData.jobTitle || !jobData.company) {
      console.log("🚀 JobSchedule: Job data still not found after fallbacks");
      console.log("🚀 JobSchedule: Page title:", document.title);
      console.log("🚀 JobSchedule: Current URL:", window.location.href);
      return null;
    }

    // Create a unique job identifier to prevent duplicates
    const jobUrl = window.location.href;
    const jobIdentifier = `${jobData.jobTitle}-${jobData.company}-${jobData.location || 'Remote'}-${jobUrl}`;
    
    // Check if we're already processing this job
    if (currentJobIdentifier === jobIdentifier) {
      console.log("🚀 JobSchedule: Already processing this job, skipping:", jobIdentifier);
      return null;
    }
    
    // Check if this job has already been processed
    if (processedJobs.has(jobIdentifier)) {
      console.log("🚀 JobSchedule: Job already processed, skipping:", jobIdentifier);
      return null;
    }

    // Set current job identifier to prevent concurrent processing
    currentJobIdentifier = jobIdentifier;
    console.log("🚀 JobSchedule: Processing job:", jobIdentifier);
    
    // Also add to processed jobs immediately to prevent race conditions
    processedJobs.add(jobIdentifier);
    
    // Clean up processed jobs set to prevent memory issues (keep only last 50)
    if (processedJobs.size > 50) {
      const jobsArray = Array.from(processedJobs);
      processedJobs.clear();
      jobsArray.slice(-25).forEach(job => processedJobs.add(job));
      console.log("🚀 JobSchedule: Cleaned up processed jobs set, kept last 25");
    }

    // Mark this job as processed to prevent duplicates
    currentJobIdentifier = null; // Clear current job identifier
    
    return jobData;
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error extracting job data:", error);
    currentJobIdentifier = null; // Clear current job identifier on error
    return null;
  }
}

// Create track button
function createTrackButton() {
  try {
    // Remove existing button
    if (trackButton) {
      trackButton.remove();
    }

    // Find apply button with multiple selectors - Updated for current LinkedIn structure
    const applyButtonSelectors = [
      // Primary apply button selectors
      'button[data-control-name="jobdetails_topcard_inapply"]',
      'button[aria-label*="Apply"]',
      'button[aria-label*="apply"]',
      '.jobs-apply-button',
      '.jobs-s-apply-button',
      // Alternative selectors
      '.artdeco-button--primary',
      'button[data-control-name="jobdetails_topcard_inapply"]',
      // New LinkedIn selectors
      '[data-control-name="jobdetails_topcard_inapply"]',
      'button[data-control-name="jobdetails_topcard_inapply"]',
      // Fallback selectors
      'button:contains("Apply")',
      'button:contains("apply")',
      '[class*="apply"]',
      '[class*="Apply"]'
    ];
    
    let applyButton = null;
    
    // Try to find the apply button
    for (const selector of applyButtonSelectors) {
      applyButton = document.querySelector(selector);
      if (applyButton) {
        console.log("🚀 JobSchedule: Found apply button with selector:", selector);
        break;
      }
    }
    
    if (!applyButton) {
      console.log("🚀 JobSchedule: Apply button not found, using fixed positioning");
      createFixedTrackButton();
      return;
    }

    // Create track button
    trackButton = document.createElement('button');
    trackButton.id = 'jobschedule-track-button';
    trackButton.innerHTML = '📋 Track Job';
    trackButton.style.cssText = `
      background: #0077b5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      margin-left: 8px;
      display: inline-block;
      vertical-align: middle;
    `;

    // Add click handler
    trackButton.addEventListener('click', handleTrackJobClick);
    
    // Insert next to apply button
    applyButton.parentNode.insertBefore(trackButton, applyButton.nextSibling);
    console.log("🚀 JobSchedule: Track button created next to apply button");
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error creating track button:", error);
    createFixedTrackButton();
  }
}

// Create fixed position track button
function createFixedTrackButton() {
  trackButton = document.createElement('button');
  trackButton.id = 'jobschedule-track-button';
  trackButton.innerHTML = '📋 Track Job';
  trackButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0077b5;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 20px;
    cursor: pointer;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  trackButton.addEventListener('click', handleTrackJobClick);
  document.body.appendChild(trackButton);
  console.log("🚀 JobSchedule: Fixed track button created");
}

// Handle track job click
function handleTrackJobClick() {
  // Prevent duplicate clicks with timeout
  if (isProcessingClick) {
    console.log("🚀 JobSchedule: Click already being processed, ignoring");
    return;
  }
  
  // Clear any existing timeout
  if (clickTimeout) {
    clearTimeout(clickTimeout);
  }
  
  isProcessingClick = true;
  console.log("🚀 JobSchedule: Track job button clicked");
  
  // Set a timeout to reset the processing flag
  clickTimeout = setTimeout(() => {
    isProcessingClick = false;
    clickTimeout = null;
  }, 10000); // 10 second timeout
  
  // Extract job data when button is clicked
  const jobData = extractJobData();
  
  if (!jobData) {
    console.error("🚀 JobSchedule: Could not extract job data");
    showNotification("Could not extract job data", "error");
    isProcessingClick = false;
    return;
  }

  try {
    chrome.runtime.sendMessage({
      action: 'trackJobApplication',
      jobData: jobData
    }, function(response) {
      // Reset processing flag and clear timeout
      isProcessingClick = false;
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      
      if (chrome.runtime.lastError) {
        console.error("🚀 JobSchedule: Extension context error:", chrome.runtime.lastError);
        showNotification("Extension error - please refresh the page", "error");
        trackButton.innerHTML = '❌ Error';
        trackButton.style.background = '#dc3545';
        setTimeout(() => {
          trackButton.innerHTML = '📋 Track Job';
          trackButton.style.background = '#0077b5';
        }, 2000);
        return;
      }
      
      if (response && response.success) {
        console.log("🚀 JobSchedule: Job tracked successfully");
        showNotification("Job tracked successfully!", "success");
        trackButton.innerHTML = '✅ Tracked';
        trackButton.style.background = '#28a745';
        setTimeout(() => {
          if (trackButton) trackButton.remove();
        }, 2000);
      } else if (response && response.message && response.message.includes("already tracked")) {
        console.log("🚀 JobSchedule: Job already tracked:", response.message);
        showNotification("Job already tracked!", "info");
        trackButton.innerHTML = '✅ Already Tracked';
        trackButton.style.background = '#28a745';
        setTimeout(() => {
          if (trackButton) trackButton.remove();
        }, 2000);
      } else {
        console.error("🚀 JobSchedule: Failed to track job:", response);
        showNotification("Failed to track job", "error");
        trackButton.innerHTML = '❌ Failed';
        trackButton.style.background = '#dc3545';
        setTimeout(() => {
          trackButton.innerHTML = '📋 Track Job';
          trackButton.style.background = '#0077b5';
        }, 2000);
      }
    });
  } catch (error) {
    console.error("🚀 JobSchedule: Extension context invalidated:", error);
    isProcessingClick = false;
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
    showNotification("Extension error - please refresh the page", "error");
    trackButton.innerHTML = '❌ Error';
    trackButton.style.background = '#dc3545';
    setTimeout(() => {
      trackButton.innerHTML = '📋 Track Job';
      trackButton.style.background = '#0077b5';
    }, 2000);
  }
}

// Set up apply button monitoring with improved detection and duplicate prevention
function setupApplyButtonMonitoring() {
  try {
    // Wait a bit for the page to fully load
    setTimeout(() => {
      // Check if we're on a new job page
      const currentUrl = window.location.href;
      if (lastProcessedUrl === currentUrl) {
        console.log("🚀 JobSchedule: Already processed this URL, skipping");
        return;
      }
      
      // Try multiple selectors for apply button - Updated for current LinkedIn structure
      const applyButtonSelectors = [
        // Primary apply button selectors
        'button[data-control-name="jobdetails_topcard_inapply"]',
        'button[aria-label*="Apply"]',
        'button[aria-label*="apply"]',
        '.jobs-apply-button',
        '.jobs-s-apply-button',
        // Alternative selectors
        '.artdeco-button--primary',
        'button[data-control-name="jobdetails_topcard_inapply"]',
        // New LinkedIn selectors
        '[data-control-name="jobdetails_topcard_inapply"]',
        'button[data-control-name="jobdetails_topcard_inapply"]',
        // Fallback selectors
        'button:contains("Apply")',
        'button:contains("apply")',
        '[class*="apply"]',
        '[class*="Apply"]'
      ];
      
      let applyButton = null;
      
      // Try to find the apply button
      for (const selector of applyButtonSelectors) {
        applyButton = document.querySelector(selector);
        if (applyButton) {
          console.log("🚀 JobSchedule: Found apply button with selector:", selector);
          break;
        }
      }
      
      if (!applyButton) {
        console.log("🚀 JobSchedule: Apply button not found for monitoring");
        return;
      }

      // Remove any existing event listeners to prevent duplicates
      const newApplyButton = applyButton.cloneNode(true);
      applyButton.parentNode.replaceChild(newApplyButton, applyButton);
      applyButton = newApplyButton;

              // Monitor for apply button clicks with debouncing
        applyButton.addEventListener('click', function() {
          // Prevent duplicate clicks
          if (isProcessingClick) {
            console.log("🚀 JobSchedule: Click already being processed, ignoring");
            return;
          }
          
          // Clear any existing timeout
          if (clickTimeout) {
            clearTimeout(clickTimeout);
          }
          
          isProcessingClick = true;
          lastProcessedUrl = currentUrl;
          console.log("🚀 JobSchedule: Apply button clicked for URL:", currentUrl);
          
          // Set a timeout to reset the processing flag
          clickTimeout = setTimeout(() => {
            isProcessingClick = false;
            clickTimeout = null;
          }, 10000); // 10 second timeout
        
        // Extract job data when apply button is clicked
        const jobData = extractJobData();
        
        if (!jobData) {
          console.error("🚀 JobSchedule: Could not extract job data for apply tracking");
          isProcessingClick = false;
          return;
        }

        console.log("🚀 JobSchedule: Extracted job data for tracking:", {
          jobTitle: jobData.jobTitle,
          company: jobData.company,
          jobUrl: jobData.jobUrl,
          hasLogo: !!jobData.logoUrl,
          descriptionLength: jobData.description?.length || 0,
          detailedDescriptionLength: jobData.detailedDescription?.length || 0,
          jobRequirementsLength: jobData.jobRequirements?.length || 0,
          jobResponsibilitiesLength: jobData.jobResponsibilities?.length || 0,
          jobBenefitsLength: jobData.jobBenefits?.length || 0
        });

        // Track the job application
        chrome.runtime.sendMessage({
          action: 'trackJobApplication',
          jobData: {
            ...jobData,
            applied: true,
            appliedAt: new Date().toISOString()
          }
        }, function(response) {
          // Reset processing flag and clear timeout
          isProcessingClick = false;
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          
          if (response && response.success) {
            console.log("🚀 JobSchedule: Job application tracked successfully");
            showNotification("Job application tracked!", "success");
          } else if (response && response.message && response.message.includes("already tracked")) {
            console.log("🚀 JobSchedule: Job already tracked:", response.message);
            showNotification("Job already tracked!", "info");
          } else {
            console.error("🚀 JobSchedule: Failed to track job application:", response);
            showNotification("Failed to track application", "error");
          }
        });
      });
      
      console.log("🚀 JobSchedule: Apply button monitoring set up for URL:", currentUrl);
      
    }, 1000); // Wait 1 second for page to load
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error setting up apply button monitoring:", error);
  }
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#0077b5"};
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  notification.innerHTML = `<strong>JobSchedule</strong><br>${message}`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Monitor for page changes (LinkedIn SPA)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    const newUrl = window.location.href;
    console.log("🚀 JobSchedule: URL changed from", currentUrl, "to", newUrl);
    
    // Clear current job identifier when changing pages
    currentJobIdentifier = null;
    
    // Remove track button when leaving job page
    if (trackButton) {
      trackButton.remove();
      trackButton = null;
    }
    
    // Update current URL
    currentUrl = newUrl;
    
    // Initialize tracking on new job page
    if (currentUrl.includes('linkedin.com/jobs/')) {
      // Clear initialization flag for new page
      isInitializing = false;
      setTimeout(initializeJobTracking, 1000);
    }
  }
}, 1000);

// Initialize on page load
if (window.location.href.includes('linkedin.com/jobs/')) {
  initializeJobTracking();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  currentJobIdentifier = null;
  isInitializing = false;
  if (trackButton) {
    trackButton.remove();
    trackButton = null;
  }
});

console.log("🚀 JobSchedule: Content script initialized"); 