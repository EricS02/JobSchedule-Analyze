// JobSchedule Content Script - Simplified and Robust Version
console.log("JobSchedule: Content script starting...");

// Global tracking state
let isTrackingJob = false;
let trackingStartTime = null;

// Expose debug functions globally immediately
window.resetJobSyncTracking = function() {
  console.log("JobSync: Manual reset called from window");
  stopTracking();
  console.log("JobSync: Tracking state reset to:", isTrackingJob);
};

window.debugJobSyncState = function() {
  console.log("JobSync: Debug state:", {
    isTrackingJob: isTrackingJob,
    trackingStartTime: trackingStartTime,
    elapsedTime: trackingStartTime ? Date.now() - trackingStartTime : null,
    currentUrl: window.location.href,
    isLinkedInJobPage: isLinkedInJobPage(),
    extensionLoaded: true
  });
};

window.testJobSyncExtension = function() {
  console.log("JobSync: Testing extension functionality...");
  console.log("JobSync: Extension loaded:", window.jobSyncExtensionLoaded);
  console.log("JobSync: Tracking state:", isTrackingJob);
  console.log("JobSync: Tracking start time:", trackingStartTime);
  console.log("JobSync: Current URL:", window.location.href);
  console.log("JobSync: Is LinkedIn job page:", isLinkedInJobPage());
  
  // Test if we can extract job details
  const jobData = extractJobDetails();
  console.log("JobSync: Can extract job details:", !!jobData);
  if (jobData) {
    console.log("JobSync: Job title:", jobData.jobTitle);
    console.log("JobSync: Company:", jobData.company);
  }
  
  return {
    extensionLoaded: window.jobSyncExtensionLoaded,
    isTrackingJob: isTrackingJob,
    trackingStartTime: trackingStartTime,
    isLinkedInJobPage: isLinkedInJobPage(),
    canExtractJobDetails: !!jobData,
    jobData: jobData
  };
};

window.forceResetJobSync = function() {
  console.log("JobSync: Force reset called");
  stopTracking();
  console.log("JobSync: Force reset complete - tracking state:", isTrackingJob);
  return { success: true, trackingState: isTrackingJob };
};

// Add a global indicator that the extension is loaded
window.jobSyncExtensionLoaded = true;

// Simple function to check if we're on a LinkedIn job page
function isLinkedInJobPage() {
  return window.location.href.includes('linkedin.com/jobs/') || 
         window.location.href.includes('linkedin.com/job/');
}

