"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSessionStorage } from "@/hooks/useSessionStorage";

export default function ConnectGmailButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { value: gmailToken, setValue: setGmailToken, loading: tokenLoading } = useSessionStorage<string>("gmail_token", "");

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    
    try {
      // Check if user is authenticated
      const tokenResponse = await fetch("/api/auth/extension-token");
      if (!tokenResponse.ok) {
        throw new Error("Authentication required");
      }
      
      const tokenData = await tokenResponse.json();
      const authToken = tokenData.token;

      // Initiate Gmail OAuth flow
      const response = await fetch("/api/store-gmail-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to connect Gmail");
      }

      const data = await response.json();
      
      if (data.success) {
        await setGmailToken(data.token || "connected");
        setIsConnected(true);
        toast({
          title: "Gmail Connected",
          description: "Your Gmail account has been successfully connected.",
        });
      } else {
        throw new Error(data.message || "Failed to connect Gmail");
      }
    } catch (error) {
      console.error("Gmail connection error:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Gmail account.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await setGmailToken("");
      setIsConnected(false);
      toast({
        title: "Gmail Disconnected",
        description: "Your Gmail account has been disconnected.",
      });
    } catch (error) {
      console.error("Gmail disconnection error:", error);
      toast({
        variant: "destructive",
        title: "Disconnection Failed",
        description: "Failed to disconnect Gmail account.",
      });
    }
  };

  if (tokenLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gmail Integration</CardTitle>
          <CardDescription>Loading connection status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isGmailConnected = isConnected || !!gmailToken;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <CardTitle>Gmail Integration</CardTitle>
        </div>
        <CardDescription>
          Connect your Gmail account to automatically track job-related emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isGmailConnected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Connected</span>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Not Connected</span>
                <Badge variant="outline" className="text-xs">
                  Inactive
                </Badge>
              </>
            )}
          </div>
          
          {isGmailConnected ? (
            <Button
              variant="outline"
              onClick={handleDisconnectGmail}
              disabled={isConnecting}
              className="flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
              <span>Disconnect</span>
            </Button>
          ) : (
            <Button
              onClick={handleConnectGmail}
              disabled={isConnecting}
              className="flex items-center space-x-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Connect Gmail</span>
                </>
              )}
            </Button>
          )}
        </div>

        {isGmailConnected && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Gmail Integration Active
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Job-related emails will be automatically tracked and added to your dashboard.
            </p>
          </div>
        )}

        {!isGmailConnected && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Connect your Gmail account to automatically track job applications, 
              interview invitations, and other job-related communications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 