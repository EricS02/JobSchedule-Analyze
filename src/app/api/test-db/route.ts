import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      result
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
      details: error
    }, { status: 500 });
  }
} 