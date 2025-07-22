// ✅ ERROR LOGGER: Centralized error handling for JobSchedule extension

import { logSecurityEvent } from './security.js';

/**
 * Enhanced error logging with context
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {object} additionalData - Additional data to log
 */
export function logError(error, context, additionalData = {}) {
  const errorLog = {
    error: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    extensionVersion: chrome.runtime.getManifest().version,
    ...additionalData
  };
  
  console.error(`JobSchedule: ${context}`, errorLog);
  
  // Log security event for critical errors
  if (isCriticalError(error)) {
    logSecurityEvent(`Critical error in ${context}`, {
      error: error.message,
      context: context,
      ...additionalData
    });
  }
}

/**
 * Determine if an error is critical
 * @param {Error} error - The error object
 * @returns {boolean} - True if critical
 */
function isCriticalError(error) {
  const criticalPatterns = [
    'authentication',
    'unauthorized',
    'forbidden',
    'network',
    'fetch',
    'connection',
    'timeout',
    '500',
    '502',
    '503'
  ];
  
  return criticalPatterns.some(pattern => 
    error.message.toLowerCase().includes(pattern)
  );
}

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly message
 */
export function getUserFriendlyMessage(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
    return 'Connection error. Please check your internet connection.';
  }
  
  if (message.includes('401') || message.includes('unauthorized')) {
    return 'Authentication error. Please log in again.';
  }
  
  if (message.includes('403') || message.includes('forbidden')) {
    return 'Access denied. Please check your permissions.';
  }
  
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return 'Server error. Please try again later.';
  }
  
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (message.includes('invalid job data') || message.includes('validation')) {
    return 'Invalid job information. Please check the job details.';
  }
  
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many requests. Please wait before trying again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log API response errors with full context
 * @param {Response} response - The fetch response
 * @param {string} context - Context where the error occurred
 * @param {object} additionalData - Additional data to log
 */
export async function logApiError(response, context, additionalData = {}) {
  try {
    const responseData = await response.json();
    console.error(`JobSchedule: API Error in ${context}`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString(),
      extensionVersion: chrome.runtime.getManifest().version,
      ...additionalData
    });
  } catch (e) {
    console.error(`JobSchedule: Could not parse API error response in ${context}`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      parseError: e.message,
      timestamp: new Date().toISOString(),
      extensionVersion: chrome.runtime.getManifest().version,
      ...additionalData
    });
  }
}

/**
 * Show error notification to user
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export function showErrorNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: title,
    message: message
  });
}

/**
 * Log performance metrics
 * @param {string} operation - Operation name
 * @param {number} startTime - Start time in milliseconds
 * @param {object} additionalData - Additional data to log
 */
export function logPerformance(operation, startTime, additionalData = {}) {
  const duration = Date.now() - startTime;
  console.log(`JobSchedule: Performance - ${operation}`, {
    duration: `${duration}ms`,
    operation: operation,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
  
  // Log slow operations as warnings
  if (duration > 5000) {
    console.warn(`JobSchedule: Slow operation detected - ${operation} took ${duration}ms`);
  }
}

/**
 * Log extension lifecycle events
 * @param {string} event - Lifecycle event
 * @param {object} additionalData - Additional data to log
 */
export function logLifecycleEvent(event, additionalData = {}) {
  console.log(`JobSchedule: Lifecycle - ${event}`, {
    event: event,
    timestamp: new Date().toISOString(),
    extensionVersion: chrome.runtime.getManifest().version,
    ...additionalData
  });
} 