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
      
      // Extract job information
      const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim();
      const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim();
      const location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim();
      const jobUrl = window.location.href;
      
      if (jobTitle && company) {
        console.log("🚀 JobSchedule: Job data extracted:", { jobTitle, company, location, jobUrl });
        
        // Send job data to background script
        chrome.runtime.sendMessage({
          action: 'trackJobApplication',
          jobData: {
            jobTitle,
            company,
            location: location || 'Remote',
            jobUrl,
            source: 'linkedin'
          }
        }, function(response) {
          if (response && response.success) {
            console.log("🚀 JobSchedule: Job tracked successfully");
            showTrackingNotification(jobTitle, company);
          } else {
            console.error("🚀 JobSchedule: Failed to track job:", response);
          }
        });
      }
    }
  } catch (error) {
    console.error("🚀 JobSchedule: Error tracking LinkedIn job:", error);
  }
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