// Enhanced job details extraction
  function extractJobDetails() {
  console.log("JobSync: Starting job details extraction...");
  
  try {
    // Get job title
    let jobTitle = 'Unknown Position';
    const titleSelectors = [
        '.job-details-jobs-unified-top-card__job-title',
        '.topcard__title',
        'h1.t-24',
        'h1.job-title',
      '.job-details-jobs-unified-top-card__job-title-link',
      'h1'
      ];
      
    for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          jobTitle = element.textContent.trim();
        console.log("JobSync: Found job title:", jobTitle);
          break;
        }
      }
      
    // Get company name
    let company = 'Unknown Company';
      const companySelectors = [
        '.job-details-jobs-unified-top-card__company-name',
        '.topcard__org-name-link',
        'a.company-name',
        'span.company-name',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
      '[data-test-company-name]'
      ];
      
      for (const selector of companySelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          company = element.textContent.trim();
        console.log("JobSync: Found company:", company);
        break;
      }
    }
    
    // Get workplace type (Remote, Hybrid, On-site)
    let workplaceType = 'Remote';
    const workplaceSelectors = [
      '.artdeco-button.artdeco-button--secondary.artdeco-button--muted',
      '.job-details-jobs-unified-top-card__workplace-type',
      '.workplace-type',
      '[data-test-workplace-type]',
      '.tvm__text.tvm__text--low-emphasis',
      '.jobs-unified-top-card__workplace-type'
    ];
    
    for (const selector of workplaceSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent.trim().toLowerCase();
        if (text.includes('remote') || text.includes('hybrid') || text.includes('on-site') || text.includes('onsite')) {
          // Extract just the workplace type, not the full text
          let extractedType = 'Remote';
          if (text.includes('hybrid')) {
            extractedType = 'Hybrid';
          } else if (text.includes('on-site') || text.includes('onsite')) {
            extractedType = 'On-site';
          } else if (text.includes('remote')) {
            extractedType = 'Remote';
          }
          workplaceType = extractedType;
          console.log("JobSync: Found workplace type:", workplaceType, "from text:", element.textContent.trim());
          break;
        }
      }
      if (workplaceType !== 'Remote') break;
      }
      
    // Get actual location
    let actualLocation = '';
      const locationSelectors = [
        '.job-details-jobs-unified-top-card__bullet',
        '.topcard__flavor--bullet',
        '.location',
        'span.tvm__text.tvm__text--low-emphasis',
      '.jobs-unified-top-card__bullet',
      '.lzUcjArWNaoJCSCaGJUmKllaCPmZs' // Specific class you mentioned
      ];
      
      for (const selector of locationSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent.trim();
        if (text && 
            !text.toLowerCase().includes('remote') && 
            !text.toLowerCase().includes('hybrid') && 
            !text.toLowerCase().includes('on-site') && 
            !text.toLowerCase().includes('onsite') &&
            text.length > 2) {
          actualLocation = text;
          console.log("JobSync: Found location:", actualLocation);
          break;
        }
      }
      if (actualLocation) break;
    }
    
    // Try to extract from job title brackets
    if (!actualLocation) {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        const titleText = titleElement.textContent.trim();
        const bracketMatch = titleText.match(/\(([^)]+)\)/);
        if (bracketMatch) {
          actualLocation = bracketMatch[1].trim();
          console.log("JobSync: Extracted location from title:", actualLocation);
        }
      }
    }
    
    // Combine workplace type and location
    let location = workplaceType;
    if (actualLocation) {
      location = `${workplaceType} - ${actualLocation}`;
    }
    
    // Get company logo - improved to avoid duplication and get correct company logo
    let logoUrl = null;
    console.log("JobSync: Looking for logo for company:", company);
    
    // First, try to find the company name element and get logo from its parent/sibling
    const companyNameSelectors = [
      '.job-details-jobs-unified-top-card__company-name',
      '.topcard__org-name-link',
      'a.company-name',
      'span.company-name',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]'
    ];
    
    let companyElement = null;
    console.log("JobSync: Searching for company element with name:", company);
    for (const selector of companyNameSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`JobSync: Found ${elements.length} elements with selector: ${selector}`);
      for (const element of elements) {
        const text = element.textContent.trim();
        console.log(`JobSync: Element text: "${text}"`);
        if (text === company) {
          companyElement = element;
          console.log("JobSync: Found matching company element:", element);
          break;
        }
      }
      if (companyElement) break;
    }
    
    // If we found the company element, look for logo in its vicinity
    if (companyElement) {
      // Look for logo in the same container as company name
      let container = companyElement;
      for (let i = 0; i < 5; i++) { // Go up to 5 levels to find container
        container = container.parentElement;
        if (!container) break;
        
        const imgElements = container.querySelectorAll('img');
        for (const img of imgElements) {
          if (img && img.src && img.src !== '' && 
              !img.src.includes('placeholder') && 
              !img.src.includes('default') &&
              img.src.length > 10 &&
              img.src.includes('media.licdn.com')) {
            logoUrl = img.src;
            console.log("JobSync: Found logo near company element:", logoUrl);
              break;
            }
          }
        if (logoUrl) break;
        }
      }
      
    // If still no logo, try specific company logo selectors
    if (!logoUrl) {
      const logoSelectors = [
        '.jobs-unified-top-card__company-logo img',
        '.jobs-details-top-card__company-logo img',
        '.ivm-view-attr__img--centered.EntityPhoto-square-2.evi-image',
        '.ivm-view-attr__img--centered',
        '.artdeco-entity-image'
      ];
      
      for (const selector of logoSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (element && element.src && element.src !== '' && 
              !element.src.includes('placeholder') && 
              !element.src.includes('default') &&
              element.src.length > 10 &&
              element.src.includes('media.licdn.com')) {
            logoUrl = element.src;
            console.log("JobSync: Found logo with specific selector:", logoUrl);
            break;
          }
        }
        if (logoUrl) break;
      }
    }
    
    // If still no logo, try to find any LinkedIn company logo
    if (!logoUrl) {
      const allImages = document.querySelectorAll('img');
      for (const img of allImages) {
        if (img && img.src && img.src !== '' && 
            img.src.includes('media.licdn.com') &&
            img.src.includes('company-logo') &&
            !img.src.includes('placeholder') && 
            !img.src.includes('default') &&
            img.src.length > 10) {
          logoUrl = img.src;
          console.log("JobSync: Found logo with general search:", logoUrl);
          break;
        }
      }
    }
    
    // Store the original logo URL without modification
    if (logoUrl) {
      console.log("JobSync: Found logo URL:", logoUrl);
      // Don't modify the LinkedIn URL - it needs to stay as-is for the CDN to work
    } else {
      console.log("JobSync: No logo found for company:", company);
    }
    
    // Get detailed job description with enhanced extraction
    let description = 'No description available';
    let detailedDescription = '';
    
    // Enhanced selectors including the specific class you mentioned
    const descSelectors = [
      '.jobs-box__html-content.hhhTJWBgTGWXXtNuWBlvjxJdFCWHjxquA.t-14.t-normal.jobs-description-content__text--stretch',
      '.jobs-description__content',
      '.description__text',
      '.job-description',
      '.jobs-description-content__text',
      '.jobs-description-content__text--stretch',
      '.jobs-box__html-content'
    ];
    
    for (const selector of descSelectors) {
      const element = document.querySelector(selector);
      if (element && element.innerHTML.trim()) {
        // Get the full detailed description as HTML
        detailedDescription = element.innerHTML.trim();
        // For the main description field, keep it concise (first 1000 chars of text)
        description = element.innerText.trim().substring(0, 1000);
        console.log("JobSync: Found detailed description with selector:", selector);
        console.log("JobSync: Description length:", detailedDescription.length);
        break;
      }
    }
    
    // If we found a detailed description, also extract structured information
    let jobRequirements = '';
    let jobResponsibilities = '';
    let jobBenefits = '';
    
    if (detailedDescription) {
      // Extract sections based on common patterns
      const lines = detailedDescription.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let currentSection = '';
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        // Identify sections
        if (lowerLine.includes('requirements') || lowerLine.includes('qualifications') || lowerLine.includes('skills')) {
          currentSection = 'requirements';
        } else if (lowerLine.includes('responsibilities') || lowerLine.includes('duties') || lowerLine.includes('what you\'ll do')) {
          currentSection = 'responsibilities';
        } else if (lowerLine.includes('benefits') || lowerLine.includes('perks') || lowerLine.includes('what we offer')) {
          currentSection = 'benefits';
        }
        
        // Add content to appropriate section
        if (currentSection === 'requirements' && !lowerLine.includes('requirements') && !lowerLine.includes('qualifications')) {
          jobRequirements += line + '\n';
        } else if (currentSection === 'responsibilities' && !lowerLine.includes('responsibilities') && !lowerLine.includes('duties')) {
          jobResponsibilities += line + '\n';
        } else if (currentSection === 'benefits' && !lowerLine.includes('benefits') && !lowerLine.includes('perks')) {
          jobBenefits += line + '\n';
        }
      }
      
      // Trim the sections
      jobRequirements = jobRequirements.trim();
      jobResponsibilities = jobResponsibilities.trim();
      jobBenefits = jobBenefits.trim();
    }
      
      // Get job URL
      const jobUrl = window.location.href;
      
      const jobData = {
        jobTitle,
        company,
        location,
        description,
        detailedDescription,
        jobRequirements,
        jobResponsibilities,
        jobBenefits,
        jobUrl,
        logoUrl,
        appliedDate: new Date().toISOString()
      };
      
    console.log("JobSync: Final extracted data:", jobData);
      return jobData;
    
    } catch (error) {
    console.error("JobSync: Error extracting job details:", error);
      return null;
    }
  }

