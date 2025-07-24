// src/lib/env-validator.ts - Environment variable validation

import { validateAllEnvVars } from './config';

// Call this function at app startup to validate all environment variables
export function validateEnvironmentOnStartup() {
  try {
    validateAllEnvVars();
    console.log('✅ Environment validation passed - all variables are properly set');
  } catch (error) {
    console.error('🚨 Environment validation failed:', error);
    // In production, this will cause the app to fail fast
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

// Call this function to check environment variables without throwing
export function checkEnvironmentVariables() {
  const vars = [
    'DATABASE_URL',
    'KINDE_CLIENT_SECRET',
    'KINDE_ISSUER_URL', 
    'AUTH_SECRET',
    'ENCRYPTION_KEY',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ];
  
  const status: Record<string, { set: boolean; value: string }> = {};
  
  vars.forEach(varName => {
    const value = process.env[varName];
    status[varName] = {
      set: !!(value && 
        value !== 'placeholder-secret' && 
        value !== 'placeholder-key' && 
        value !== 'https://placeholder.kinde.com' &&
        value !== 'placeholder://db' &&
        value !== 'placeholder-encryption-key-32-chars-long!!' &&
        value !== 'undefined' &&
        value !== 'null' &&
        value.trim() !== ''),
      value: value || 'NOT SET'
    };
  });
  
  return status;
} 