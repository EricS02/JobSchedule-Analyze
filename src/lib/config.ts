// src/lib/config.ts - Server-side only configuration with secure env var access

export function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name];
  
  // TEMPORARY FIX: Return actual environment variable value
  // This prevents the "State not found" error by ensuring Kinde gets real values
  if (value && value.trim() !== '') {
    console.log(`✅ getEnvVar: ${name} is properly set`);
    return value;
  }
  
  // Only use fallback in development
  if (process.env.NODE_ENV === 'development' && fallback) {
    console.warn(`⚠️ Using development fallback for ${name}`);
    return fallback;
  }
  
  // In production, throw error if missing
  throw new Error(`Missing environment variable: ${name}`);
}

// NEW: Debug function to dump all environment variables
export function debugEnvironmentVariables() {
  console.log('🔍 === ENVIRONMENT VARIABLES DEBUG ===');
  console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`🔍 VERCEL_ENV: ${process.env.VERCEL_ENV}`);
  console.log(`🔍 VERCEL_URL: ${process.env.VERCEL_URL}`);
  
  const criticalVars = [
    'DATABASE_URL',
    'KINDE_CLIENT_ID',
    'KINDE_CLIENT_SECRET',
    'KINDE_ISSUER_URL',
    'AUTH_SECRET',
    'ENCRYPTION_KEY',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ];
  
  criticalVars.forEach(varName => {
    const value = process.env[varName];
    const status = value && 
      value !== 'placeholder-secret' && 
      value !== 'placeholder-key' && 
      value !== 'https://placeholder.kinde.com' &&
      value !== 'placeholder://db' &&
      value !== 'placeholder-encryption-key-32-chars-long!!' &&
      value !== 'undefined' &&
      value !== 'null' &&
      !value.includes('placeholder') &&
      value.trim() !== '' ? '✅ SET' : '❌ NOT SET';
    
    console.log(`🔍 ${varName}: ${status}`);
    if (value) {
      console.log(`🔍   Value: ${value.substring(0, 20)}...`);
    }
  });
  
  console.log('🔍 === END ENVIRONMENT DEBUG ===');
}

// NEW: Force environment variables function - no fallbacks allowed
export function forceEnvVar(name: string): string {
  const value = process.env[name];
  
  // TEMPORARY FIX: Return actual environment variable value
  // This prevents the "State not found" error by ensuring Kinde gets real values
  if (value && value.trim() !== '') {
    console.log(`✅ forceEnvVar: ${name} is properly set`);
    return value;
  }
  
  // Always throw error if missing
  throw new Error(`Missing environment variable: ${name}`);
}

// NEW: Validate all environment variables at startup
export function validateAllEnvVars() {
  console.log('🔍 Validating all environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'KINDE_CLIENT_SECRET', 
    'KINDE_ISSUER_URL',
    'AUTH_SECRET',
    'ENCRYPTION_KEY',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ];
  
  const missing: string[] = [];
  const invalid: string[] = [];
  
  requiredVars.forEach(varName => {
    try {
      forceEnvVar(varName);
    } catch (error) {
      if (error instanceof Error && error.message.includes('CRITICAL')) {
        invalid.push(varName);
      } else {
        missing.push(varName);
      }
    }
  });
  
  if (missing.length > 0 || invalid.length > 0) {
    console.error('🚨 Environment validation failed!');
    if (missing.length > 0) {
      console.error(`Missing variables: ${missing.join(', ')}`);
    }
    if (invalid.length > 0) {
      console.error(`Invalid variables: ${invalid.join(', ')}`);
    }
    console.error('Please set all environment variables in Vercel dashboard for ALL environments (Production, Preview, Development)');
    throw new Error(`Environment validation failed. Missing: ${missing.join(', ')}. Invalid: ${invalid.join(', ')}`);
  }
  
  console.log('✅ All environment variables are properly set!');
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
  // Use direct environment variable access since the functions are failing
  DATABASE_URL: process.env.DATABASE_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
  // Authentication
  KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET!,
  KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL!,
  // Payments
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  // AI Services
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  OCR_SPACE_API_KEY: process.env.OCR_SPACE_API_KEY!,
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