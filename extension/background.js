// Background script for JobSchedule extension
console.log("JobSchedule: Background script loaded");

// Environment Configuration Management
const CONFIG = {
  production: {
    API_BASE_URL: 'https://your-production-api.com/api',
    USE_TEST_ENDPOINTS: false,
    DEBUG_MODE: false,
    ALLOW_DEV_ENDPOINTS: false
  },
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    USE_TEST_ENDPOINTS: true,
    DEBUG_MODE: true,
    ALLOW_DEV_ENDPOINTS: true
  }
};

// Determine environment (you can set this during build process)
const ENVIRONMENT = 'development'; // Change to 'production' for production builds
const CURRENT_CONFIG = CONFIG[ENVIRONMENT];

// Rate Limiting
const rateLimiter = {
  requests: new Map(),
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  
  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
};

// Session Management
const sessionManager = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  async isSessionValid() {
    const { sessionTimestamp } = await chrome.storage.local.get('sessionTimestamp');
    if (!sessionTimestamp) return false;
    
    const now = Date.now();
    return (now - sessionTimestamp) < this.SESSION_TIMEOUT;
  },
  
  async refreshSession() {
    await chrome.storage.local.set({ sessionTimestamp: Date.now() });
  }
};

// Token Encryption Functions
async function generateEncryptionKey() {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptToken(token) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const key = await generateEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Store key securely (in a real implementation, you'd use a more secure method)
    const keyData = await crypto.subtle.exportKey('raw', key);
    return { 
      encrypted: Array.from(new Uint8Array(encrypted)), 
      iv: Array.from(iv), 
      key: Array.from(keyData)
    };
  } catch (error) {
    console.error('Token encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
}

async function decryptToken(encryptedData) {
  try {
    const { encrypted, iv, key } = encryptedData;
    const keyBuffer = new Uint8Array(key);
    const ivBuffer = new Uint8Array(iv);
    const encryptedBuffer = new Uint8Array(encrypted);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      cryptoKey,
      encryptedBuffer
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Token decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
}

// Token Validation
async function validateToken(token) {
  try {
    const response = await fetch(`${CURRENT_CONFIG.API_BASE_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Request Signing
async function signRequest(data, timestamp) {
  try {
    const message = JSON.stringify(data) + timestamp;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.generateKey(
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(signature));
  } catch (error) {
    console.error('Request signing failed:', error);
    throw new Error('Failed to sign request');
  }
}

// API Call with Retry Logic
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (i === maxRetries - 1) throw new Error('Max retries exceeded');
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}

// Enhanced Data Validation
function validateJobData(jobData) {
  const errors = [];
  
  if (!jobData.jobTitle || jobData.jobTitle.length < 2) {
    errors.push('Job title too short');
  }
  
  if (!jobData.company || jobData.company.length < 2) {
    errors.push('Company name too short');
  }
  
  if (jobData.jobUrl && !jobData.jobUrl.includes('linkedin.com')) {
    errors.push('Invalid job URL');
  }
  
  if (errors.length > 0) {
    throw new Error('Validation failed: ' + errors.join(', '));
  }
  
  return true;
}

// Content Integrity Verification
async function verifyContentIntegrity(jobData) {
  const requiredFields = ['jobTitle', 'company', 'jobUrl'];
  const missingFields = requiredFields.filter(field => !jobData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Verify URL is from LinkedIn
  if (!jobData.jobUrl.includes('linkedin.com')) {
    throw new Error('Job URL must be from LinkedIn');
  }
  
  return true;
}

// Input Sanitization Functions
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"'&]/g, '') // Remove dangerous characters
    .trim()
    .substring(0, 500); // Limit length
}

function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return '';
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
    .substring(0, 2000); // Limit length
}

function validateURL(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return url.substring(0, 500); // Limit length
  } catch {
    return null;
  }
}

function sanitizeJobData(jobData) {
  return {
    jobTitle: sanitizeText(jobData.jobTitle) || "Unknown Position",
    company: sanitizeText(jobData.company) || "Unknown Company",
    location: sanitizeText(jobData.location) || "Remote",
    description: sanitizeHTML(jobData.description) || "No description available",
    detailedDescription: sanitizeHTML(jobData.detailedDescription) || null,
    jobRequirements: sanitizeHTML(jobData.jobRequirements) || null,
    jobResponsibilities: sanitizeHTML(jobData.jobResponsibilities) || null,
    jobBenefits: sanitizeHTML(jobData.jobBenefits) || null,
    jobUrl: validateURL(jobData.jobUrl) || window.location.href,
    logoUrl: validateURL(jobData.logoUrl) || null
  };
}

// Secure Error Handling
function handleError(error, userMessage) {
  if (CURRENT_CONFIG.DEBUG_MODE) {
    console.error("JobSchedule Debug:", error);
  }
  
  // Show user-friendly notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'JobSchedule Error',
    message: userMessage || "An error occurred while tracking the job"
  });
}

// Add this to your background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("JobSchedule: Extension installed/updated");
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (CURRENT_CONFIG.DEBUG_MODE) {
    console.log("JobSchedule: Message received in background", message);
  }
  
  if (message.action === 'trackJobApplication') {
    trackJobApplication(message.jobData)
      .then(result => {
        if (CURRENT_CONFIG.DEBUG_MODE) {
          console.log("JobSchedule: Job tracked successfully", result);
        }
        
        // Notify all tabs that a job was updated (only in development)
        if (CURRENT_CONFIG.ALLOW_DEV_ENDPOINTS) {
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
                    if (CURRENT_CONFIG.DEBUG_MODE) {
                      console.warn("JobSchedule: Could not send message to tab", tab.id, e);
                    }
                  }
                });
              } catch (e) {
                if (CURRENT_CONFIG.DEBUG_MODE) {
                  console.warn("JobSchedule: Error iterating tabs for jobCreated message", e);
                }
              }
            }
          });
        }
        
        sendResponse({ success: true, message: "Job tracked successfully" });
      })
      .catch(error => {
        handleError(error, "Failed to track job application");
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
        handleError(error, "Authentication check failed");
        sendResponse({ isAuthenticated: false, error: error.message });
      });
    
    return true;
  }
});

// Listen for context invalidation
chrome.runtime.onSuspend.addListener(() => {
  if (CURRENT_CONFIG.DEBUG_MODE) {
    console.log("JobSchedule: Extension being suspended");
  }
  // Perform any cleanup here
});

// Function to check if user is authenticated
async function checkAuthentication() {
  try {
    const { encryptedToken } = await chrome.storage.local.get('encryptedToken');
    if (!encryptedToken) return false;
    
    const token = await decryptToken(encryptedToken);
    const isValid = await validateToken(token);
    
    if (!isValid) {
      // Clear invalid token
      await chrome.storage.local.remove('encryptedToken');
      return false;
    }
    
    // Refresh session
    await sessionManager.refreshSession();
    return true;
  } catch (error) {
    handleError(error, "Authentication check failed");
    return false;
  }
}

// Function to send job data to backend
async function trackJobApplication(jobData) {
  try {
    if (CURRENT_CONFIG.DEBUG_MODE) {
      console.log("JobSchedule: Tracking job application", jobData);
    }
    
    // Rate limiting check
    const userId = 'default'; // In a real app, get actual user ID
    if (!rateLimiter.isAllowed(userId)) {
      throw new Error("Rate limit exceeded. Please wait before making another request.");
    }
    
    // Sanitize and validate input data
    const sanitizedJobData = sanitizeJobData(jobData);
    validateJobData(sanitizedJobData);
    await verifyContentIntegrity(sanitizedJobData);
    
    // Check session validity
    if (!(await sessionManager.isSessionValid())) {
      throw new Error("Session expired. Please log in again.");
    }
    
    // Get encrypted token from storage
    const { encryptedToken } = await chrome.storage.local.get('encryptedToken');
    
    // Handle authentication
    let authToken = null;
    
    if (encryptedToken) {
      try {
        authToken = await decryptToken(encryptedToken);
        const isValid = await validateToken(authToken);
        if (!isValid) {
          await chrome.storage.local.remove('encryptedToken');
          authToken = null;
        }
      } catch (error) {
        await chrome.storage.local.remove('encryptedToken');
        authToken = null;
      }
    }
    
    if (!authToken && CURRENT_CONFIG.USE_TEST_ENDPOINTS) {
      // Try to get a test token in development mode only
      try {
        const tokenResponse = await fetch(`${CURRENT_CONFIG.API_BASE_URL}/test-token`);
        if (!tokenResponse.ok) {
          throw new Error("Could not retrieve test token");
        }
        
        const tokenData = await tokenResponse.json();
        if (tokenData.token) {
          // Encrypt and save the token
          const encrypted = await encryptToken(tokenData.token);
          await chrome.storage.local.set({ 
            encryptedToken: encrypted,
            user: tokenData.user || { email: 'test@example.com' }
          });
          authToken = tokenData.token;
          if (CURRENT_CONFIG.DEBUG_MODE) {
            console.log("JobSchedule: Retrieved and saved encrypted test token");
          }
        } else {
          throw new Error("Invalid test token response");
        }
      } catch (tokenError) {
        handleError(tokenError, "Authentication failed. Please log in to JobSchedule.");
        throw new Error("Not authenticated. Please log in to JobSchedule.");
      }
    } else if (!authToken) {
      // In production, require login
      throw new Error("Not authenticated. Please log in to JobSchedule first.");
    }
    
    // Validate required fields
    if (!sanitizedJobData.jobTitle || !sanitizedJobData.company) {
      throw new Error("Missing required job information. Please try again.");
    }
    
    // Test connection in development mode only
    if (CURRENT_CONFIG.USE_TEST_ENDPOINTS) {
      try {
        const testResponse = await fetch(`${CURRENT_CONFIG.API_BASE_URL}/test-connection`);
        if (!testResponse.ok) {
          if (CURRENT_CONFIG.DEBUG_MODE) {
            console.warn("JobSchedule: Server connection test failed");
          }
        } else if (CURRENT_CONFIG.DEBUG_MODE) {
          console.log("JobSchedule: Server connection test successful");
        }
      } catch (testError) {
        if (CURRENT_CONFIG.DEBUG_MODE) {
          console.warn("JobSchedule: Server connection test failed", testError);
        }
        // Continue anyway, don't throw an error
      }
    }
    
    // Prepare request with signing
    const timestamp = Date.now().toString();
    const requestData = {
      ...sanitizedJobData,
      timestamp
    };
    
    // Sign the request
    const signature = await signRequest(requestData, timestamp);
    
    // Send data to backend with retry logic
    if (CURRENT_CONFIG.DEBUG_MODE) {
      console.log("JobSchedule: Sending data to backend with encrypted token");
    }
    
    const response = await apiCallWithRetry(`${CURRENT_CONFIG.API_BASE_URL}/jobs/extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Request-Signature': btoa(String.fromCharCode(...signature)),
        'X-Request-Timestamp': timestamp
      },
      body: JSON.stringify(requestData)
    });
    
    if (CURRENT_CONFIG.DEBUG_MODE) {
      console.log("JobSchedule: Backend response status:", response.status);
    }
    
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error("Server returned HTML instead of JSON. The server might be down or misconfigured.");
    }
    
    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error("Invalid response from server");
    }
    
    if (!response.ok) {
      if (CURRENT_CONFIG.DEBUG_MODE) {
        console.error("JobSchedule: Error response from server:", data);
      }
      throw new Error(data.message || `HTTP error ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.message || "Failed to track job application");
    }
    
    // Refresh session on successful request
    await sessionManager.refreshSession();
    
    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'JobSchedule',
      message: 'Job application tracked successfully!'
    });
    
    if (CURRENT_CONFIG.DEBUG_MODE) {
      console.log("JobSchedule: Response from backend:", data);
    }
    
    return data;
  } catch (error) {
    handleError(error, "Failed to track job application");
    throw error;
  }
} 