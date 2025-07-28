// JobSchedule Content Script - Ultra Simple Version
console.log("🚀 JobSchedule: Content script starting...");
console.log("🚀 JobSchedule: Script loaded at:", new Date().toISOString());
console.log("🚀 JobSchedule: Current URL:", window.location.href);

// Remove the alert since we confirmed it's loading
// alert("JobSchedule extension is loading!");

// Inject functions into the main page's window object
const script = document.createElement('script');
script.textContent = `
  // Create JobSchedule object in the main page context
  window.JobSchedule = {
    test: function() {
      return "JobSchedule extension is working!";
    },
    
    diagnose: function() {
      return {
        chromeAvailable: typeof chrome !== 'undefined',
        chromeRuntimeAvailable: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
    },
    
    reset: function() {
      console.log("JobSchedule: Reset called");
      return { success: true };
    }
  };

  // Also expose individual functions
  window.testJobSync = function() {
    return "JobSchedule test function working!";
  };

  window.diagnoseJobSync = function() {
    return {
      chromeAvailable: typeof chrome !== 'undefined',
      chromeRuntimeAvailable: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
      url: window.location.href
    };
  };

  console.log("🎯 JobSchedule: Functions injected into main page window object");
  console.log("🎯 JobSchedule: window.JobSchedule available:", typeof window.JobSchedule);
  console.log("🎯 JobSchedule: window.testJobSync available:", typeof window.testJobSync);
`;

// Inject the script into the page
document.head.appendChild(script);

console.log("🚀 JobSchedule: Content script loaded successfully!");
console.log("🚀 JobSchedule: Functions should now be available in main page context"); 