'use client';

import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthRedirect() {
  const { isAuthenticated, isLoading } = useKindeAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're on the home page and user is authenticated
    if (!isLoading && isAuthenticated && window.location.pathname === '/') {
      console.log('AuthRedirect - Client-side redirect to dashboard');
      // Use a small delay to ensure the page has loaded
      setTimeout(() => {
        router.replace('/dashboard');
      }, 100);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state for authenticated users on home page
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state for authenticated users on home page
  if (isAuthenticated && window.location.pathname === '/') {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // This component doesn't render anything for unauthenticated users
  return null;
} 