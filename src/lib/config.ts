// Environment configuration
export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
    urlUnpooled: process.env.DATABASE_URL_UNPOOLED,
  },
  
  // Authentication
  auth: {
    secret: process.env.AUTH_SECRET,
    kinde: {
      clientId: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID,
      domain: process.env.NEXT_PUBLIC_KINDE_DOMAIN,
      redirectUri: process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI,
      logoutRedirectUri: process.env.NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI,
    },
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    ocr: {
      apiKey: process.env.OCR_SPACE_API_KEY,
    },
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  
  // Gmail Integration
  gmail: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },
  
  // Security
  security: {
    cors: {
      allowedOrigins: [
        'http://localhost:3000',
        'https://your-production-domain.com', // Replace with your domain
      ],
    },
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
    },
    requestLimits: {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxJsonSize: 1024 * 1024, // 1MB
    },
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    logDirectory: process.env.LOG_DIRECTORY || 'logs',
  },
  
  // Features
  features: {
    ai: {
      enabled: process.env.ENABLE_AI_FEATURES !== 'false',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet'],
    },
    gmail: {
      enabled: process.env.ENABLE_GMAIL_INTEGRATION !== 'false',
    },
    pdf: {
      enabled: process.env.ENABLE_PDF_PARSING !== 'false',
    },
  },
};

// Validation function to check required environment variables
export function validateConfig() {
  const requiredVars = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXT_PUBLIC_KINDE_CLIENT_ID',
    'NEXT_PUBLIC_KINDE_DOMAIN',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  return true;
}

// Helper function to get configuration for specific environment
export function getConfigForEnv(env: 'development' | 'production' | 'test') {
  const envConfig = {
    development: {
      logging: { level: 'debug' },
      security: { cors: { allowedOrigins: ['http://localhost:3000'] } },
    },
    production: {
      logging: { level: 'warn' },
      security: { cors: { allowedOrigins: [config.api.baseUrl] } },
    },
    test: {
      logging: { level: 'error' },
      security: { cors: { allowedOrigins: ['http://localhost:3000'] } },
    },
  };
  
  return { ...config, ...envConfig[env] };
}

export default config; 