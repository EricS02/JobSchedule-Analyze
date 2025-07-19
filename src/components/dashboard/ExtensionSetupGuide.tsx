"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Chrome, 
  CheckCircle, 
  ArrowRight, 
  ExternalLink,
  X
} from "lucide-react";
import Link from "next/link";

export default function ExtensionSetupGuide() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Chrome className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Get the Most Out of JobSchedule</CardTitle>
            <CardDescription>
              Install our Chrome extension to automatically track job applications from LinkedIn
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              1
            </div>
            <div>
              <h4 className="font-medium text-sm">Download Extension</h4>
              <p className="text-xs text-muted-foreground">
                Get the JobSchedule Chrome extension
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              2
            </div>
            <div>
              <h4 className="font-medium text-sm">Install in Chrome</h4>
              <p className="text-xs text-muted-foreground">
                Load the extension in developer mode
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              3
            </div>
            <div>
              <h4 className="font-medium text-sm">Start Tracking</h4>
              <p className="text-xs text-muted-foreground">
                Click "Track with JobSchedule" on LinkedIn
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button size="sm" asChild>
            <Link href="/extension">
              <Download className="w-4 h-4 mr-2" />
              Download Extension
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/extension">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Instructions
            </Link>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs mr-2">
            Pro Tip
          </Badge>
          The extension works best when you're logged into JobSchedule. Your tracked jobs will automatically appear here.
        </div>
      </CardContent>
    </Card>
  );
} 