// JobSchedule Content Script - CSP-Safe Version
console.log("🚀 JobSchedule: Content script starting...");
console.log("🚀 JobSchedule: Script loaded at:", new Date().toISOString());
console.log("🚀 JobSchedule: Current URL:", window.location.href);

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

  console.log("🚀 JobSchedule: Direct window assignment completed");
  console.log("🚀 JobSchedule: window.JobSchedule available:", typeof window.JobSchedule);
  console.log("🚀 JobSchedule: window.testJobSync available:", typeof window.testJobSync);
  
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