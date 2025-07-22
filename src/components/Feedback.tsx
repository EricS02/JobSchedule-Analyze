"use client";
import React, { useEffect, useState } from 'react';
import { useTheme } from "next-themes";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Get board token from environment variable or use fallback
const BoardToken = process.env.NEXT_PUBLIC_CANNY_BOARD_TOKEN || '6575155d-84fb-8b47-17e8-372da13b27eb';

const Feedback = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadCanny = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load Canny SDK if not already loaded
      (function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s);e.type="text/javascript",e.async=!0,e.src="https://canny.io/sdk.js",f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c=function(){c.q.push(arguments)};c.q=[],w.Canny=c,"complete"===d.readyState?l():w.attachEvent?w.attachEvent("onload",l):w.addEventListener("load",l,!1)}})(window,document,"canny-jssdk","script");

      // Wait for Canny to be available
      const initCanny = () => {
        if (typeof window.Canny !== 'undefined') {
          const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
          
          try {
            Canny('render', {
              boardToken: BoardToken,
              basePath: null,
              ssoToken: null,
              theme: theme,
            });
            setIsLoading(false);
            console.log('Canny feedback widget loaded successfully');
          } catch (err) {
            console.error('Error rendering Canny widget:', err);
            setError('Failed to load feedback widget');
            setIsLoading(false);
          }
        } else {
          // Retry after a short delay if Canny isn't loaded yet
          if (retryCount < 10) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              initCanny();
            }, 500);
          } else {
            setError('Failed to load feedback widget after multiple attempts');
            setIsLoading(false);
          }
        }
      };

      initCanny();
    } catch (err) {
      console.error('Error loading Canny SDK:', err);
      setError('Failed to initialize feedback widget');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    loadCanny();
  }, [mounted, resolvedTheme, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    loadCanny();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Feedback Widget Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          {error}. This could be due to network issues or configuration problems.
        </p>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>If the problem persists, please contact support.</p>
          <p>Board Token: {BoardToken.substring(0, 8)}...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading feedback widget...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-canny />
  );
}

export default Feedback; 