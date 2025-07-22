// ✅ SECURITY: Centralized security utilities for JobSchedule extension

/**
 * Sanitize string input with length limits
 * @param {any} str - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null} - Sanitized string or null if invalid
 */
export function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return null;
  const sanitized = str.trim().substring(0, maxLength);
  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {object} data - Event data
 */
export function logSecurityEvent(event, data = {}) {
  console.warn(`JobSchedule Security: ${event}`, {
    ...data,
    timestamp: new Date().toISOString(),
    extensionVersion: chrome.runtime.getManifest().version
  });
}

/**
 * Validate job data structure
 * @param {object} jobData - Job data to validate
 * @returns {object} - Validation result with sanitized data
 */
export function validateJobData(jobData) {
  const errors = [];
  const sanitized = {};
  
  // Required fields
  const jobTitle = sanitizeString(jobData.jobTitle, 200);
  const company = sanitizeString(jobData.company, 200);
  
  if (!jobTitle) errors.push('Invalid job title');
  if (!company) errors.push('Invalid company name');
  
  // Optional fields
  sanitized.location = sanitizeString(jobData.location, 200) || "Remote";
  sanitized.description = sanitizeString(jobData.description, 5000) || "No description available";
  sanitized.detailedDescription = sanitizeString(jobData.detailedDescription, 10000);
  sanitized.jobRequirements = sanitizeString(jobData.jobRequirements, 5000);
  sanitized.jobResponsibilities = sanitizeString(jobData.jobResponsibilities, 5000);
  sanitized.jobBenefits = sanitizeString(jobData.jobBenefits, 2000);
  sanitized.logoUrl = sanitizeString(jobData.logoUrl, 500);
  
  // URL validation
  if (jobData.jobUrl) {
    if (isValidUrl(jobData.jobUrl)) {
      sanitized.jobUrl = sanitizeString(jobData.jobUrl, 500);
    } else {
      errors.push('Invalid job URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: { jobTitle, company, ...sanitized }
  };
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
  
  clear() {
    this.requests.clear();
  }
} 