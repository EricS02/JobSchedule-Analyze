// Background script for JobSchedule extension
console.log("JobSchedule: Background script loaded");

// Configuration
const API_BASE_URL = 'https://jobschedule.io/api';
const USE_TEST_ENDPOINTS = false; // Set to false for production

// Add connection timeout and retry logic
const CONNECTION_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// Rate limiter for security
const rateLimiter = {
  requests: new Map(),
  isAllowed: function(userKey) {
    const now = Date.now();
    const userRequests = this.requests.get(userKey) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    // Allow max 10 requests per minute
    if (recentRequests.length >= 10) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(userKey, recentRequests);
    return true;
  }
};

// Security logging
function logSecurityEvent(event, data = {}) {
  console.warn(`JobSchedule: Security Event - ${event}`, {
    timestamp: new Date().toISOString(),
    extensionVersion: chrome.runtime.getManifest().version,
    ...data
  });
}

// Error logging with context
function logError(error, context, additionalData = {}) {
  console.error(`JobSchedule: Error in ${context}`, {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    extensionVersion: chrome.runtime.getManifest().version,
    ...additionalData
  });
}

// Performance logging
function logPerformance(operation, startTime, additionalData = {}) {
  const duration = Date.now() - startTime;
  console.log(`JobSchedule: Performance - ${operation} took ${duration}ms`, {
    duration,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

// Message validation
function isValidMessage(message) {
  return message && 
         typeof message === 'object' && 
         message.action && 
         typeof message.action === 'string';
}

// Job data validation
function validateJobData(jobData) {
  const errors = [];
  const sanitized = {};
  
  // Required fields
  if (!jobData.jobTitle || typeof jobData.jobTitle !== 'string') {
    errors.push('jobTitle is required and must be a string');
  } else {
    sanitized.jobTitle = jobData.jobTitle.trim().substring(0, 200);
  }
  
  if (!jobData.company || typeof jobData.company !== 'string') {
    errors.push('company is required and must be a string');
  } else {
    sanitized.company = jobData.company.trim().substring(0, 200);
  }
  
  if (!jobData.location || typeof jobData.location !== 'string') {
    errors.push('location is required and must be a string');
  } else {
    sanitized.location = jobData.location.trim().substring(0, 200);
  }
  
  // Optional fields with sanitization
  if (jobData.description) {
    sanitized.description = jobData.description.trim().substring(0, 2000);
  }
  
  if (jobData.jobUrl && typeof jobData.jobUrl === 'string') {
    sanitized.jobUrl = jobData.jobUrl.trim().substring(0, 500);
  }
  
  if (jobData.logoUrl && typeof jobData.logoUrl === 'string') {
    sanitized.logoUrl = jobData.logoUrl.trim().substring(0, 500);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: sanitized
  };
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
    
    // Handle the job tracking asynchronously
    (async () => {
      try {
        const result = await trackJobApplication(message.jobData);
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
      } catch (error) {
        // ✅ ENHANCED: Production-ready error reporting for job tracking
        logError(error, 'job tracking in message handler', {
          sender: sender?.tab?.url || 'unknown',
          jobData: message.jobData ? Object.keys(message.jobData) : null
        });
        
        // User-friendly error message
        const userMessage = getUserFriendlyMessage(error);
        sendResponse({ success: false, message: userMessage });
      }
    })();
    
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
  
  if (message.type === 'EXTENSION_TOKEN_READY' && message.token) {
    console.log('JobSchedule: Received extension token from content script');
    chrome.storage.local.set({ 
      token: message.token,
      user: message.user || { email: 'user@example.com' }
    });
    sendResponse({ success: true });
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
    
    console.log("JobSchedule: API_BASE_URL:", API_BASE_URL);
    
    // Get token from storage
    const { token } = await chrome.storage.local.get('token');
    console.log("JobSchedule: Token from storage:", token ? "Found" : "Not found");
    console.log("JobSchedule: USE_TEST_ENDPOINTS:", USE_TEST_ENDPOINTS);
    console.log("JobSchedule: API_BASE_URL:", API_BASE_URL);
    
    if (!token && USE_TEST_ENDPOINTS) {
      // Try to get a test token in development mode
      try {
        console.log("JobSchedule: Attempting to get test token from:", `${API_BASE_URL}/test-token`);
        const tokenResponse = await fetch(`${API_BASE_URL}/test-token`);
        console.log("JobSchedule: Test token response status:", tokenResponse.status);
        const tokenData = await tokenResponse.json();
        console.log("JobSchedule: Test token data:", tokenData);
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
      console.log("JobSchedule: No token found, requiring login");
      console.log("JobSchedule: Please log in to JobSync at https://jobschedule.io to get started");
      throw new Error("Not authenticated. Please log in to JobSync first at https://jobschedule.io");
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
    
    // Test connection before sending data
    console.log("JobSchedule: Testing API connection before sending job data...");
    const connectionTest = await testAPIConnection();
    if (!connectionTest) {
      console.warn("JobSchedule: API connection test failed, but continuing with job submission...");
    }
    
    // Send data to backend with timeout and retry logic
    console.log("JobSchedule: Sending data to backend with token");
    console.log("JobSchedule: Request URL:", `${API_BASE_URL}/jobs/extension`);
    console.log("JobSchedule: Request headers:", {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${updatedToken.substring(0, 20)}...`
    });
    console.log("JobSchedule: Request body:", sanitizedJobData);
    
    let response;
    let lastError;
    
    // Retry logic for connection issues
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`JobSchedule: Attempt ${attempt}/${MAX_RETRIES} to connect to API`);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
        
        response = await fetch(`${API_BASE_URL}/jobs/extension`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${updatedToken}`
          },
          body: JSON.stringify(sanitizedJobData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`JobSchedule: Connection successful on attempt ${attempt}`);
        break; // Success, exit retry loop
        
      } catch (fetchError) {
        lastError = fetchError;
        console.error(`JobSchedule: Connection attempt ${attempt} failed:`, fetchError.message);
        
        if (attempt === MAX_RETRIES) {
          console.error("JobSchedule: All connection attempts failed");
          throw new Error(`Connection failed after ${MAX_RETRIES} attempts: ${fetchError.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`JobSchedule: Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
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
      
      // Handle specific error cases
      if (response.status === 409 && data.message) {
        // Duplicate job detected
        console.log("JobSchedule: Duplicate job detected:", data.duplicateDetails);
        throw new Error(data.message);
      }
      
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
    // Log performance metrics for failed operation
    logPerformance('trackJobApplication', startTime, {
      success: false,
      error: error.message
    });
    
    // Enhanced error logging
    console.error("JobSchedule: Detailed error in trackJobApplication:", {
      error: error.message,
      stack: error.stack,
      jobData: jobData ? {
        jobTitle: jobData.jobTitle?.substring(0, 50),
        company: jobData.company?.substring(0, 50),
        hasDescription: !!jobData.description,
        hasUrl: !!jobData.jobUrl
      } : null
    });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

// Helper function to get user-friendly error messages
function getUserFriendlyMessage(error) {
  if (error.message.includes('Not authenticated')) {
    return 'Please log in to JobSync at https://jobschedule.io to track job applications.';
  }
  if (error.message.includes('Server returned HTML')) {
    return 'Server is temporarily unavailable. Please try again later.';
  }
  if (error.message.includes('Invalid job data')) {
    return 'Invalid job information. Please try again.';
  }
  if (error.message.includes('Too many requests')) {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  if (error.message.includes('Connection failed')) {
    return 'Unable to connect to JobSync server. Please check your internet connection and try again.';
  }
  if (error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  if (error.message.includes('already tracked')) {
    return error.message;
  }
  return 'An error occurred while tracking your job application. Please try again.';
}

// Function to test API connectivity
async function testAPIConnection() {
  try {
    console.log("JobSchedule: Testing API connection...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/test-connection`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log("JobSchedule: API connection test successful:", response.status);
    return true;
  } catch (error) {
    console.error("JobSchedule: API connection test failed:", error.message);
    return false;
  }
}

// Listen for extension token from web app
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTENSION_TOKEN_READY' && message.token) {
    console.log('JobSchedule: Received extension token from web app');
    chrome.storage.local.set({ 
      token: message.token,
      user: message.user || { email: 'user@example.com' }
    });
    sendResponse({ success: true });
  }
});

// Listen for extension token from web app (via content script)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTENSION_TOKEN_READY' && message.token) {
    console.log('JobSchedule: Received extension token from web app');
    chrome.storage.local.set({ 
      token: message.token,
      user: message.user || { email: 'user@example.com' }
    });
    sendResponse({ success: true });
  }
}); 