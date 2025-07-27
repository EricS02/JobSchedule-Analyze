import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { validateProductionEnv, debugEnvironmentVariables } from "@/lib/config";
import logger from "@/lib/logger";
import { AuthStateReset } from "@/components/AuthStateReset";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobSchedule - Track Your Job Applications",
  description: "Streamline your job application process with our comprehensive tracking system powered by AI.",
};

// Validate production environment variables (only at runtime, not build time)
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  // Only run validation on the server side during runtime, not during build
  try {
    console.log('🔍 === LAYOUT ENVIRONMENT DEBUG ===');
    debugEnvironmentVariables();
    validateProductionEnv();
    logger.info('Production environment validation passed');
    console.log('🔍 === END LAYOUT DEBUG ===');
  } catch (error) {
    logger.error('Production environment validation failed', error as Error);
    console.error('🚨 Environment validation failed in layout:', error);
    // Don't throw during build time, only during runtime
    if (typeof window === 'undefined' && !process.env.NEXT_PHASE) {
      throw error;
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Disable Vercel Toolbar
              if (typeof window !== 'undefined') {
                window.__VERCEL_TOOLBAR_DISABLED__ = true;
                window.__VERCEL_ANALYTICS_DISABLED__ = true;
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <AuthStateReset />
          {children}
        </Providers>
      </body>
    </html>
  );
}
