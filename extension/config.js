// ✅ SOLUTION: Environment-based configuration
const API_BASE_URL = chrome.runtime.getManifest().version.includes('dev') 
  ? 'http://localhost:3000/api' 
  : 'https://jobschedule.io/api';

const USE_TEST_ENDPOINTS = chrome.runtime.getManifest().version.includes('dev');

export { API_BASE_URL, USE_TEST_ENDPOINTS }; 