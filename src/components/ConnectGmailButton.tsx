import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { toast } from './ui/use-toast';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

export default function ConnectGmailButton({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          setLoading(true);
          try {
            // For Google Sign-In, we get a credential (JWT token)
            // We need to exchange this for Gmail API access tokens
            const res = await fetch("/api/store-gmail-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('kinde_token')}`,
              },
              body: JSON.stringify({
                credential: credentialResponse.credential,
                // Note: For Gmail API access, we'll need to implement proper OAuth 2.0 flow
                // This is a placeholder for now
              }),
            });
            if (res.ok) {
              toast({ title: "Gmail Connected!", description: "Your Gmail account is now linked." });
              onSuccess?.();
            } else {
              toast({ title: "Failed to connect Gmail", description: "Please try again.", variant: "destructive" });
            }
          } catch (e) {
            toast({ title: "Google OAuth failed", description: "An error occurred.", variant: "destructive" });
          } finally {
            setLoading(false);
          }
        }}
        onError={() => toast({ title: "Google OAuth failed", description: "Please try again.", variant: "destructive" })}
        useOneTap={false}
        theme="filled_blue"
        text="continue_with"
      />
    </GoogleOAuthProvider>
  );
} 