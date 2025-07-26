'use client';

import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';

export function UserDebug() {
  const { user, isAuthenticated, isLoading } = useKindeAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">User Debug Info:</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Email: {user?.email || 'None'}</div>
        <div>Given Name: {user?.given_name || 'None'}</div>
        <div>Family Name: {user?.family_name || 'None'}</div>
        <div>Picture: {user?.picture ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
} 