import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";

export const GET = handleAuth({
  onError: (err, req) => {
    console.error('🔍 Kinde auth error:', err);
    console.error('🔍 Error message:', err.message);
    console.error('🔍 Request URL:', req.url);
    console.error('🔍 Request headers:', Object.fromEntries(req.headers.entries()));

    // Handle state mismatch specifically
    if (err.message && (
      err.message.includes('State not found') || 
      err.message.includes('State mismatch') ||
      err.message.includes('Authentication flow')
    )) {
      console.log('🔍 State mismatch detected, redirecting to home with comprehensive state reset');
      
      // Create response with multiple cookie clearing strategies
      const response = Response.redirect(new URL('/?error=auth_failed&reason=state_mismatch&auto_reset=true', req.url));
      
      // Clear all possible authentication cookies
      const cookiesToClear = [
        'kinde_token',
        'kinde_refresh_token', 
        'kinde_user',
        'kinde_state',
        'kinde_code_verifier',
        'kinde_nonce',
        'next-auth.session-token',
        'next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.session-token',
        '__Secure-next-auth.csrf-token',
        '__Host-next-auth.csrf-token'
      ];
      
      const cookieHeaders = cookiesToClear.map(cookie => 
        `${cookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`
      );
      
      // Add domain-specific cookie clearing
      const domainCookies = cookiesToClear.map(cookie => 
        `${cookie}=; Path=/; Domain=jobschedule.io; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`
      );
      
      response.headers.set('Set-Cookie', [...cookieHeaders, ...domainCookies].join(', '));
      
      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    }

    // Handle other authentication errors
    console.log('🔍 Other auth error, redirecting to home');
    const url = new URL('/?error=auth_failed&reason=unknown', req.url);
    return Response.redirect(url);
  }
});