// Function to send job data to background script
function sendJobData(jobData) {
  console.log("JobSync: Sending job data to background script...");
  
          chrome.runtime.sendMessage({
            action: 'trackJobApplication',
    jobData: jobData
          }, response => {
    console.log("JobSync: Background script response:", response);
    if (response && response.success) {
      showNotification('Job tracked successfully!');
    } else {
      showNotification('Error: ' + (response?.message || 'Failed to track job'), true);
    }
  });
}

  // Function to show notifications
  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isError ? '#F44336' : '#4CAF50'};
      color: white;
      padding: 15px;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
    notification.remove();
    }, 3000);
  }

// Function to add track button
function addTrackButton(retryCount = 0) {
  if (!isLinkedInJobPage()) {
    console.log("JobSync: Not a LinkedIn job page.");
    return;
  }

  // Remove existing button if any
  const existingButton = document.getElementById('track-job-button');
  if (existingButton) {
    console.log("JobSync: Removing existing track button.");
    existingButton.remove();
  }

  console.log("JobSync: Adding track button...");

  const applyButtonSelectors = [
    '.jobs-apply-button',
    '.jobs-s-apply',
    '.jobs-unified-top-card__apply-button',
    '.jobs-apply-button--top-card',
    '.jobs-details-top-card__actions'
  ];

  let container = null;
  for (const selector of applyButtonSelectors) {
    const element = document.querySelector(selector);
    console.log(`JobSync: Checking selector ${selector}, found:`, !!element);
    if (element) {
      container = element;
      break;
    }
  }

  if (container) {
    console.log("JobSync: Found container for track button:", container);
    const trackButton = document.createElement('button');
    trackButton.id = 'track-job-button';
    trackButton.className = 'artdeco-button artdeco-button--2 artdeco-button--secondary';
    trackButton.style.marginLeft = '8px';
    trackButton.innerHTML = '<span class="artdeco-button__text">Track with JobSchedule</span>';

    trackButton.addEventListener('click', (event) => {
      // Prevent event bubbling
      event.preventDefault();
      event.stopPropagation();
      
      console.log("JobSchedule: Track button clicked");
      
      // Prevent duplicate tracking
      if (isTrackingJob) {
        console.log("JobSchedule: Already tracking job, ignoring click");
        return;
      }
      
      startTracking(); // Use the new startTracking function
      const jobData = extractJobDetails();
      if (jobData) {
        sendJobData(jobData);
      } else {
        showNotification('Error: Could not extract job details', true);
        stopTracking(); // Use the new stopTracking function
      }
    });

    container.parentNode.insertBefore(trackButton, container.nextSibling);
    console.log("JobSync: Track button added successfully");
  } else if (retryCount < 10) {
    setTimeout(() => addTrackButton(retryCount + 1), 500);
    console.log(`JobSync: Retry #${retryCount + 1} to find apply button container`);
  } else {
    console.log("JobSync: Could not find apply button container after retries");
  }
}

