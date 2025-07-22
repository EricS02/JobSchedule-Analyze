import { track } from '@vercel/analytics';

// Custom analytics tracking functions
export const analytics = {
  // Track user actions
  trackUserAction: (action: string, properties?: Record<string, any>) => {
    track(action, properties);
  },

  // Track job-related events
  trackJobEvent: (event: string, jobData?: Record<string, any>) => {
    track(`job_${event}`, jobData);
  },

  // Track subscription events
  trackSubscriptionEvent: (event: string, subscriptionData?: Record<string, any>) => {
    track(`subscription_${event}`, subscriptionData);
  },

  // Track AI feature usage
  trackAIEvent: (event: string, aiData?: Record<string, any>) => {
    track(`ai_${event}`, aiData);
  },

  // Track page views (if needed beyond automatic tracking)
  trackPageView: (page: string, properties?: Record<string, any>) => {
    track('page_view', { page, ...properties });
  },

  // Track errors
  trackError: (error: string, errorData?: Record<string, any>) => {
    track('error', { error, ...errorData });
  },

  // Track feature usage
  trackFeatureUsage: (feature: string, properties?: Record<string, any>) => {
    track(`feature_${feature}`, properties);
  }
};

// Analytics configuration
export const analyticsConfig = {
  // Enable/disable analytics based on environment
  enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  
  // Custom properties to include with all events
  defaultProperties: {
    app: 'jobschedule',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV
  }
};

// Helper function to check if analytics is enabled
export const isAnalyticsEnabled = () => {
  return analyticsConfig.enabled;
};

// Helper function to track with default properties
export const trackWithDefaults = (event: string, properties?: Record<string, any>) => {
  if (isAnalyticsEnabled()) {
    track(event, {
      ...analyticsConfig.defaultProperties,
      ...properties
    });
  }
}; 