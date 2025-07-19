"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Chrome, 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Zap,
  Users,
  BarChart3,
  ExternalLink,
  Store
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getExtensionConfig } from "@/lib/extension-config";

export default function ExtensionPage() {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [isCheckingExtension, setIsCheckingExtension] = useState(true);
  const config = getExtensionConfig();

  // Check if extension is installed
  useEffect(() => {
    const checkExtension = () => {
      // Try to communicate with the extension
      if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
        try {
          // This will only work if the extension is installed
          window.chrome.runtime.sendMessage(config.EXTENSION_ID, { action: 'ping' }, (response) => {
            if (response && response.status === 'ok') {
              setIsExtensionInstalled(true);
            }
          });
        } catch (error) {
          // Extension not installed or communication failed
          setIsExtensionInstalled(false);
        }
      }
      setIsCheckingExtension(false);
    };

    // Check after a short delay to allow page to load
    const timer = setTimeout(checkExtension, 1000);
    return () => clearTimeout(timer);
  }, [config.EXTENSION_ID]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Chrome Extension
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Download JobSchedule Extension
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Install our Chrome extension from the official Chrome Web Store to automatically track job applications from LinkedIn with just one click.
          </p>
        </div>

        {/* Extension Status */}
        {!isCheckingExtension && (
          <div className="max-w-2xl mx-auto mb-8">
            {isExtensionInstalled ? (
              <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CardContent className="flex items-center gap-4 p-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Extension Installed!</h3>
                    <p className="text-green-700 dark:text-green-300">Great! The JobSchedule extension is already installed in your browser.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="flex items-center gap-4 p-6">
                  <Download className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">Extension Not Detected</h3>
                    <p className="text-blue-700 dark:text-blue-300">Install the JobSchedule extension to start tracking your job applications.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Extension Features */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>One-Click Tracking</CardTitle>
              <CardDescription>
                Click "Track with JobSchedule" on any LinkedIn job posting to automatically save it to your dashboard.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and stored securely. We never share your information with third parties.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>
                Get insights into your job search progress with detailed analytics and AI-powered recommendations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Download Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Install JobSchedule Extension</CardTitle>
              <CardDescription className="text-lg">
                Follow these simple steps to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Download from Chrome Web Store */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Install from Chrome Web Store</h3>
                  <p className="text-muted-foreground mb-4">
                    Click the button below to install the JobSchedule extension from the official Chrome Web Store.
                  </p>
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" asChild>
                    <a href={config.CHROME_WEB_STORE_URL} target="_blank" rel="noopener noreferrer">
                      <Store className="w-4 h-4 mr-2" />
                      Install from Chrome Web Store
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will open the Chrome Web Store in a new tab. Click "Add to Chrome" to install.
                  </p>
                </div>
              </div>

              {/* Step 2: Verify Installation */}
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Verify Installation</h3>
                  <p className="text-muted-foreground mb-4">
                    After installation, refresh this page to verify the extension is working correctly.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="mb-2"
                  >
                    Refresh Page to Check
                  </Button>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">What to expect:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Extension icon appears in your Chrome toolbar</li>
                      <li>• "Track with JobSchedule" button appears on LinkedIn job pages</li>
                      <li>• Green checkmark appears above when installation is detected</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3: Sign Up */}
              <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Create Your Account</h3>
                  <p className="text-muted-foreground mb-4">
                    Sign up for a free JobSchedule account to start tracking your job applications.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" variant="default" asChild>
                      <RegisterLink>
                        <Users className="w-4 h-4 mr-2" />
                        Sign Up Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </RegisterLink>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <LoginLink>
                        Sign In
                      </LoginLink>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Browse LinkedIn Jobs</h3>
              <p className="text-muted-foreground">
                Visit LinkedIn job postings as you normally would. The extension will automatically detect job pages.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Click Track Button</h3>
              <p className="text-muted-foreground">
                Click the "Track with JobSchedule" button that appears on LinkedIn job pages.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">View in Dashboard</h3>
              <p className="text-muted-foreground">
                Your tracked jobs appear in your JobSchedule dashboard with analytics and insights.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Image */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">See It In Action</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <Image
                src="/images/localhost_3000_dashboard.png"
                alt="JobSchedule Dashboard Demo"
                width={1200}
                height={800}
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of job seekers who have already improved their success rate with JobSchedule
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" asChild>
              <a href={config.CHROME_WEB_STORE_URL} target="_blank" rel="noopener noreferrer">
                <Store className="w-4 h-4 mr-2" />
                Install Extension
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 