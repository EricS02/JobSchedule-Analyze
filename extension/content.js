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

    console.log("🚀 JobSchedule: LinkedIn job page detected");
    
    // Wait for page to load completely, then create track button
    setTimeout(() => {
      createTrackButton();
      setupApplyButtonMonitoring();
    }, 2000);
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error initializing job tracking:", error);
  }
}

// Extract job data when needed
function extractJobData() {
  try {
    // Extract basic job information
    const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim();
    const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim();
    const location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim();
    
    if (!jobTitle || !company) {
      console.log("🚀 JobSchedule: Job data not found");
      return null;
    }

    // Extract additional data
    const jobUrl = window.location.href;
    
    // Get full job description
    const descriptionElement = document.querySelector('.jobs-description__content');
    const description = descriptionElement?.textContent?.trim() || '';
    
    // Get detailed job sections
    const jobDetails = document.querySelector('.jobs-description__content');
    const detailedDescription = jobDetails?.textContent?.trim() || '';
    
    // Job requirements and responsibilities
    const requirementsElement = document.querySelector('[data-section="job-requirements"], .jobs-box__group:contains("Requirements")');
    const jobRequirements = requirementsElement?.textContent?.trim() || '';
    
    const responsibilitiesElement = document.querySelector('[data-section="job-responsibilities"], .jobs-box__group:contains("Responsibilities")');
    const jobResponsibilities = responsibilitiesElement?.textContent?.trim() || '';
    
    // Job benefits
    const benefitsElement = document.querySelector('[data-section="job-benefits"], .jobs-box__group:contains("Benefits")');
    const jobBenefits = benefitsElement?.textContent?.trim() || '';
    
    // Company logo - try multiple selectors
    let logoUrl = null;
    const logoSelectors = [
      '.job-details-jobs-unified-top-card__company-logo img',
      '.job-details-jobs-unified-top-card__company-logo svg image',
      '.job-details-jobs-unified-top-card__company-logo svg',
      '.job-details-jobs-unified-top-card__company-logo',
      '.jobs-unified-top-card__company-logo img',
      '.jobs-unified-top-card__company-logo svg'
    ];
    
    for (const selector of logoSelectors) {
      const logoElement = document.querySelector(selector);
      if (logoElement) {
        if (logoElement.tagName === 'IMG') {
          logoUrl = logoElement.src;
        } else if (logoElement.tagName === 'SVG') {
          const imageElement = logoElement.querySelector('image');
          if (imageElement) {
            logoUrl = imageElement.getAttribute('href') || imageElement.getAttribute('xlink:href');
          }
        }
        if (logoUrl) {
          console.log("🚀 JobSchedule: Found logo with selector:", selector);
          break;
        }
      }
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
      border-radius: 4px;
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
    border-radius: 5px;
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
  console.log("🚀 JobSchedule: Track job button clicked");
  
  // Extract job data when button is clicked
  const jobData = extractJobData();
  
  if (!jobData) {
    console.error("🚀 JobSchedule: Could not extract job data");
    showNotification("Could not extract job data", "error");
    return;
  }

  chrome.runtime.sendMessage({
    action: 'trackJobApplication',
    jobData: jobData
  }, function(response) {
    if (response && response.success) {
      console.log("🚀 JobSchedule: Job tracked successfully");
      showNotification("Job tracked successfully!", "success");
      trackButton.innerHTML = '✅ Tracked';
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

// Set up apply button monitoring with improved detection
function setupApplyButtonMonitoring() {
  try {
    // Wait a bit for the page to fully load
    setTimeout(() => {
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

      // Monitor for apply button clicks
      applyButton.addEventListener('click', function() {
        console.log("🚀 JobSchedule: Apply button clicked!");
        
        // Extract job data when apply button is clicked
        const jobData = extractJobData();
        
        if (!jobData) {
          console.error("🚀 JobSchedule: Could not extract job data for apply tracking");
          return;
        }

        // Track the job application
        chrome.runtime.sendMessage({
          action: 'trackJobApplication',
          jobData: {
            ...jobData,
            applied: true,
            appliedAt: new Date().toISOString()
          }
        }, function(response) {
          if (response && response.success) {
            console.log("🚀 JobSchedule: Job application tracked successfully");
            showNotification("Job application tracked!", "success");
          } else {
            console.error("🚀 JobSchedule: Failed to track job application:", response);
            showNotification("Failed to track application", "error");
          }
        });
      });
      
      console.log("🚀 JobSchedule: Apply button monitoring set up");
      
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