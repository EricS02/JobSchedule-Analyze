"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ConnectGmailButton from "@/components/ConnectGmailButton";

export default function ExtensionPage() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/extension-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        toast({
          title: "Token Generated",
          description: "Your extension token has been generated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate token.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Token copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy token.",
        variant: "destructive",
      });
    }
  };

  const downloadExtension = () => {
    // This would typically link to your extension download
    window.open("/extension.zip", "_blank");
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Browser Extension Setup</h1>
          <p className="text-muted-foreground">
            Get your authentication token to use the JobSync browser extension
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Extension
            </CardTitle>
            <CardDescription>
              Download and install the JobSync browser extension to track job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadExtension} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Extension
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connect Gmail</CardTitle>
            <CardDescription>
              Connect your Gmail account to automatically update your job application statuses based on email updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectGmailButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Token</CardTitle>
            <CardDescription>
              Generate a token to authenticate your browser extension
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={generateToken} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Generating..." : "Generate Token"}
            </Button>

            {token && (
              <div className="space-y-2">
                <Label htmlFor="token">Your Extension Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="token"
                    value={token}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToken}
                    disabled={copied}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Copy this token and paste it into your browser extension settings
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Download the Extension</h4>
              <p className="text-sm text-muted-foreground">
                Download and install the JobSync browser extension from the link above.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Generate Token</h4>
              <p className="text-sm text-muted-foreground">
                Click "Generate Token" to create your authentication token.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Configure Extension</h4>
              <p className="text-sm text-muted-foreground">
                Open the extension settings and paste your token to authenticate.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">4. Start Tracking</h4>
              <p className="text-sm text-muted-foreground">
                The extension will now automatically track your job applications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 