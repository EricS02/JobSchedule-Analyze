"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
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
          window.history.replaceState({}, '', url.toString());
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