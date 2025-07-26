'use client';

import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function AuthStateReset() {
  const { logout } = useKindeAuth();
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
        
        // Force logout
        logout();
      }
    }
  }, [searchParams, logout]);

  return null; // This component doesn't render anything
} 