'use client';

import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useEffect, useState } from 'react';

export function UserDebug() {
  const { user, isAuthenticated, isLoading } = useKindeAuth();
  const [authState, setAuthState] = useState<any>(null);
  const [localStorageState, setLocalStorageState] = useState<any>({});

  useEffect(() => {
    // Check localStorage for auth-related items
    if (typeof window !== 'undefined') {
      const authItems: Record<string, any> = {};
      const authKeys = [
        'kinde_token',
        'kinde_refresh_token',
        'kinde_user',
        'kinde_state',
        'kinde_code_verifier',
        'kinde_nonce'
      ];

      authKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          authItems[key] = value.substring(0, 50) + '...';
        }
      });

      setLocalStorageState(authItems);
    }
  }, []);

  useEffect(() => {
    // Check server-side auth state
    const checkAuthState = async () => {
      try {
        const response = await fetch('/api/debug/auth-state');
        const data = await response.json();
        setAuthState(data);
      } catch (error) {
        console.error('Failed to check auth state:', error);
      }
    };

    checkAuthState();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const clearAuthState = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">🔍 User Debug Info:</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
        <div>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Email: {user?.email || 'None'}</div>
        <div>Given Name: {user?.given_name || 'None'}</div>
        <div>Family Name: {user?.family_name || 'None'}</div>
        <div>Picture: {user?.picture ? '✅ Yes' : '❌ No'}</div>
        
        <hr className="my-2 border-gray-600" />
        
        <div className="font-semibold">LocalStorage Auth Items:</div>
        {Object.keys(localStorageState).length > 0 ? (
          Object.entries(localStorageState).map(([key, value]) => (
            <div key={key} className="text-gray-300">
              {key}: {String(value)}
            </div>
          ))
        ) : (
          <div className="text-gray-400">No auth items found</div>
        )}
        
        <hr className="my-2 border-gray-600" />
        
        <div className="font-semibold">Server Auth State:</div>
        <div>Server Auth: {authState?.auth?.isAuthenticated ? '✅ Yes' : '❌ No'}</div>
        <div>Server User: {authState?.auth?.user ? '✅ Yes' : '❌ No'}</div>
        
        <hr className="my-2 border-gray-600" />
        
        <div className="flex gap-2 mt-2">
          <button 
            onClick={clearAuthState}
            className="bg-orange-600 px-2 py-1 rounded text-xs hover:bg-orange-700"
          >
            Clear All Auth
          </button>
        </div>
      </div>
    </div>
  );
} 