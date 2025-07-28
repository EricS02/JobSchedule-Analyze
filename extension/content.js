// JobSchedule Content Script - Ultra Simple Version
console.log("🚀 JobSchedule: Content script starting...");
console.log("🚀 JobSchedule: Script loaded at:", new Date().toISOString());
console.log("🚀 JobSchedule: Current URL:", window.location.href);

// Method 1: Try script injection
try {
  console.log("🚀 JobSchedule: Attempting script injection...");
  
  const script = document.createElement('script');
  script.textContent = `
    console.log("🎯 JobSchedule: Injected script starting...");
    
    // Create JobSchedule object in the main page context
    window.JobSchedule = {
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

    // Also expose individual functions
    window.testJobSync = function() {
      console.log("🎯 JobSchedule: testJobSync function called!");
      return "JobSchedule test function working!";
    };

    window.diagnoseJobSync = function() {
      console.log("🎯 JobSchedule: diagnoseJobSync function called!");
      return {
        chromeAvailable: typeof chrome !== 'undefined',
        chromeRuntimeAvailable: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
        url: window.location.href
      };
    };

    console.log("🎯 JobSchedule: Functions injected into main page window object");
    console.log("🎯 JobSchedule: window.JobSchedule available:", typeof window.JobSchedule);
    console.log("🎯 JobSchedule: window.testJobSync available:", typeof window.testJobSync);
    
    // Test that the object was created
    console.log("🎯 JobSchedule: window.JobSchedule =", window.JobSchedule);
  `;

  // Inject the script into the page
  document.head.appendChild(script);
  console.log("🚀 JobSchedule: Script element appended to document.head");
  
} catch (error) {
  console.error("🚀 JobSchedule: Error during script injection:", error);
}

// Method 2: Try using chrome.scripting.executeScript
try {
  console.log("🚀 JobSchedule: Trying chrome.scripting.executeScript...");
  
  // Send message to background script to execute script
  chrome.runtime.sendMessage({
    action: 'executeScript',
    code: `
      console.log("🎯 JobSchedule: executeScript starting...");
      
      window.JobScheduleExecute = {
        test: function() {
          console.log("🎯 JobSchedule: ExecuteScript test function called!");
          return "JobSchedule executeScript working!";
        }
      };
      
      console.log("🎯 JobSchedule: ExecuteScript object created:", window.JobScheduleExecute);
    `
  }, (response) => {
    console.log("🚀 JobSchedule: executeScript response:", response);
  });
  
} catch (error) {
  console.error("🚀 JobSchedule: Error with executeScript:", error);
}

console.log("🚀 JobSchedule: Content script loaded successfully!");
console.log("🚀 JobSchedule: Functions should now be available in main page context"); 