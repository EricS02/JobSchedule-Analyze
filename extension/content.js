// JobSchedule Content Script - Ultra Simple Version
console.log("🚀 JobSchedule: Content script starting...");
console.log("🚀 JobSchedule: Script loaded at:", new Date().toISOString());
console.log("🚀 JobSchedule: Current URL:", window.location.href);

// Add a very obvious alert to confirm script is loading
alert("JobSchedule extension is loading!");

// Immediately create a simple global object
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

console.log("🚀 JobSchedule: Functions exposed to window object");
console.log("🚀 JobSchedule: window.JobSchedule available:", typeof window.JobSchedule);
console.log("🚀 JobSchedule: window.testJobSync available:", typeof window.testJobSync);

// Test that the object was created
console.log("🚀 JobSchedule: Testing object creation...");
console.log("🚀 JobSchedule: window.JobSchedule =", window.JobSchedule);
console.log("🚀 JobSchedule: window.JobSchedule.test =", typeof window.JobSchedule?.test); 