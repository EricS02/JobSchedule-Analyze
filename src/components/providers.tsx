"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import React, { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Aggressive state clearing on mount and before auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clearAllAuthState = () => {
        console.log('🔍 Aggressive state clearing initiated');
        
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

      // Clear state on every page load
      clearAllAuthState();

      // Clear state before any navigation
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function(...args) {
        clearAllAuthState();
        return originalPushState.apply(this, args);
      };

      history.replaceState = function(...args) {
        clearAllAuthState();
        return originalReplaceState.apply(this, args);
      };

      // Clear state on beforeunload
      window.addEventListener('beforeunload', clearAllAuthState);

      // Clear state periodically
      const interval = setInterval(clearAllAuthState, 30000); // Every 30 seconds

      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', clearAllAuthState);
      };
    }
  }, []);

  return (
    <KindeProvider
      clientId={process.env.NEXT_PUBLIC_KINDE_CLIENT_ID}
      domain={process.env.NEXT_PUBLIC_KINDE_DOMAIN}
      logoutUri={process.env.NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI || "http://localhost:3000"}
      redirectUri={process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI || "http://localhost:3000"}
      isDangerouslyUseLocalStorage={false}
      useRefreshTokens={true}
      onRedirectCallback={(user: any, appState: any) => {
        console.log('🔍 Kinde redirect callback:', { user: user?.email, appState });
        // Clear any stale state on successful redirect
        if (typeof window !== 'undefined') {
          // Clear any error parameters from URL
          const url = new URL(window.location.href);
          url.searchParams.delete('error');
          url.searchParams.delete('reason');
          url.searchParams.delete('auto_reset');
          window.history.replaceState({}, '', url.toString());
          
          // Clear any remaining stale state
          const kindeKeys = ['kinde_state', 'kinde_code_verifier', 'kinde_nonce'];
          kindeKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });
        }
      }}
    >
      <NextThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemeProvider>
    </KindeProvider>
  );
} 