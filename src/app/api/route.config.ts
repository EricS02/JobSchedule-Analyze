// Configuration to prevent static generation for API routes that use Prisma
export const apiConfig = {
  // Force dynamic rendering for all API routes that use Prisma
  dynamic: 'force-dynamic' as const,
  
  // Disable static generation
  revalidate: 0,
  
  // Prevent caching
  fetchCache: 'force-no-store' as const,
}; 