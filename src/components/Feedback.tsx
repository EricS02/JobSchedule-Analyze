"use client";
import React, { useEffect, useState } from 'react';
import { useTheme } from "next-themes";

const BoardToken = '6575155d-84fb-8b47-17e8-372da13b27eb';

const Feedback = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Load Canny SDK if not already loaded
    (function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s);e.type="text/javascript",e.async=!0,e.src="https://canny.io/sdk.js",f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c=function(){c.q.push(arguments)};c.q=[],w.Canny=c,"complete"===d.readyState?l():w.attachEvent?w.attachEvent("onload",l):w.addEventListener("load",l,!1)}})(window,document,"canny-jssdk","script");

    // Wait for Canny to be available
    const initCanny = () => {
      if (typeof window.Canny !== 'undefined') {
        const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
        
        Canny('render', {
          boardToken: BoardToken,
          basePath: null,
          ssoToken: null,
          theme: theme, // Use the current theme
        });
      } else {
        // Retry after a short delay if Canny isn't loaded yet
        setTimeout(initCanny, 100);
      }
    };

    initCanny();
  }, [mounted, resolvedTheme]); // Re-run when theme changes

  return (
    <div data-canny />
  );
}

export default Feedback; 