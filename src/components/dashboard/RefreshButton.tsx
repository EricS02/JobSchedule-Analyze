'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function RefreshButton() {
  const router = useRouter();
  
  const handleRefresh = () => {
    // Force a hard refresh of the page data
    router.refresh();
    
    // Additional approach: manually trigger a server action to refresh data
    // You could call one of your dashboard actions here if needed
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleRefresh}
      aria-label="Refresh dashboard"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Refresh
    </Button>
  );
} 