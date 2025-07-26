'use client';

import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { Button } from '@/components/ui/button';

export function AuthButtons() {
  const { login, register } = useKindeAuth();

  const clearStateBeforeAuth = () => {
    console.log('🔍 Clearing state before authentication attempt');
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear with multiple domain/path combinations
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=jobschedule.io`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.jobschedule.io`;
    });

    // Clear browser cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  };

  const handleLogin = () => {
    clearStateBeforeAuth();
    setTimeout(() => login(), 100); // Small delay to ensure state is cleared
  };

  const handleSignup = () => {
    clearStateBeforeAuth();
    setTimeout(() => register(), 100); // Small delay to ensure state is cleared
  };

  return (
    <div className="flex gap-4">
      <Button onClick={handleLogin} variant="outline">
        Sign In
      </Button>
      <Button onClick={handleSignup}>
        Sign Up
      </Button>
    </div>
  );
} 