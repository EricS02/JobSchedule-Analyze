"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    // Auto-refresh every 30 seconds to keep data current
    const interval = setInterval(() => {
      router.refresh();
      setLastRefresh(Date.now());
    }, 30000); // 30 seconds

    // Listen for visibility change to refresh when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        router.refresh();
        setLastRefresh(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for storage events to refresh when jobs are added via extension
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobsync-job-added') {
        router.refresh();
        setLastRefresh(Date.now());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Clean up
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  return (
    <>
      {children}
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 text-xs text-muted-foreground bg-background/80 p-2 rounded" suppressHydrationWarning>
          Last refresh: {new Date(lastRefresh).toLocaleTimeString()}
        </div>
      )}
    </>
  );
} 