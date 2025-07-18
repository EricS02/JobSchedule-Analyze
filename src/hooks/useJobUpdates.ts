"use client";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export function useJobUpdates() {
  const router = useRouter();

  // Function to refresh the current page data
  const refreshData = useCallback(() => {
    router.refresh();
  }, [router]);

  // Listen for job updates via browser events
  useEffect(() => {
    const handleJobUpdate = () => {
      refreshData();
    };

    // Listen for custom events
    window.addEventListener('jobUpdated', handleJobUpdate);
    
    // Listen for focus events to refresh when user returns to tab
    window.addEventListener('focus', handleJobUpdate);

    return () => {
      window.removeEventListener('jobUpdated', handleJobUpdate);
      window.removeEventListener('focus', handleJobUpdate);
    };
  }, [refreshData]);

  // Function to trigger job update event
  const triggerJobUpdate = useCallback(() => {
    window.dispatchEvent(new CustomEvent('jobUpdated'));
  }, []);

  return {
    refreshData,
    triggerJobUpdate
  };
} 