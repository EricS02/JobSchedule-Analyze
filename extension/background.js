// Background script for JobSchedule extension
console.log("JobSchedule: Background script loaded");

// Import configuration and security utilities
import { API_BASE_URL, USE_TEST_ENDPOINTS } from './config.js';
import { validateJobData, logSecurityEvent, RateLimiter } from './security.js';
import { logError, getUserFriendlyMessage, showErrorNotification, logApiError, logPerformance, logLifecycleEvent } from './error-logger.js';

// Initialize rate limiter (10 requests per minute per user)
const rateLimiter = new RateLimiter(10, 60000);

// Add this to your background.js
chrome.runtime.onInstalled.addListener(() => {
  logLifecycleEvent('Extension installed/updated');
});

// ✅ ENHANCED: Message schema validation with security
function isValidMessage(message) {
  if (!message || typeof message !== 'object') return false;
  if (typeof message.action !== 'string') return false;
  
  // Validate action whitelist
  const allowedActions = ['trackJobApplication', 'checkAuth'];
  if (!allowedActions.includes(message.action)) return false;
  
  // Validate data structure per action
  switch (message.action) {
    case 'trackJobApplication':
      return message.jobData && 
             typeof message.jobData === 'object' &&
             typeof message.jobData.jobTitle === 'string' &&
             typeof message.jobData.company === 'string';
    case 'checkAuth':
      return true;
    default:
      return false;
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("JobSchedule: Message received in background", message);

  // ✅ ENHANCED: Validate message schema with detailed logging
  if (!isValidMessage(message)) {
    logSecurityEvent('Invalid message schema', {
      message,
      sender: sender?.tab?.url || 'unknown'
    });
    sendResponse({ success: false, error: 'Invalid message schema' });
    return;
  }
  
  if (message.action === 'trackJobApplication') {
    // ✅ ENHANCED: Rate limiting check
    const userKey = sender?.tab?.url || 'unknown';
    if (!rateLimiter.isAllowed(userKey)) {
      logSecurityEvent('Rate limit exceeded', { userKey });
      sendResponse({ success: false, error: 'Too many requests. Please wait before trying again.' });
      return;
    }
    
    trackJobApplication(message.jobData)
      .then(result => {
        console.log("JobSchedule: Job tracked successfully", result);
        
        // Notify all tabs that a job was updated
        chrome.tabs.query({ url: ["http://localhost:3000/*", "https://jobschedule.io/*"] }, (tabs) => {
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
        // ✅ ENHANCED: Production-ready error reporting for job tracking
        logError(error, 'job tracking in message handler', {
          sender: sender?.tab?.url || 'unknown',
          jobData: jobData ? Object.keys(jobData) : null
        });
        
        // User-friendly error message
        const userMessage = getUserFriendlyMessage(error);
        sendResponse({ success: false, message: userMessage });
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
        // ✅ ENHANCED: Production-ready error reporting for auth check
        logError(error, 'auth check in message handler', {
          sender: sender?.tab?.url || 'unknown'
        });
        
        sendResponse({ isAuthenticated: false, error: 'Authentication check failed' });
      });
    
    return true;
  }
});

// Listen for context invalidation
chrome.runtime.onSuspend.addListener(() => {
  logLifecycleEvent('Extension being suspended');
  // Perform any cleanup here
});

// Function to check if user is authenticated
async function checkAuthentication() {
  try {
    const { token } = await chrome.storage.local.get('token');
    return !!token;
  } catch (error) {
    // ✅ ENHANCED: Production-ready error reporting for auth
    logError(error, 'checkAuthentication', {
      hasToken: false
    });
    
    return false;
  }
}

// Function to send job data to backend
async function trackJobApplication(jobData) {
  const startTime = Date.now();
  
  try {
    console.log("JobSchedule: Tracking job application", {
      jobTitle: jobData.jobTitle?.substring(0, 50) + '...',
      company: jobData.company?.substring(0, 50) + '...',
      hasDescription: !!jobData.description,
      hasUrl: !!jobData.jobUrl,
      timestamp: new Date().toISOString()
    });
    
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
    
    // ✅ ENHANCED: Validate and sanitize job data using security utilities
    const validation = validateJobData(jobData);
    
    if (!validation.isValid) {
      logSecurityEvent('Invalid job data', { errors: validation.errors });
      throw new Error(`Invalid job data: ${validation.errors.join(', ')}`);
    }
    
    const { data: sanitizedJobData } = validation;
    
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
      body: JSON.stringify(sanitizedJobData)
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
    
    // Log performance metrics for successful operation
    logPerformance('trackJobApplication', startTime, {
      success: true,
      jobId: data.job?.id
    });
    
    return data;
  } catch (error) {
    // ✅ ENHANCED: Production-ready error reporting using centralized logger
    logError(error, 'trackJobApplication', {
      jobData: jobData ? Object.keys(jobData) : null,
      apiUrl: API_BASE_URL,
      isDevMode: USE_TEST_ENDPOINTS
    });
    
    // Log additional error context if available
    if (error.response) {
      logApiError(error.response, 'trackJobApplication', {
        jobData: jobData ? Object.keys(jobData) : null
      });
    }
    
    // Log performance metrics
    logPerformance('trackJobApplication', startTime, {
      success: false,
      error: error.message
    });
    
    // Show user-friendly error notification
    const userMessage = getUserFriendlyMessage(error);
    showErrorNotification('JobSchedule Error', userMessage);
    
    throw error;
  }
} 