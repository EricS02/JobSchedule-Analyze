"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Crown } from "lucide-react";

export default function UpgradeSuccessMessage() {
  const searchParams = useSearchParams();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setShowMessage(true);
      // Hide the message after 10 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showMessage) {
    return null;
  }

  return (
    <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              Welcome to Pro! 🎉
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your subscription is now active. Enjoy unlimited job tracking and all AI features!
            </p>
          </div>
          <Crown className="h-5 w-5 text-yellow-500" />
        </div>
      </CardContent>
    </Card>
  );
} 