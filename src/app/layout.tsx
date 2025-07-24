import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { validateProductionEnv } from "@/lib/config";
import logger from "@/lib/logger";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobSchedule - Track Your Job Applications",
  description: "Streamline your job application process with our comprehensive tracking system powered by AI.",
};

// Validate production environment variables (only at runtime, not build time)
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  // Only run validation on the server side during runtime
  try {
    validateProductionEnv();
    logger.info('Production environment validation passed');
  } catch (error) {
    logger.error('Production environment validation failed', error as Error);
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
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
