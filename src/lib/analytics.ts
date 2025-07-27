// Disable Vercel Analytics to prevent ad blocker issues
// import { track } from '@vercel/analytics';

// Custom analytics tracking functions (disabled to prevent ad blocker issues)
export const analytics = {
  // Track user actions
  trackUserAction: (action: string, properties?: Record<string, any>) => {
    // Disabled to prevent ad blocker issues
    console.log('Analytics disabled:', action, properties);
  },

  // Track job-related events
  trackJobEvent: (event: string, jobData?: Record<string, any>) => {
    // Disabled to prevent ad blocker issues
    console.log('Analytics disabled: job_', event, jobData);
  },

  // Track subscription events
  trackSubscriptionEvent: (event: string, subscriptionData?: Record<string, any>) => {
    // Disabled to prevent ad blocker issues
    console.log('Analytics disabled: subscription_', event, subscriptionData);
  },

  // Track AI feature usage
  trackAIEvent: (event: string, aiData?: Record<string, any>) => {
    // Disabled to prevent ad blocker issues
    console.log('Analytics disabled: ai_', event, aiData);
  },

  // Track page views (if needed beyond automatic tracking)
  trackPageView: (page: string, properties?: Record<string, any>) => {
    // Disabled to prevent ad blocker issues
    console.log('Analytics disabled: page_view', { page, ...properties });
  },

  // Track errors
  trackError: (error: string, errorData?: Record<string, any>) => {
    // Disabled to prevent ad blocker issues
    console.log('Analytics disabled: error', { error, ...errorData });
  },

  // Track feature usage
  trackFeatureUsage: (feature: string, properties?: Record<string, any>) => {
    // Disabled to prevent ad blocker issues
    console.log('Analytics disabled: feature_', feature, properties);
  }
};

// Analytics configuration
export const analyticsConfig = {
  // Disable analytics to prevent ad blocker issues
  enabled: false,
  
  // Custom properties to include with all events
  defaultProperties: {
    app: 'jobschedule',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV
  }
};

// Helper function to check if analytics is enabled
export const isAnalyticsEnabled = () => {
  return false; // Always disabled to prevent ad blocker issues
};

// Helper function to track with default properties
export const trackWithDefaults = (event: string, properties?: Record<string, any>) => {
  // Disabled to prevent ad blocker issues
  console.log('Analytics disabled:', event, {
    ...analyticsConfig.defaultProperties,
    ...properties
  });
}; 