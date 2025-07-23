"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

const ADMIN_EMAILS = [
  'admin@jobschedule.io',
  'eric@jobschedule.io',
];

export default function PremiumAccessManager() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useKindeAuth();

  // Check if current user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Admin access required.</p>
        </CardContent>
      </Card>
    );
  }

  const handleAction = async (action: 'grant' | 'revoke') => {
    if (!email.trim()) {
      setMessage("Please enter an email address");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/admin/grant-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), action }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setEmail("");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to update premium access");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium Access Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            User Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleAction('grant')}
            disabled={loading || !email.trim()}
            className="flex-1"
          >
            {loading ? "Granting..." : "Grant Premium"}
          </Button>
          <Button
            onClick={() => handleAction('revoke')}
            disabled={loading || !email.trim()}
            variant="outline"
            className="flex-1"
          >
            {loading ? "Revoking..." : "Revoke Premium"}
          </Button>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Granting premium access will give unlimited job tracking and AI features</p>
          <p>• Revoking will return the user to the free plan</p>
          <p>• Changes take effect immediately</p>
        </div>
      </CardContent>
    </Card>
  );
} 