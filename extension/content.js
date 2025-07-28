// JobSchedule Content Script - Simple and Direct Version
console.log("JobSchedule: Content script starting...");
console.log("JobSchedule: Script loaded at:", new Date().toISOString());
console.log("JobSchedule: Current URL:", window.location.href);

// Global tracking state
let isTrackingJob = false;
let trackingStartTime = null;

// Add a global indicator that the extension is loaded
window.jobSyncExtensionLoaded = true;

// Immediately expose a basic test function
window.testJobSyncBasic = function() {
  console.log("JobSchedule: Basic test - content script is loaded");
  return {
    scriptLoaded: true,
    chromeAvailable: typeof chrome !== 'undefined',
    chromeRuntimeAvailable: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
};

// Add comprehensive diagnostic function
window.diagnoseJobSync = function() {
  console.log("JobSchedule: Running comprehensive diagnostics...");
  
  const diagnostics = {
    // Basic extension info
    extensionLoaded: window.jobSyncExtensionLoaded || false,
    chromeAvailable: typeof chrome !== 'undefined',
    chromeRuntimeAvailable: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
    chromeStorageAvailable: typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined',
    
    // Current page info
    currentUrl: window.location.href,
    isLinkedInJobPage: isLinkedInJobPage(),
    isJobSyncWebsite: window.location.hostname === 'jobschedule.io' || window.location.hostname === 'localhost',
    
    // Function availability
    functionsAvailable: {
      testJobSyncBasic: typeof window.testJobSyncBasic,
      diagnoseJobSync: typeof window.diagnoseJobSync,
      resetJobSyncTracking: typeof window.resetJobSyncTracking,
      debugJobSyncState: typeof window.debugJobSyncState,
      testJobSyncExtension: typeof window.testJobSyncExtension,
      checkJobSyncAuth: typeof window.checkJobSyncAuth,
      testJobSyncConnection: typeof window.testJobSyncConnection,
      triggerJobSyncAuth: typeof window.triggerJobSyncAuth
    },
    
    // Extension state
    isTrackingJob: isTrackingJob,
    trackingStartTime: trackingStartTime
  };
  
  console.log("JobSchedule: Diagnostics result:", diagnostics);
  
  // Check authentication status if chrome.storage is available
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['token', 'user'], function(result) {
      console.log("JobSchedule: Authentication status:", {
        hasToken: !!result.token,
        user: result.user,
        tokenPreview: result.token ? result.token.substring(0, 20) + '...' : null
      });
    });
  } else {
    console.warn("JobSchedule: chrome.storage.local not available for auth check");
  }
  
  return diagnostics;
};

// Expose all functions immediately
window.resetJobSyncTracking = function() {
  console.log("JobSchedule: Manual reset called from window");
  stopTracking();
  console.log("JobSchedule: Tracking state reset to:", isTrackingJob);
};

window.debugJobSyncState = function() {
  console.log("JobSchedule: Debug state:", {
    isTrackingJob: isTrackingJob,
    trackingStartTime: trackingStartTime,
    elapsedTime: trackingStartTime ? Date.now() - trackingStartTime : null,
    currentUrl: window.location.href,
    isLinkedInJobPage: isLinkedInJobPage(),
    extensionLoaded: true
  });
};

window.testJobSyncExtension = function() {
  console.log("JobSchedule: Testing extension functionality...");
  console.log("JobSchedule: Extension loaded:", window.jobSyncExtensionLoaded);
  console.log("JobSchedule: Tracking state:", isTrackingJob);
  console.log("JobSchedule: Tracking start time:", trackingStartTime);
  console.log("JobSchedule: Current URL:", window.location.href);
  console.log("JobSchedule: Is LinkedIn job page:", isLinkedInJobPage());
  
  // Test if we can extract job details
  const jobData = extractJobDetails();
  console.log("JobSchedule: Can extract job details:", !!jobData);
  if (jobData) {
    console.log("JobSchedule: Job title:", jobData.jobTitle);
    console.log("JobSchedule: Company:", jobData.company);
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
  console.log("JobSchedule: Force reset called");
  stopTracking();
  console.log("JobSchedule: Force reset complete - tracking state:", isTrackingJob);
  return { success: true, trackingState: isTrackingJob };
};

window.authenticateJobSyncExtension = async function() {
  console.log("JobSchedule: Manual authentication requested...");
  
  if (window.location.hostname === 'jobschedule.io' || window.location.hostname === 'localhost') {
    const success = await getExtensionToken();
    if (success) {
      console.log("JobSchedule: Manual authentication successful!");
      return { success: true, message: "Extension authenticated successfully" };
    } else {
      console.log("JobSchedule: Manual authentication failed - not logged in to website");
      return { success: false, message: "Please log in to JobSchedule website first" };
    }
  } else {
    console.log("JobSchedule: Manual authentication failed - not on JobSchedule website");
    return { success: false, message: "Please go to jobschedule.io to authenticate" };
  }
};

window.checkJobSyncAuth = function() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['token', 'user'], function(result) {
      console.log("JobSchedule: Authentication status:", {
        hasToken: !!result.token,
        user: result.user,
        tokenPreview: result.token ? result.token.substring(0, 20) + '...' : null
      });
    });
  } else {
    console.warn("JobSchedule: chrome.storage.local not available");
    console.log("JobSchedule: Authentication status: chrome.storage not available");
  }
};

