import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";

export const GET = handleAuth({
  onError: (err, req) => {
    console.error('Kinde auth error:', err);
    
    // Handle state mismatch errors by redirecting to home
    if (err.message && err.message.includes('State not found')) {
      console.log('State mismatch detected, redirecting to home');
      return Response.redirect(new URL('/', req.url));
    }
    
    // For other errors, redirect to home with error parameter
    const url = new URL('/', req.url);
    url.searchParams.set('error', 'auth_failed');
    return Response.redirect(url);
  }
});