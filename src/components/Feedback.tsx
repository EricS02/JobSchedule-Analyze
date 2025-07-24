"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from "next-themes";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Get board token from environment variable or use fallback
const BoardToken = process.env.NEXT_PUBLIC_CANNY_BOARD_TOKEN || '6575155d-84fb-8b47-17e8-372da13b27eb';

declare global {
  interface Window {
    Canny?: any;
  }
}

const Feedback = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [widgetContentVisible, setWidgetContentVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadCanny = useCallback(() => {
    console.log('Loading Canny widget...');
    setIsLoading(true);
    setError(null);
    setWidgetLoaded(false);

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Loading timeout reached');
      setError('Loading timeout - please check your internet connection');
      setIsLoading(false);
    }, 15000); // 15 second timeout

    try {
      // Load Canny SDK if not already loaded
      (function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s) as HTMLScriptElement;e.type="text/javascript",e.async=!0,e.src="https://canny.io/sdk.js";if(f.parentNode)f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c = function(){(c as any).q.push(arguments)} as any;c.q=[],w.Canny=c,"complete"===d.readyState?l():(w as any).attachEvent?(w as any).attachEvent("onload",l):w.addEventListener("load",l,!1)}})(window,document,"canny-jssdk","script");

      // Wait for Canny to be available
      const initCanny = () => {
        console.log('Checking if Canny is available...');
        if (typeof window.Canny !== 'undefined') {
          const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
          console.log('Canny available, rendering with theme:', theme);
          
          try {
            window.Canny('render', {
              boardToken: BoardToken,
              basePath: null,
              ssoToken: null,
              theme: theme,
              // Add additional configuration for better compatibility
              target: '[data-canny]',
              hideBranding: false,
            });
            clearTimeout(timeout);
            setIsLoading(false);
            setWidgetLoaded(true);
            console.log('Canny feedback widget loaded successfully');
            
            // Debug: Check if the widget element exists and content appears
            setTimeout(() => {
              const widgetElement = document.querySelector('[data-canny]');
              console.log('Widget element found:', widgetElement);
              if (widgetElement) {
                console.log('Widget element dimensions:', {
                  width: widgetElement.clientWidth,
                  height: widgetElement.clientHeight,
                  offsetWidth: (widgetElement as HTMLElement).offsetWidth,
                  offsetHeight: (widgetElement as HTMLElement).offsetHeight
                });
                
                // Check for Canny content
                const cannyContent = widgetElement.querySelector('.canny-board, .canny-post, .canny-feedback');
                console.log('Canny content found:', cannyContent);
                
                if (!cannyContent) {
                  console.log('No Canny content found, checking for iframe...');
                  const iframe = widgetElement.querySelector('iframe');
                  console.log('Iframe found:', iframe);
                  
                  if (iframe) {
                    console.log('Iframe dimensions:', {
                      width: iframe.clientWidth,
                      height: iframe.clientHeight,
                      src: iframe.src
                    });
                    setWidgetContentVisible(true);
                  } else {
                    // Check again after a longer delay
                    setTimeout(() => {
                      const retryContent = widgetElement.querySelector('.canny-board, .canny-post, .canny-feedback, iframe');
                      if (retryContent) {
                        console.log('Content found on retry:', retryContent);
                        setWidgetContentVisible(true);
                      } else {
                        console.log('No content found after retry');
                        setWidgetContentVisible(false);
                      }
                    }, 3000);
                  }
                } else {
                  setWidgetContentVisible(true);
                }
              }
            }, 2000); // Increased delay to allow content to render
          } catch (err) {
            console.error('Error rendering Canny widget:', err);
            clearTimeout(timeout);
            setError('Failed to load feedback widget');
            setIsLoading(false);
          }
        } else {
          console.log('Canny not available yet, retry count:', retryCount);
          // Retry after a short delay if Canny isn't loaded yet
          if (retryCount < 10) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              initCanny();
            }, 500);
          } else {
            console.log('Max retries reached, showing error');
            clearTimeout(timeout);
            setError('Failed to load feedback widget after multiple attempts');
            setIsLoading(false);
          }
        }
      };

      initCanny();
    } catch (err) {
      console.error('Error loading Canny SDK:', err);
      clearTimeout(timeout);
      setError('Failed to initialize feedback widget');
      setIsLoading(false);
    }
  }, [resolvedTheme, retryCount]);

  useEffect(() => {
    if (!mounted) return;
    console.log('Component mounted, starting to load Canny');
    loadCanny();
  }, [mounted, loadCanny]);

  const handleRetry = () => {
    setRetryCount(0);
    loadCanny();
  };

  // Debug: Log current state
  console.log('Feedback component state:', {
    mounted,
    isLoading,
    error,
    widgetLoaded,
    retryCount
  });

  // Show loading state immediately
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Initializing feedback widget...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-xs text-muted-foreground mt-2">Attempt {retryCount + 1} of 10</p>
        </div>
      </div>
    );
  }

  // Show the widget container
  return (
    <div className="w-full h-full min-h-[600px] border border-gray-200 dark:border-gray-700">
      <div data-canny className="w-full h-full" />
      
      {widgetLoaded && !widgetContentVisible && (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Widget loaded, waiting for content...</p>
            <p className="text-xs text-muted-foreground mt-2 mb-4">
              If content doesn't appear, try refreshing
            </p>
            <div className="space-y-2">
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Widget
              </Button>
              <div className="text-xs text-muted-foreground">
                <p>Or visit our feedback board directly:</p>
                <a 
                  href={`https://canny.io/boards/${BoardToken}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Open Feedback Board
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {widgetLoaded && widgetContentVisible && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Feedback widget loaded successfully
        </div>
      )}
      
      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 dark:bg-gray-900">
        <p>Debug Info:</p>
        <p>Board Token: {BoardToken.substring(0, 20)}...</p>
        <p>Theme: {resolvedTheme}</p>
        <p>Widget Loaded: {widgetLoaded ? 'Yes' : 'No'}</p>
        <p>Content Visible: {widgetContentVisible ? 'Yes' : 'No'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
      </div>
    </div>
  );
}

export default Feedback; 