// Function to handle apply button clicks
function setupApplyButtonListener() {
  console.log("JobSync: Setting up apply button listeners...");
  
  const applyButtonSelectors = [
    '.jobs-apply-button',
    '.jobs-s-apply button',
    '.jobs-unified-top-card__apply-button',
    'button[data-control-name="apply_button"]',
    'button[aria-label*="Apply"]',
    'button[aria-label*="apply"]'
  ];
  
  applyButtonSelectors.forEach(selector => {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => {
      if (!button.dataset.jobsyncListener) {
        button.dataset.jobsyncListener = 'true';
        button.addEventListener('click', (event) => {
          console.log("JobSync: Apply button clicked!");
          
          // Prevent duplicate tracking
          if (isTrackingJob) {
            console.log("JobSchedule: Already tracking job, ignoring apply button click");
            return;
          }
          
          startTracking(); // Use the new startTracking function
          setTimeout(() => {
            const jobData = extractJobDetails();
            if (jobData) {
              sendJobData(jobData);
            } else {
              stopTracking(); // Use the new stopTracking function
            }
          }, 500);
        });
      }
    });
  });
}

// Initialize when page loads
function initialize() {
  console.log("JobSync: Initializing on URL:", window.location.href);
  
  // Add a test function
  // Add a force reset function for emergencies
  
  if (isLinkedInJobPage()) {
    console.log("JobSync: LinkedIn job page detected, setting up...");
  addTrackButton();
    setupApplyButtonListener();
    
    // Debug: Log all elements with the specific class
    const specificElements = document.querySelectorAll('.lzUcjArWNaoJCSCaGJUmKllaCPmZs');
    console.log("JobSync: Found", specificElements.length, "elements with class lzUcjArWNaoJCSCaGJUmKllaCPmZs");
    specificElements.forEach((el, index) => {
      console.log(`JobSync: Element ${index}:`, el.textContent.trim());
    });
    
    // Debug: Log all images on the page for logo debugging
    console.log("JobSync: All images on page for logo debugging:");
    document.querySelectorAll('img').forEach((img, index) => {
      if (img.src && img.src.length > 10) {
        console.log(`JobSync: Image ${index}:`, img.src, "Class:", img.className);
      }
    });
  }
}

// Run initialization
initialize();

// Robust SPA navigation handling
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(() => {
      try {
        cleanupJobSync(); // Clean up listeners/UI before re-initializing
        initialize();
      } catch (e) {
        console.warn("JobSync: Error re-initializing content script", e);
      }
    }, 1000);
  }
});
observer.observe(document, { subtree: true, childList: true });

