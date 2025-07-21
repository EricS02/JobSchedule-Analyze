// Background script for JobSchedule extension
console.log("JobSchedule: Background script loaded");

// Configuration
const DEV_MODE = true;
const API_BASE_URL = DEV_MODE 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';
const USE_TEST_ENDPOINTS = DEV_MODE;

// Add this to your background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("JobSchedule: Extension installed/updated");
});

// Message schema validation
function isValidMessage(message) {
  if (!message || typeof message !== 'object') return false;
  if (typeof message.action !== 'string') return false;
  // Add more validation per action type
  switch (message.action) {
    case 'trackJobApplication':
      return message.jobData && typeof message.jobData === 'object';
    case 'checkAuth':
      return true;
    default:
      return false;
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("JobSchedule: Message received in background", message);

  // Validate message schema
  if (!isValidMessage(message)) {
    sendResponse({ success: false, error: 'Invalid message schema' });
    return;
  }
  
  if (message.action === 'trackJobApplication') {
    trackJobApplication(message.jobData)
      .then(result => {
        console.log("JobSchedule: Job tracked successfully", result);
        
        // Notify all tabs that a job was updated
        chrome.tabs.query({ url: "http://localhost:3000/*" }, (tabs) => {
          if (tabs && Array.isArray(tabs)) {
            try {
          tabs.forEach(tab => {
                try {
            chrome.tabs.sendMessage(tab.id, { 
              action: 'jobCreated', 
              jobData: result.job 
                  });
                } catch (e) {
              // Tab might not be ready to receive messages, that's okay
                  console.warn("JobSchedule: Could not send message to tab", tab.id, e);
                }
            });
            } catch (e) {
              console.warn("JobSchedule: Error iterating tabs for jobCreated message", e);
            }
          } else {
            console.warn("JobSchedule: No tabs found for jobCreated message");
          }
        });
        
        sendResponse({ success: true, message: "Job tracked successfully" });
      })
      .catch(error => {
        console.error("JobSchedule: Error tracking job", error);
        sendResponse({ success: false, message: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  if (message.action === 'checkAuth') {
    checkAuthentication()
      .then(isAuthenticated => {
        sendResponse({ isAuthenticated });
      })
      .catch(error => {
        console.error("JobSchedule: Auth check error", error);
        sendResponse({ isAuthenticated: false, error: error.message });
      });
    
    return true;
  }
});

// Listen for context invalidation
chrome.runtime.onSuspend.addListener(() => {
  console.log("JobSchedule: Extension being suspended");
  // Perform any cleanup here
});

// Function to check if user is authenticated
async function checkAuthentication() {
  try {
    const { token } = await chrome.storage.local.get('token');
    return !!token;
  } catch (error) {
    console.error("JobSchedule: Error checking authentication", error);
    return false;
  }
}

// Function to send job data to backend
async function trackJobApplication(jobData) {
  try {
    console.log("JobSchedule: Tracking job application", jobData);
    
    // Get token from storage
    const { token } = await chrome.storage.local.get('token');
    
    if (!token && USE_TEST_ENDPOINTS) {
      // Try to get a test token in development mode
      try {
        const tokenResponse = await fetch(`${API_BASE_URL}/test-token`);
        const tokenData = await tokenResponse.json();
        if (tokenData.token) {
          // Save the token
          await chrome.storage.local.set({ 
            token: tokenData.token,
            user: tokenData.user || { email: 'test@example.com' }
          });
          console.log("JobSchedule: Retrieved and saved test token");
        } else {
          throw new Error("Could not retrieve test token");
        }
      } catch (tokenError) {
        console.error("JobSchedule: Error getting test token", tokenError);
        throw new Error("Not authenticated. Please log in to JobSync.");
      }
    } else if (!token) {
      // In production, require login
      throw new Error("Not authenticated. Please log in to JobSync first.");
    }
    
    // Get token again (in case we just set it)
    const { token: updatedToken } = await chrome.storage.local.get('token');
    
    if (!updatedToken) {
      throw new Error("Authentication failed. Please log in to JobSync.");
    }
    
    // Validate job data
    if (!jobData.jobTitle || !jobData.company) {
      throw new Error("Missing required job information. Please try again.");
    }
    
    // Test connection in development mode
    if (USE_TEST_ENDPOINTS) {
      try {
        const testResponse = await fetch(`${API_BASE_URL}/test-connection`);
        if (!testResponse.ok) {
          throw new Error(`Server connection test failed: ${testResponse.status}`);
        }
        console.log("JobSchedule: Server connection test successful");
      } catch (testError) {
        console.error("JobSchedule: Server connection test failed", testError);
        // Continue anyway, don't throw an error
      }
    }
    
    // Send data to backend
    console.log("JobSchedule: Sending data to backend with token");
    const response = await fetch(`${API_BASE_URL}/jobs/extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${updatedToken}`
      },
      body: JSON.stringify({
        jobTitle: jobData.jobTitle || "Unknown Position",
        company: jobData.company || "Unknown Company",
        location: jobData.location || "Remote",
        description: jobData.description || "No description available",
        detailedDescription: jobData.detailedDescription || null,
        jobRequirements: jobData.jobRequirements || null,
        jobResponsibilities: jobData.jobResponsibilities || null,
        jobBenefits: jobData.jobBenefits || null,
        jobUrl: jobData.jobUrl || window.location.href,
        logoUrl: jobData.logoUrl || null
      })
    });
    
    console.log("JobSchedule: Backend response status:", response.status);
    
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      // Get the HTML response for debugging
      const htmlResponse = await response.text();
      console.error("JobSchedule: Received HTML response instead of JSON:", htmlResponse.substring(0, 200));
      throw new Error("Server returned HTML instead of JSON. The server might be down or misconfigured.");
    }
    
    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If we can't parse as JSON, get the text for debugging
      const textResponse = await response.text();
      console.error("JobSchedule: Invalid JSON response:", textResponse.substring(0, 200));
      throw new Error("Invalid response from server: " + jsonError.message);
    }
    
    if (!response.ok) {
      console.error("JobSchedule: Error response from server:", data);
      throw new Error(data.message || `HTTP error ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.message || "Failed to track job application");
    }
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'JobSchedule',
      message: 'Job application tracked successfully!'
    });
    
    console.log("JobSchedule: Response from backend:", data);
    
    // Check if job was created successfully
    if (data.success) {
      console.log("JobSchedule: Job tracked successfully:", data.job);
    } else {
              console.error("JobSchedule: Failed to track job:", data.message);
    }
    
    return data;
  } catch (error) {
    console.error("JobSchedule: Error tracking job:", error);
    
    // Try to parse the response if it's available
    if (error.response) {
      error.response.json().then(data => {
        console.error("JobSchedule: Server error details:", data);
      }).catch(e => {
                  console.error("JobSchedule: Couldn't parse error response");
      });
    }
    
    // Show error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'JobSchedule Error',
      message: error.message || "Failed to track job application"
    });
    
    throw error;
  }
} 