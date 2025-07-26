'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthStateResetInner() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if there's an auth error in the URL
    const authError = searchParams.get('error');
    
    if (authError === 'auth_failed') {
      console.log('Auth error detected, clearing authentication state');
      
      // Clear any stored authentication state
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Redirect to home page to force a fresh authentication state
        window.location.href = '/';
      }
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}

export function AuthStateReset() {
  return (
    <Suspense fallback={null}>
      <AuthStateResetInner />
    </Suspense>
  );
} 