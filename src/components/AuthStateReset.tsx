'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthStateResetInner() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const authError = searchParams.get('error');
    const reason = searchParams.get('reason');
    const autoReset = searchParams.get('auto_reset');

    if (authError === 'auth_failed') {
      console.log('🔍 Auth error detected:', { authError, reason, autoReset });
      console.log('🔍 Clearing authentication state...');

      if (typeof window !== 'undefined') {
        // Clear all localStorage
        localStorage.clear();
        console.log('🔍 localStorage cleared');
        
        // Clear all sessionStorage
        sessionStorage.clear();
        console.log('🔍 sessionStorage cleared');
        
        // Clear all cookies more aggressively
        const cookies = document.cookie.split(";");
        console.log('🔍 Found cookies:', cookies.length);
        
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          // Clear cookie with various path and domain combinations
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=jobschedule.io`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.jobschedule.io`;
        });

        // Clear Kinde-specific storage
        const kindeKeys = [
          'kinde_token',
          'kinde_refresh_token', 
          'kinde_user',
          'kinde_state',
          'kinde_code_verifier',
          'kinde_nonce'
        ];
        
        kindeKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        // Clear any other potential auth-related keys
        const authKeys = Object.keys(localStorage).filter(key => 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('user') ||
          key.toLowerCase().includes('session') ||
          key.toLowerCase().includes('state')
        );
        
        authKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        // Clear browser cache for this domain
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('kinde') || name.includes('auth') || name.includes('job') || name.includes('schedule')) {
                caches.delete(name);
                console.log('🔍 Cleared cache:', name);
              }
            });
          });
        }

        console.log('🔍 Authentication state cleared, redirecting to home...');
        
        // Force a complete page reload to ensure clean state
        window.location.href = '/';
      }
    }
  }, [searchParams]);

  return null;
}

export function AuthStateReset() {
  return (
    <Suspense fallback={null}>
      <AuthStateResetInner />
    </Suspense>
  );
} 