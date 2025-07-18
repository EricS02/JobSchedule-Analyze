// Set to true for development, false for production
const DEV_MODE = true;

const API_BASE_URL = DEV_MODE 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const USE_TEST_ENDPOINTS = DEV_MODE;

export { API_BASE_URL, USE_TEST_ENDPOINTS }; 