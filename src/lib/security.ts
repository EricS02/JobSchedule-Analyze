import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Input sanitization functions
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  }).trim();
}

export function sanitizeText(input: string): string {
  if (!input) return '';
  // Remove potential script tags and dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

// Enhanced validation schemas
export const secureStringSchema = z.string()
  .min(1)
  .max(1000)
  .transform(sanitizeHtml);

export const secureTextSchema = z.string()
  .min(1)
  .max(10000)
  .transform(sanitizeText);

export const emailSchema = z.string()
  .email()
  .max(255)
  .transform(sanitizeText);

export const urlSchema = z.string()
  .url()
  .max(2000)
  .transform(sanitizeText);

// Rate limiting implementation
export function createRateLimit(windowMs: number, max: number) {
  const requests = new Map();
  
  return (identifier: string) => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    const validRequests = userRequests.filter((time: number) => now - time < windowMs);
    
    if (validRequests.length >= max) {
      throw new Error('Rate limit exceeded');
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
  };
}

// File validation
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Size check
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 1MB)' };
  }
  
  // Type check
  if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Extension check
  const extension = file.name.toLowerCase().split('.').pop();
  const allowedExtensions = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
  
  if (!extension || !allowedExtensions.includes(`.${extension}`)) {
    return { valid: false, error: 'File extension does not match type' };
  }
  
  // Basic content validation
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  
  // Check PDF signature
  if (file.type === 'application/pdf') {
    const header = Array.from(uint8Array.slice(0, 4)).map(b => String.fromCharCode(b)).join('');
    if (header !== '%PDF') {
      return { valid: false, error: 'Invalid PDF file' };
    }
  }
  
  return { valid: true };
}

// Secure file naming
export function getSecureFileName(originalName: string): string {
  // Remove any path traversal attempts
  const safeName = originalName.split('/').pop() || originalName;
  
  // Add timestamp and random string for uniqueness
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const extension = safeName.split('.').pop() || '';
  const nameWithoutExt = safeName.replace(`.${extension}`, '');
  
  // Sanitize name
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  return `${sanitizedName}_${timestamp}_${random}.${extension}`;
}

// CSRF protection
export function validateCSRF(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;
  
  // Allow localhost for development
  if (process.env.NODE_ENV === 'development') {
    return origin.includes('localhost') || origin.includes('127.0.0.1');
  }
  
  // Production validation
  return origin.includes(host);
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Input length validation
export function validateInputLength(input: string, min: number, max: number): boolean {
  return input.length >= min && input.length <= max;
}

// SQL injection prevention (basic)
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(UNION|SELECT)\b.*\b(FROM|WHERE)\b)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// XSS prevention
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
} 