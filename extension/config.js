// Configuration file for JobSchedule extension
// This file can be modified during the build process to switch environments

const CONFIG = {
  // Environment: 'development' or 'production'
  ENVIRONMENT: 'development',
  
  // API Configuration
  API: {
    development: {
      BASE_URL: 'http://localhost:3000/api',
      USE_TEST_ENDPOINTS: true,
      DEBUG_MODE: true,
      ALLOW_DEV_ENDPOINTS: true
    },
    production: {
      BASE_URL: 'https://your-production-api.com/api',
      USE_TEST_ENDPOINTS: false,
      DEBUG_MODE: false,
      ALLOW_DEV_ENDPOINTS: false
    }
  },
  
  // Security Settings
  SECURITY: {
    MAX_TEXT_LENGTH: 500,
    MAX_HTML_LENGTH: 2000,
    MAX_URL_LENGTH: 500,
    ALLOWED_PROTOCOLS: ['http:', 'https:']
  },
  
  // LinkedIn Configuration
  LINKEDIN: {
    ALLOWED_DOMAINS: [
      'linkedin.com',
      'www.linkedin.com'
    ],
    ALLOWED_PATHS: [
      '/jobs/',
      '/job/'
    ]
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  // For browser environment
  window.JobScheduleConfig = CONFIG;
} 