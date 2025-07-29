// JobSchedule LinkedIn Content Script
console.log("🚀 JobSchedule: Content script loaded");

// Global variables
let currentJobData = null;
let trackButton = null;

// Main function to initialize job tracking
function initializeJobTracking() {
  try {
    // Only run on LinkedIn job pages
    if (!window.location.href.includes('linkedin.com/jobs/')) {
      return;
    }

    // Prevent multiple initializations for the same URL
    const currentUrl = window.location.href;
    if (initializedUrls.has(currentUrl)) {
      console.log("🚀 JobSchedule: Already initialized for this URL, skipping");
      return;
    }

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
    }, 2000);
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error initializing job tracking:", error);
  }
}

// Extract job data when needed
function extractJobData() {
  try {
    console.log("🚀 JobSchedule: Starting job data extraction for URL:", window.location.href);
    
    // Extract basic job information
    const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim();
    const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim();
    const location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim();
    
    console.log("🚀 JobSchedule: Basic job info extracted:", {
      jobTitle: jobTitle?.substring(0, 50),
      company: company?.substring(0, 50),
      location: location?.substring(0, 50)
    });
    
    if (!jobTitle || !company) {
      console.log("🚀 JobSchedule: Job data not found");
      return null;
    }

    // Extract additional data
    const jobUrl = window.location.href;
    
    // Get full job description with better structure
    const descriptionElement = document.querySelector('.jobs-description__content');
    let description = descriptionElement?.textContent?.trim() || '';
    
    // Get detailed job sections with better formatting
    const jobDetails = document.querySelector('.jobs-description__content');
    let detailedDescription = jobDetails?.textContent?.trim() || '';
    
    // Try to get structured job description sections with more titles
    const jobDescriptionSections = {
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
    
    // Look for structured sections with more comprehensive matching
    const sections = document.querySelectorAll('.jobs-description__content h3, .jobs-description__content h4, .jobs-description__content strong, .jobs-description__content h2, .jobs-description__content p strong');
    sections.forEach(section => {
      const sectionText = section.textContent?.toLowerCase() || '';
      let content = '';
      
      // Get content from next sibling or parent
      const nextElement = section.nextElementSibling;
      if (nextElement) {
        content = nextElement.textContent?.trim() || '';
      } else {
        // If no next sibling, get content from parent
        const parent = section.parentElement;
        if (parent) {
          content = parent.textContent?.replace(sectionText, '').trim() || '';
        }
      }
      
      if (sectionText.includes('about') || sectionText.includes('description') || sectionText.includes('overview')) {
        jobDescriptionSections.about = content;
      } else if (sectionText.includes('responsibility') || sectionText.includes('duties') || sectionText.includes('what you\'ll do')) {
        jobDescriptionSections.responsibilities = content;
      } else if (sectionText.includes('requirement') || sectionText.includes('qualification') || sectionText.includes('what you\'ll bring')) {
        jobDescriptionSections.requirements = content;
      } else if (sectionText.includes('benefit') || sectionText.includes('perk') || sectionText.includes('compensation')) {
        jobDescriptionSections.benefits = content;
      } else if (sectionText.includes('education') || sectionText.includes('degree')) {
        jobDescriptionSections.education = content;
      } else if (sectionText.includes('skill') || sectionText.includes('technology')) {
        jobDescriptionSections.skills = content;
      } else if (sectionText.includes('experience') || sectionText.includes('background')) {
        jobDescriptionSections.experience = content;
      } else if (sectionText.includes('salary') || sectionText.includes('pay') || sectionText.includes('compensation')) {
        jobDescriptionSections.compensation = content;
      } else if (sectionText.includes('work environment') || sectionText.includes('remote') || sectionText.includes('hybrid')) {
        jobDescriptionSections.workEnvironment = content;
      } else if (sectionText.includes('culture') || sectionText.includes('values') || sectionText.includes('mission')) {
        jobDescriptionSections.companyCulture = content;
      } else if (sectionText.includes('growth') || sectionText.includes('career') || sectionText.includes('development')) {
        jobDescriptionSections.growthOpportunities = content;
      } else if (sectionText.includes('application') || sectionText.includes('apply') || sectionText.includes('process')) {
        jobDescriptionSections.applicationProcess = content;
      } else if (sectionText.includes('additional') || sectionText.includes('note') || sectionText.includes('other')) {
        jobDescriptionSections.additionalInfo = content;
      } else if (sectionText.includes('purpose')) {
        jobDescriptionSections.purpose = content;
      } else if (sectionText.includes('accountability')) {
        jobDescriptionSections.accountability = content;
      } else if (sectionText.includes('main activities')) {
        jobDescriptionSections.mainActivities = content;
      } else if (sectionText.includes('knowledge') || sectionText.includes('skill requirements')) {
        jobDescriptionSections.knowledgeRequirements = content;
      } else if (sectionText.includes('soft skills')) {
        jobDescriptionSections.softSkills = content;
      } else if (sectionText.includes('complexities') || sectionText.includes('thinking challenges')) {
        jobDescriptionSections.jobComplexities = content;
      } else if (sectionText.includes('what we offer') || sectionText.includes('benefits')) {
        jobDescriptionSections.whatWeOffer = content;
      }
    });
    
    // Create structured description with better organization
    const structuredDescription = Object.entries(jobDescriptionSections)
      .filter(([_, content]) => content.length > 0)
      .map(([section, content]) => {
        const title = section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1');
        return `**${title}:**\n${content}`;
      })
      .join('\n\n');
    
    if (structuredDescription) {
      detailedDescription = structuredDescription;
    }
    
    // Job requirements and responsibilities - use proper CSS selectors
    const requirementsElement = document.querySelector('[data-section="job-requirements"]');
    const jobRequirements = requirementsElement?.textContent?.trim() || '';
    
    const responsibilitiesElement = document.querySelector('[data-section="job-responsibilities"]');
    const jobResponsibilities = responsibilitiesElement?.textContent?.trim() || '';
    
    // Job benefits
    const benefitsElement = document.querySelector('[data-section="job-benefits"]');
    const jobBenefits = benefitsElement?.textContent?.trim() || '';
    
    // Company logo - try multiple selectors with improved detection
    let logoUrl = null;
    const logoSelectors = [
      // Most specific selectors first
      '.job-details-jobs-unified-top-card__company-logo img',
      '.jobs-unified-top-card__company-logo img',
      '.jobs-unified-top-card__company-logo-image img',
      '[data-test-id="company-logo"] img',
      // Company-specific logo containers
      '.job-details-jobs-unified-top-card__company-logo',
      '.jobs-unified-top-card__company-logo',
      '.jobs-unified-top-card__company-logo-image',
      '[data-test-id="company-logo"]',
      // SVG logos
      '.job-details-jobs-unified-top-card__company-logo svg image',
      '.jobs-unified-top-card__company-logo svg image',
      '.job-details-jobs-unified-top-card__company-logo svg',
      '.jobs-unified-top-card__company-logo svg',
      // Fallback selectors (more specific)
      '.jobs-box__company-logo img',
      '.jobs-company-logo img',
      '.company-logo img',
      '.logo img',
      // Only use these if no company-specific logo found
      'img[alt*="logo"][src*="company"]',
      'img[alt*="Logo"][src*="company"]',
      'img[alt*="company"]',
      'img[alt*="Company"]'
    ];
    
    for (const selector of logoSelectors) {
      const logoElement = document.querySelector(selector);
      if (logoElement) {
        if (logoElement.tagName === 'IMG') {
          logoUrl = logoElement.src;
          console.log("🚀 JobSchedule: Found logo with selector:", selector, logoUrl);
          break;
        } else if (logoElement.tagName === 'SVG') {
          const imageElement = logoElement.querySelector('image');
          if (imageElement) {
            logoUrl = imageElement.getAttribute('href') || imageElement.getAttribute('xlink:href');
            console.log("🚀 JobSchedule: Found logo with SVG selector:", selector, logoUrl);
            break;
          }
        } else if (logoElement.style.backgroundImage) {
          // Extract URL from background-image style
          const bgImage = logoElement.style.backgroundImage;
          const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch) {
            logoUrl = urlMatch[1];
            console.log("🚀 JobSchedule: Found logo with background-image:", selector, logoUrl);
            break;
          }
        }
      }
    }
    
    // Additional debugging for logo extraction
    console.log("🚀 JobSchedule: Final logo URL for company:", company, "Logo URL:", logoUrl);
    if (!logoUrl) {
      console.log("🚀 JobSchedule: No logo found for company:", company);
      // Try to find any image that might be a logo
      const allImages = document.querySelectorAll('img');
      console.log("🚀 JobSchedule: Found", allImages.length, "images on page");
      allImages.forEach((img, index) => {
        console.log(`🚀 JobSchedule: Image ${index}:`, {
          src: img.src,
          alt: img.alt,
          className: img.className,
          id: img.id
        });
      });
    }
    
    // Validate that the logo URL is appropriate for the company
    if (logoUrl) {
      // Check if the logo URL contains the company name (case insensitive)
      const companyNameLower = company.toLowerCase();
      const logoUrlLower = logoUrl.toLowerCase();
      
      // Only validate if it's clearly a generic logo
      const isGenericLogo = logoUrlLower.includes('default') || 
                           logoUrlLower.includes('placeholder') ||
                           logoUrlLower.includes('generic') ||
                           logoUrlLower.includes('soti') ||
                           (logoUrlLower.includes('coinbase') && !company.toLowerCase().includes('coinbase'));
      
      if (isGenericLogo) {
        console.log("🚀 JobSchedule: Generic logo detected, setting to null");
        console.log("🚀 JobSchedule: Company:", company, "Logo URL:", logoUrl);
        logoUrl = null;
      } else {
        console.log("🚀 JobSchedule: Valid logo found for company:", company);
      }
    }
    
    // Ensure we don't use a generic/default logo
    if (logoUrl && (logoUrl.includes('default') || logoUrl.includes('placeholder') || logoUrl.includes('generic'))) {
      console.log("🚀 JobSchedule: Detected generic logo, setting to null");
      logoUrl = null;
    }

    const jobData = {
      jobTitle,
      company,
      location: location || 'Remote',
      jobUrl,
      description: description.substring(0, 2000),
      detailedDescription: detailedDescription.substring(0, 5000),
      jobRequirements: jobRequirements.substring(0, 3000),
      jobResponsibilities: jobResponsibilities.substring(0, 3000),
      jobBenefits: jobBenefits.substring(0, 2000),
      logoUrl,
      source: 'linkedin'
    };

    console.log("🚀 JobSchedule: Job data extracted:", jobData);
    return jobData;
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error extracting job data:", error);
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

    // Find apply button with multiple selectors
    const applyButtonSelectors = [
      '.jobs-apply-button',
      '.jobs-s-apply-button',
      '[data-control-name="jobdetails_topcard_inapply"]',
      'button[aria-label*="Apply"]',
      'button[aria-label*="apply"]',
      '.artdeco-button--primary'
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
  // Prevent duplicate clicks
  if (isProcessingClick) {
    console.log("🚀 JobSchedule: Click already being processed, ignoring");
    return;
  }
  
  isProcessingClick = true;
  console.log("🚀 JobSchedule: Track job button clicked");
  
  // Extract job data when button is clicked
  const jobData = extractJobData();
  
  if (!jobData) {
    console.error("🚀 JobSchedule: Could not extract job data");
    showNotification("Could not extract job data", "error");
    isProcessingClick = false;
    return;
  }

  chrome.runtime.sendMessage({
    action: 'trackJobApplication',
    jobData: jobData
  }, function(response) {
    // Reset processing flag
    isProcessingClick = false;
    
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
}

// Global variables to prevent duplicate clicks and track initialization
let isProcessingClick = false;
let lastProcessedUrl = null;
let initializedUrls = new Set();

// Set up apply button monitoring with improved detection
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
      
      // Try multiple selectors for apply button
      const applyButtonSelectors = [
        '.jobs-apply-button',
        '.jobs-s-apply-button',
        '[data-control-name="jobdetails_topcard_inapply"]',
        'button[aria-label*="Apply"]',
        'button[aria-label*="apply"]',
        '.artdeco-button--primary',
        'button[data-control-name="jobdetails_topcard_inapply"]'
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
        
        isProcessingClick = true;
        lastProcessedUrl = currentUrl;
        console.log("🚀 JobSchedule: Apply button clicked for URL:", currentUrl);
        
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
          // Reset processing flag
          isProcessingClick = false;
          
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
    currentUrl = window.location.href;
    
    // Remove track button when leaving job page
    if (trackButton) {
      trackButton.remove();
      trackButton = null;
    }
    
    // Initialize tracking on new job page
    if (currentUrl.includes('linkedin.com/jobs/')) {
      setTimeout(initializeJobTracking, 1000);
    }
  }
}, 1000);

// Initialize on page load
if (window.location.href.includes('linkedin.com/jobs/')) {
  initializeJobTracking();
}

console.log("🚀 JobSchedule: Content script initialized"); 