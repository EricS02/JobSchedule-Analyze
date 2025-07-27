'use client';

import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { Button } from '@/components/ui/button';

export function AuthButtons() {
  const { isAuthenticated, isLoading } = useKindeAuth();

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

  // Don't render if already authenticated or loading
  if (isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="flex gap-4">
      <Button asChild variant="outline" onClick={clearStateBeforeAuth}>
        <LoginLink>Sign In</LoginLink>
      </Button>
      <Button asChild onClick={clearStateBeforeAuth}>
        <RegisterLink>Sign Up</RegisterLink>
      </Button>
    </div>
  );
} 