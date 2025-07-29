// ✅ SOLUTION: Environment-based configuration
const isDevelopment = chrome.runtime.getManifest().name.includes('Dev') || 
                     chrome.runtime.getManifest().version.includes('dev') ||
                     chrome.runtime.getManifest().version === '1.0.1';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000/api' 
  : 'https://jobschedule.io/api';

const USE_TEST_ENDPOINTS = isDevelopment;

export { API_BASE_URL, USE_TEST_ENDPOINTS }; 