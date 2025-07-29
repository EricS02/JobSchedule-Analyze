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
    
    // Wait for page to load completely
    setTimeout(() => {
      extractAndSetupJobTracking();
    }, 2000);
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error initializing job tracking:", error);
  }
}

// Extract job data and set up tracking
function extractAndSetupJobTracking() {
  try {
    // Extract basic job information
    const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim();
    const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim();
    const location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim();
    
    if (!jobTitle || !company) {
      console.log("🚀 JobSchedule: Job data not found, retrying...");
      setTimeout(extractAndSetupJobTracking, 1000);
      return;
    }

    // Extract additional data
    const jobUrl = window.location.href;
    const description = document.querySelector('.jobs-description__content')?.textContent?.trim() || '';
    
    // Company logo
    const logoElement = document.querySelector('.job-details-jobs-unified-top-card__company-logo img');
    const logoUrl = logoElement?.src || null;

    currentJobData = {
      jobTitle,
      company,
      location: location || 'Remote',
      jobUrl,
      description: description.substring(0, 2000),
      logoUrl,
      source: 'linkedin'
    };

    console.log("🚀 JobSchedule: Job data extracted:", currentJobData);
    
    // Create track button
    createTrackButton();
    
    // Set up apply button monitoring
    setupApplyButtonMonitoring();
    
  } catch (error) {
    console.error("🚀 JobSchedule: Error extracting job data:", error);
  }
}

// Create track button
function createTrackButton() {
  try {
    // Remove existing button
    if (trackButton) {
      trackButton.remove();
    }

    // Find apply button
    const applyButton = document.querySelector('.jobs-apply-button, .jobs-s-apply-button, [data-control-name="jobdetails_topcard_inapply"]');
    
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
  if (!currentJobData) {
    console.error("🚀 JobSchedule: No job data available");
    return;
  }

  console.log("🚀 JobSchedule: Track job button clicked");
  
  chrome.runtime.sendMessage({
    action: 'trackJobApplication',
    jobData: currentJobData
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

// Set up apply button monitoring
function setupApplyButtonMonitoring() {
  try {
    const applyButton = document.querySelector('.jobs-apply-button, .jobs-s-apply-button, [data-control-name="jobdetails_topcard_inapply"]');
    
    if (!applyButton) {
      console.log("🚀 JobSchedule: Apply button not found for monitoring");
      return;
    }

    // Monitor for apply button clicks
    applyButton.addEventListener('click', function() {
      console.log("🚀 JobSchedule: Apply button clicked!");
      
      if (!currentJobData) {
        console.error("🚀 JobSchedule: No job data available for apply tracking");
        return;
      }

      // Track the job application
      chrome.runtime.sendMessage({
        action: 'trackJobApplication',
        jobData: {
          ...currentJobData,
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