window.triggerJobSyncAuth = function() {
  console.log("JobSchedule: Triggering authentication...");
  
  // If we're on the JobSchedule website, try to get token
  if (window.location.hostname === 'jobschedule.io' || window.location.hostname === 'localhost') {
    console.log("JobSchedule: On JobSchedule website, attempting to get token...");
    getExtensionToken().then(success => {
      if (success) {
        console.log("JobSchedule: Authentication successful!");
        alert("JobSchedule extension authenticated successfully!");
      } else {
        console.log("JobSchedule: Authentication failed - please log in to the website first");
        alert("Please log in to JobSchedule website first, then try again.");
      }
    });
  } else {
    console.log("JobSchedule: Not on JobSchedule website, redirecting...");
    alert("Please go to jobschedule.io to authenticate the extension.");
    window.open('https://jobschedule.io', '_blank');
  }
};

window.testJobSyncConnection = function() {
  console.log("JobSchedule: Testing extension connection...");
  
  try {
    // Test if chrome.runtime is available
    if (!chrome.runtime) {
      console.error("JobSchedule: chrome.runtime is not available");
      return { 
        error: "chrome.runtime is not available",
        chromeAvailable: typeof chrome !== 'undefined',
        chromeRuntimeAvailable: false,
        message: "Extension context not fully available"
      };
    }
    
    const url = chrome.runtime.getURL('');
    console.log("JobSchedule: Extension runtime available:", !!url);
    
    // Test if we can send a message
    if (chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'ping' }, response => {
        if (chrome.runtime.lastError) {
          console.error("JobSchedule: Extension communication failed:", chrome.runtime.lastError);
        } else {
          console.log("JobSchedule: Extension communication successful:", response);
        }
      });
    } else {
      console.error("JobSchedule: chrome.runtime.sendMessage is not available");
    }
    
    return {
      runtimeAvailable: !!url,
      chromeRuntimeAvailable: !!chrome.runtime,
      sendMessageAvailable: !!chrome.runtime.sendMessage,
      functionsAvailable: {
        resetJobSyncTracking: typeof window.resetJobSyncTracking,
        debugJobSyncState: typeof window.debugJobSyncState,
        testJobSyncExtension: typeof window.testJobSyncExtension,
        checkJobSyncAuth: typeof window.checkJobSyncAuth
      }
    };
  } catch (e) {
    console.error("JobSchedule: Extension test failed:", e);
    return { error: e.message };
  }
};

console.log("JobSchedule: All functions exposed to window object");

// Simple function to check if we're on a LinkedIn job page
function isLinkedInJobPage() {
  return window.location.href.includes('linkedin.com/jobs/') || 
         window.location.href.includes('linkedin.com/job/');
}

// Helper functions
function stopTracking() {
  isTrackingJob = false;
  trackingStartTime = null;
  console.log("JobSchedule: Stopped tracking job");
}

function extractJobDetails() {
  // Simple job details extraction
  const jobTitle = document.querySelector('h1')?.textContent?.trim() || 'Unknown Position';
  const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim() || 'Unknown Company';
  
  return {
    jobTitle,
    company,
    location: 'Unknown Location',
    jobUrl: window.location.href
  };
}

async function getExtensionToken() {
  try {
    console.log("JobSchedule: Attempting to get extension token from website...");
    
    const response = await fetch('/api/auth/extension-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      console.log("JobSchedule: Successfully got extension token");
      
      // Save token to extension storage
      if (chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          token: data.token,
          user: data.user
        });
        
        console.log("JobSchedule: Token saved to extension storage");
      } else {
        console.warn("JobSchedule: chrome.storage.local not available");
      }
      
      return true;
    } else {
      console.error("JobSchedule: Failed to get extension token:", data.message);
      return false;
    }
  } catch (error) {
    console.error("JobSchedule: Error getting extension token:", error);
    return false;
  }
}

console.log("JobSchedule: Content script loaded successfully!"); 