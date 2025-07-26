"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import React, { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Proactive state clearing on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for stale authentication state
      const hasStaleState = () => {
        const kindeKeys = ['kinde_token', 'kinde_refresh_token', 'kinde_user', 'kinde_state'];
        return kindeKeys.some(key => localStorage.getItem(key) || sessionStorage.getItem(key));
      };

      // Check for URL parameters indicating auth issues
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthError = urlParams.get('error') === 'auth_failed';

      // Clear state if we detect issues
      if (hasAuthError || hasStaleState()) {
        console.log('🔍 Proactive state clearing detected');
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });

        // Clean URL if there are error parameters
        if (hasAuthError) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('error');
          cleanUrl.searchParams.delete('reason');
          cleanUrl.searchParams.delete('auto_reset');
          window.history.replaceState({}, '', cleanUrl.toString());
        }
      }
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