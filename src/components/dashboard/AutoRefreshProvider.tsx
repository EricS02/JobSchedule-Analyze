'use client';

import { refreshDashboard } from '@/actions/refresh.actions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AutoRefreshProviderProps {
  children: React.ReactNode;
  interval?: number; // in milliseconds
}

export default function AutoRefreshProvider({ 
  children, 
  interval = 30000 // Default to 30 seconds
}: AutoRefreshProviderProps) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);

  // Function to refresh data
  const refreshData = async () => {
    try {
      console.log(`Auto-refreshing dashboard at ${new Date().toLocaleTimeString()}`);
      await refreshDashboard();
      router.refresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  };

  // Set up interval for auto-refresh
  useEffect(() => {
    const refreshTimer = setInterval(refreshData, interval);
    
    // Clean up on unmount
    return () => clearInterval(refreshTimer);
  }, [interval, refreshData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Only update time on client after mounting
    setCurrentTime(new Date().toLocaleTimeString());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div>
      {/* Optional: Show last refresh time */}
      {mounted && currentTime && (
        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
          Last updated: {currentTime}
        </div>
      )}
      {children}
    </div>
  );
} 