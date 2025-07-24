"use client";
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export default function ExtensionListener() {
  useEffect(() => {
    // Listen for messages from Chrome extension
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data?.action === 'jobCreated') {
        console.log('JobSync: New job created via extension', event.data.jobData);
        
        // Trigger job update event
        window.dispatchEvent(new CustomEvent('jobUpdated'));
        
        // Show toast notification
        toast({
          variant: "success",
          title: "Job Application Tracked!",
          description: `Successfully tracked application for ${event.data.jobData?.title || 'new position'}`,
        });
      }
    };

    // Listen for Chrome extension messages
    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleExtensionMessage);
      
      // Also listen for Chrome runtime messages if available
      if ((window as any).chrome?.runtime?.onMessage) {
        const extensionMessageListener = (message: any, sender: any, sendResponse: any) => {
          if (message.action === 'jobCreated') {
            console.log('JobSync: New job created via extension', message.jobData);
            
            // Trigger job update event
            window.dispatchEvent(new CustomEvent('jobUpdated'));
            
            // Show toast notification
            toast({
              variant: "success",
              title: "Job Application Tracked!",
              description: `Successfully tracked application for ${message.jobData?.title || 'new position'}`,
            });
          }
        };
        
        (window as any).chrome.runtime.onMessage.addListener(extensionMessageListener);
        
        return () => {
          window.removeEventListener('message', handleExtensionMessage);
          if ((window as any).chrome?.runtime?.onMessage) {
            (window as any).chrome.runtime.onMessage.removeListener(extensionMessageListener);
          }
        };
      }
    }

    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, []);

  return null; // This component doesn't render anything
} 