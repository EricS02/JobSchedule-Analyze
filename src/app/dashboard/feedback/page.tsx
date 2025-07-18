"use client";

import Feedback from "@/components/Feedback";

export default function FeedbackPage() {
  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header with centered title */}
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-xl font-semibold">
          Feedback & Feature Requests
        </h1>
      </div>

      {/* Canny feedback widget */}
      <div className="flex-1 overflow-hidden">
        <Feedback />
      </div>
    </div>
  );
} 