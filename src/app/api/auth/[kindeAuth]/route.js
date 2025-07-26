import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";

export const GET = handleAuth({
  onError: (err, req) => {
    console.error('🔍 Kinde auth error:', err);
    console.error('🔍 Error message:', err.message);
    console.error('🔍 Request URL:', req.url);

    // Handle state mismatch specifically
    if (err.message && (
      err.message.includes('State not found') || 
      err.message.includes('State mismatch') ||
      err.message.includes('Authentication flow')
    )) {
      console.log('🔍 State mismatch detected, redirecting to home with error param');
      
      // Clear any potential cookies that might be causing issues
      const response = Response.redirect(new URL('/?error=auth_failed&reason=state_mismatch', req.url));
      
      // Add headers to clear authentication state
      response.headers.set('Set-Cookie', [
        'kinde_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
        'kinde_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
        'kinde_user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
      ].join(', '));
      
      return response;
    }

    // Handle other authentication errors
    console.log('🔍 Other auth error, redirecting to home');
    const url = new URL('/?error=auth_failed&reason=unknown', req.url);
    return Response.redirect(url);
  }
});