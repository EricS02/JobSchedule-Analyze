// JobSchedule Content Script - CSP-Safe Version
console.log("🚀 JobSchedule: Content script starting...");
console.log("🚀 JobSchedule: Script loaded at:", new Date().toISOString());
console.log("🚀 JobSchedule: Current URL:", window.location.href);

// LinkedIn Job Tracking
function trackLinkedInJob() {
  try {
    // Check if we're on a LinkedIn job page
    if (window.location.href.includes('linkedin.com/jobs/')) {
      console.log("🚀 JobSchedule: LinkedIn job page detected");
      
      // Extract comprehensive job information
      const jobData = extractLinkedInJobData();
      
      if (jobData.jobTitle && jobData.company) {
        console.log("🚀 JobSchedule: Job data extracted:", jobData);
        
        // Create track job button next to apply button
        createTrackJobButton(jobData);
      }
    }
  } catch (error) {
    console.error("🚀 JobSchedule: Error tracking LinkedIn job:", error);
  }
}

// Extract comprehensive job data from LinkedIn
function extractLinkedInJobData() {
  try {
    // Basic job info
    const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim();
    const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim();
    const location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim();
    const jobUrl = window.location.href;
    
    // Company logo
    const logoElement = document.querySelector('.job-details-jobs-unified-top-card__company-logo img, .job-details-jobs-unified-top-card__company-logo svg');
    const logoUrl = logoElement?.src || logoElement?.querySelector('image')?.getAttribute('href') || null;
    
    // Job description
    const descriptionElement = document.querySelector('.job-details-jobs-unified-top-card__job-description, .jobs-description__content');
    const description = descriptionElement?.textContent?.trim() || '';
    
    // Detailed job info
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
    
    return {
      jobTitle,
      company,
      location: location || 'Remote',
      jobUrl,
      logoUrl,
      description,
      detailedDescription,
      jobRequirements,
      jobResponsibilities,
      jobBenefits,
      source: 'linkedin'
    };
  } catch (error) {
    console.error("🚀 JobSchedule: Error extracting job data:", error);
    return {};
  }
}

// Create track job button next to apply button
function createTrackJobButton(jobData) {
  try {
    // Remove existing button if any
    const existingButton = document.getElementById('jobschedule-track-button');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Find the apply button container
    const applyButtonContainer = document.querySelector('.jobs-apply-button, .jobs-s-apply-button, [data-control-name="jobdetails_topcard_inapply"]');
    
    if (!applyButtonContainer) {
      console.log("🚀 JobSchedule: Apply button container not found, using fixed positioning");
      createFixedTrackButton(jobData);
      return;
    }
    
    // Create the track button
    const trackButton = document.createElement('button');
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
      transition: background-color 0.2s;
    `;
    
    // Add hover effect
    trackButton.addEventListener('mouseenter', () => {
      trackButton.style.background = '#005582';
    });
    trackButton.addEventListener('mouseleave', () => {
      trackButton.style.background = '#0077b5';
    });
    
    // Add click handler
    trackButton.addEventListener('click', function() {
      console.log("🚀 JobSchedule: Track job button clicked");
      
      // Send comprehensive job data to background script
      chrome.runtime.sendMessage({
        action: 'trackJobApplication',
        jobData: jobData
      }, function(response) {
        if (response && response.success) {
          console.log("🚀 JobSchedule: Job tracked successfully");
          showTrackingNotification(jobData.jobTitle, jobData.company);
          trackButton.innerHTML = '✅ Tracked';
          trackButton.style.background = '#28a745';
          setTimeout(() => trackButton.remove(), 2000);
        } else {
          console.error("🚀 JobSchedule: Failed to track job:", response);
          trackButton.innerHTML = '❌ Failed';
          trackButton.style.background = '#dc3545';
          setTimeout(() => {
            trackButton.innerHTML = '📋 Track Job';
            trackButton.style.background = '#0077b5';
          }, 2000);
        }
      });
    });
    
    // Insert next to apply button
    applyButtonContainer.parentNode.insertBefore(trackButton, applyButtonContainer.nextSibling);
    console.log("🚀 JobSchedule: Track job button created next to apply button");
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error creating track button:", error);
    // Fallback to fixed positioning
    createFixedTrackButton(jobData);
  }
}

// Fallback function for fixed positioning
function createFixedTrackButton(jobData) {
  const trackButton = document.createElement('button');
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
  
  // Add click handler
  trackButton.addEventListener('click', function() {
    console.log("🚀 JobSchedule: Track job button clicked");
    
    chrome.runtime.sendMessage({
      action: 'trackJobApplication',
      jobData: jobData
    }, function(response) {
      if (response && response.success) {
        console.log("🚀 JobSchedule: Job tracked successfully");
        showTrackingNotification(jobData.jobTitle, jobData.company);
        trackButton.innerHTML = '✅ Tracked';
        trackButton.style.background = '#28a745';
        setTimeout(() => trackButton.remove(), 2000);
      } else {
        console.error("🚀 JobSchedule: Failed to track job:", response);
        trackButton.innerHTML = '❌ Failed';
        trackButton.style.background = '#dc3545';
        setTimeout(() => {
          trackButton.innerHTML = '📋 Track Job';
          trackButton.style.background = '#0077b5';
        }, 2000);
      }
    });
  });
  
  document.body.appendChild(trackButton);
  console.log("🚀 JobSchedule: Track job button created with fixed positioning");
}

// Show notification when job is tracked
function showTrackingNotification(jobTitle, company) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0077b5;
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  notification.innerHTML = `
    <strong>JobSchedule</strong><br>
    Job tracked: ${jobTitle} at ${company}
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Monitor for job page changes (LinkedIn uses SPA)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    if (currentUrl.includes('linkedin.com/jobs/')) {
      setTimeout(trackLinkedInJob, 2000); // Wait for page to load
    } else {
      // Remove track button when leaving job page
      const existingButton = document.getElementById('jobschedule-track-button');
      if (existingButton) {
        existingButton.remove();
        console.log("🚀 JobSchedule: Removed track button - left job page");
      }
    }
  }
}, 1000);

