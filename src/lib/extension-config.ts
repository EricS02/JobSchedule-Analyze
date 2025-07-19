// Extension Configuration
export const EXTENSION_CONFIG = {
  // Chrome Web Store URL - Replace with your actual extension ID when published
  CHROME_WEB_STORE_URL: process.env.NEXT_PUBLIC_CHROME_WEB_STORE_URL || 
    "https://chrome.google.com/webstore/detail/jobschedule-job-application/your-extension-id-here",
  
  // Extension ID - Replace with your actual extension ID
  EXTENSION_ID: process.env.NEXT_PUBLIC_EXTENSION_ID || "your-extension-id-here",
  
  // Extension name
  EXTENSION_NAME: "JobSchedule - Job Application Tracker",
  
  // Extension description
  EXTENSION_DESCRIPTION: "Track your job applications from LinkedIn with one click",
  
  // Extension version
  EXTENSION_VERSION: "1.0.0",
  
  // Supported browsers
  SUPPORTED_BROWSERS: ["Chrome", "Edge", "Brave"],
  
  // Minimum Chrome version
  MIN_CHROME_VERSION: "88",
  
  // Features
  FEATURES: [
    "One-click job tracking from LinkedIn",
    "Automatic job data extraction",
    "Secure data storage",
    "AI-powered job matching",
    "Analytics dashboard",
    "Resume optimization"
  ]
};

// Development vs Production settings
export const getExtensionConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    ...EXTENSION_CONFIG,
    // Use different URLs for development vs production
    CHROME_WEB_STORE_URL: isDevelopment 
      ? "https://chrome.google.com/webstore/detail/jobschedule-job-application/your-extension-id-here"
      : EXTENSION_CONFIG.CHROME_WEB_STORE_URL,
    
    // Development settings
    DEBUG_MODE: isDevelopment,
    API_BASE_URL: isDevelopment 
      ? "http://localhost:3000/api"
      : "https://your-production-domain.com/api"
  };
}; 