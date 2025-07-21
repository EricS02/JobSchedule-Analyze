// src/lib/config.ts - Server-side only configuration with secure env var access

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const serverConfig = {
  // These should ONLY be used on the server side
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  AUTH_SECRET: getEnvVar('AUTH_SECRET'),
  ENCRYPTION_KEY: getEnvVar('ENCRYPTION_KEY'),
  // Authentication
  KINDE_CLIENT_SECRET: getEnvVar('KINDE_CLIENT_SECRET'),
  KINDE_ISSUER_URL: getEnvVar('KINDE_ISSUER_URL'),
  // Payments
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET'),
  // AI Services
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  OCR_SPACE_API_KEY: getEnvVar('OCR_SPACE_API_KEY'),
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
    'DATABASE_URL',
    'AUTH_SECRET', 
    'ENCRYPTION_KEY',
    'KINDE_CLIENT_SECRET',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ];

  const requiredClientVars = [
    'NEXT_PUBLIC_KINDE_CLIENT_ID',
    'NEXT_PUBLIC_KINDE_DOMAIN',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  const missing: string[] = [];

  // Check server vars
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

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
} 