// Track job on initial load
if (window.location.href.includes('linkedin.com/jobs/')) {
  setTimeout(trackLinkedInJob, 2000);
}

// Method 1: Direct window property assignment (CSP-safe)
try {
  console.log("🚀 JobSchedule: Attempting direct window assignment...");
  
  // Create a simple object with functions
  const jobScheduleFunctions = {
    test: function() {
      console.log("🎯 JobSchedule: Test function called!");
      return "JobSchedule extension is working!";
    },
    
    diagnose: function() {
      console.log("🎯 JobSchedule: Diagnose function called!");
      return {
        chromeAvailable: typeof chrome !== 'undefined',
        chromeRuntimeAvailable: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
    },
    
    reset: function() {
      console.log("🎯 JobSchedule: Reset function called!");
      return { success: true };
    }
  };

  // Try to assign to window object directly
  Object.assign(window, {
    JobSchedule: jobScheduleFunctions,
    testJobSync: jobScheduleFunctions.test,
    diagnoseJobSync: jobScheduleFunctions.diagnose
  });


  
} catch (error) {
  console.error("🚀 JobSchedule: Error during direct window assignment:", error);
}

// Method 2: Use postMessage to communicate with main page
try {
  console.log("🚀 JobSchedule: Setting up postMessage communication...");
  
  // Listen for messages from the main page
  window.addEventListener('message', function(event) {
    // Only accept messages from the same origin
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'JobSchedule') {
      console.log("🚀 JobSchedule: Received message from main page:", event.data);
      
      // Handle different message types
      if (event.data.action === 'test') {
        const result = jobScheduleFunctions.test();
        window.postMessage({
          type: 'JobSchedule',
          action: 'testResponse',
          result: result
        }, '*');
      }
    }
  });

  // Send a message to the main page to announce our presence
  window.postMessage({
    type: 'JobSchedule',
    action: 'extensionLoaded',
    functions: Object.keys(jobScheduleFunctions)
  }, '*');
  
  console.log("🚀 JobSchedule: postMessage setup completed");
  
} catch (error) {
  console.error("🚀 JobSchedule: Error setting up postMessage:", error);
}

// Method 3: Create a global function that can be called from main page
try {
  console.log("🚀 JobSchedule: Creating global function...");
  
  // Create a global function that can be called from the main page
  window.jobScheduleTest = function() {
    console.log("🎯 JobSchedule: Global function called!");
    return "JobSchedule global function working!";
  };
  
  window.jobScheduleDiagnose = function() {
    console.log("🎯 JobSchedule: Global diagnose function called!");
    return {
      chromeAvailable: typeof chrome !== 'undefined',
      chromeRuntimeAvailable: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  };
  
  console.log("🚀 JobSchedule: Global functions created");
  console.log("🚀 JobSchedule: window.jobScheduleTest available:", typeof window.jobScheduleTest);
  
} catch (error) {
  console.error("🚀 JobSchedule: Error creating global functions:", error);
}

console.log("🚀 JobSchedule: Content script loaded successfully!");
console.log("🚀 JobSchedule: All methods attempted - check console for results"); 