// Clean up listeners/UI (to be called before re-initializing)
function cleanupJobSync() {
  // Reset tracking flag
  stopTracking();
  
  // Remove track button if present
  const existingButton = document.getElementById('track-job-button');
  if (existingButton) existingButton.remove();
  // Remove any custom notifications
  document.querySelectorAll('.jobsync-notification').forEach(el => el.remove());
  // Remove any event listeners you added (if you keep references)
  // (If you use delegated events, this may not be needed)
}

// Function to manually reset tracking state
function resetTrackingState() {
  console.log("JobSync: Resetting tracking state");
  isTrackingJob = false;
}

console.log("JobSchedule: Content script loaded successfully!"); 

// Periodic check to ensure tracking flag doesn't get stuck
setInterval(() => {
  if (isTrackingJob) {
    console.log("JobSync: Tracking flag is still set, checking if it should be reset...");
    // If tracking has been active for more than 30 seconds, reset it
    // This is a safety mechanism
  }
}, 30000); // Check every 30 seconds

// Add a more aggressive reset mechanism

function startTracking() {
  isTrackingJob = true;
  trackingStartTime = Date.now();
  console.log("JobSync: Started tracking job at:", trackingStartTime);
}

function stopTracking() {
  isTrackingJob = false;
  trackingStartTime = null;
  console.log("JobSync: Stopped tracking job");
}

// Check every 5 seconds if tracking has been active for too long
setInterval(() => {
  if (isTrackingJob && trackingStartTime) {
    const elapsed = Date.now() - trackingStartTime;
    if (elapsed > 15000) { // 15 seconds
      console.warn("JobSync: Tracking has been active for", elapsed, "ms, forcing reset");
      stopTracking();
    }
  }
}, 5000);

// Robust message passing with error handling
function sendJobData(jobData) {
      console.log("JobSchedule: Sending job data to background script...");
  try {
    // Set a timeout to reset the tracking flag if no response
    const timeoutId = setTimeout(() => {
      console.warn("JobSync: Timeout waiting for background script response, resetting tracking flag");
      stopTracking();
    }, 10000); // 10 second timeout
    
    chrome.runtime.sendMessage({
      action: 'trackJobApplication',
      jobData: jobData
    }, response => {
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      // Reset tracking flag
      stopTracking();
      
      if (chrome.runtime.lastError) {
        if (
          chrome.runtime.lastError.message &&
          chrome.runtime.lastError.message.includes("Extension context invalidated")
        ) {
          // Silently ignore or show a user-friendly message
          console.warn("JobSync: Extension context invalidated, ignoring message.");
          return;
        }
        console.warn("JobSync: Could not send message:", chrome.runtime.lastError.message);
        showNotification('Error: Could not communicate with extension. Please reload the page.', true);
        return;
      }
      console.log("JobSchedule: Background script response:", response);
      if (response && response.success) {
        showNotification('Job tracked successfully!');
      } else {
        // Handle error response from background script
        const errorMessage = response?.message || 'Failed to track job';
        console.warn("JobSync: Background script returned error:", errorMessage);
        showNotification('Error: ' + errorMessage, true);
      }
    });
  } catch (e) {
    // Reset tracking flag on error
    stopTracking();
    
    if (e.message && e.message.includes("Extension context invalidated")) {
      // Silently ignore or show a user-friendly message
      console.warn("JobSync: Extension context invalidated, ignoring message.");
      return;
    }
    console.warn("JobSync: sendMessage failed", e);
    showNotification('Error: Could not communicate with extension. Please reload the page.', true);
  }
}

// Message schema validation
function isValidMessage(message) {
  if (!message || typeof message !== 'object') return false;
  if (typeof message.action !== 'string') return false;
  // Add more validation per action type
  switch (message.action) {
    case 'jobCreated':
      return message.jobData && typeof message.jobData === 'object';
    default:
      return false;
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validate message schema
  if (!isValidMessage(message)) {
    sendResponse && sendResponse({ success: false, error: 'Invalid message schema' });
    return;
  }
      console.log("JobSchedule: Received message:", message);
  
  if (message.action === 'manualTrack') {
    // Prevent duplicate tracking
    if (isTrackingJob) {
      sendResponse({ success: false, error: 'Already tracking a job' });
      return true;
    }
    
    startTracking(); // Use the new startTracking function
    const jobData = extractJobDetails();
    if (jobData) {
      sendJobData(jobData);
      sendResponse({ success: true });
    } else {
      stopTracking(); // Use the new stopTracking function
      sendResponse({ success: false, error: 'Could not extract job details' });
    }
    return true;
  }
  
  if (message.action === 'ping') {
    sendResponse({ success: true });
    return true;
  }
}); 