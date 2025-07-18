'use client';

import { refreshDashboard } from '@/actions/refresh.actions';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function ForceRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const handleForceRefresh = async () => {
    try {
      setIsRefreshing(true);
      toast({
        title: "Refreshing dashboard...",
        description: "Fetching the latest data from the database."
      });
      
      // Call our server action
      await refreshDashboard();
      
      // Use Next.js router refresh instead of full page reload
      router.refresh();
      
      toast({
        title: "Dashboard refreshed",
        description: `Data updated at ${new Date().toLocaleTimeString()}`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      onClick={handleForceRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Dashboard'}
    </Button>
  );
} 