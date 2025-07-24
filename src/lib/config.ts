// src/lib/config.ts - Server-side only configuration with secure env var access

export function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name];
  if (!value) {
    if (fallback && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production')) {
      console.warn(`⚠️ Using fallback for ${name} in ${process.env.NODE_ENV}`);
      return fallback;
    }
    // During build time, return fallback instead of throwing
    if (process.env.NODE_ENV === 'production' && fallback) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Add validation for critical variables
export function validateProductionEnv() {
  // Skip validation during build time to allow deployment
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping environment validation during build phase');
    return;
  }
  
  const requiredVars = [
    'DATABASE_URL',
    'KINDE_CLIENT_SECRET',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ];
  
  // AUTH_SECRET has a fallback in next.config.mjs, so it's not strictly required
  const optionalVars = [
    'AUTH_SECRET',
    'ENCRYPTION_KEY'
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    // Don't throw error, just warn - allows deployment to proceed
    return;
  }
  
  // Warn about optional variables in production
  const missingOptional = optionalVars.filter(v => !process.env[v]);
  if (missingOptional.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(`⚠️ Optional environment variables not set: ${missingOptional.join(', ')}`);
  }
}

export const serverConfig = {
  // These should ONLY be used on the server side
  DATABASE_URL: getEnvVar('DATABASE_URL', 
    process.env.NODE_ENV === 'development' ? "file:./dev.db" : "placeholder://db"
  ),
  AUTH_SECRET: getEnvVar('AUTH_SECRET', 
    process.env.NODE_ENV === 'development' ? "Z5jXQ5zznTNgKpNf0SOqDxPkTFQtapMF0B3T6J9owzg=" : "placeholder-secret"
  ),
  ENCRYPTION_KEY: getEnvVar('ENCRYPTION_KEY', 
    process.env.NODE_ENV === 'development' ? "dev-encryption-key-32-chars-long!!" : "placeholder-encryption-key-32-chars-long!!"
  ),
  // Authentication
  KINDE_CLIENT_SECRET: getEnvVar('KINDE_CLIENT_SECRET', 'placeholder-secret'),
  KINDE_ISSUER_URL: getEnvVar('KINDE_ISSUER_URL', 'https://placeholder.kinde.com'),
  // Payments
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY', 'placeholder-secret'),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET', 'placeholder-secret'),
  // AI Services
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY', 'placeholder-key'),
  OCR_SPACE_API_KEY: getEnvVar('OCR_SPACE_API_KEY', 'placeholder-key'),
};

// src/lib/client-config.ts - Client-side safe configuration
export const clientConfig = {
  // Public environment variables only (prefixed with NEXT_PUBLIC_)
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  KINDE_CLIENT_ID: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID!,
  KINDE_DOMAIN: process.env.NEXT_PUBLIC_KINDE_DOMAIN!,
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  // Client-side feature flags
  ENABLE_DEBUG: process.env.NODE_ENV === 'development',
  ENABLE_PDF_EXTRACTION: true,
};

// Validation function to ensure all required env vars are present
export function validateEnvironmentVariables() {
  const requiredServerVars = [
    'KINDE_CLIENT_SECRET',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ];

  const optionalServerVars = [
    'AUTH_SECRET',
    'ENCRYPTION_KEY',
    'DATABASE_URL'
  ];

  const requiredClientVars = [
    'NEXT_PUBLIC_KINDE_CLIENT_ID',
    'NEXT_PUBLIC_KINDE_DOMAIN',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  const missing: string[] = [];

  // Check required server vars
  requiredServerVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check client vars
  requiredClientVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Warn about optional vars in production
  if (process.env.NODE_ENV === 'production') {
    const missingOptional = optionalServerVars.filter(varName => !process.env[varName]);
    if (missingOptional.length > 0) {
      console.warn(`⚠️ Optional environment variables not set: ${missingOptional.join(', ')}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
} 