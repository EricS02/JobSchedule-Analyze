"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSessionStorage } from "@/hooks/useSessionStorage";

type AiModel = "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo" | "claude-3-sonnet";

const defaultModel: AiModel = "gpt-3.5-turbo";

export default function AiResumeReviewSection() {
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<string>("");
  const { value: selectedModel, loading: modelLoading } = useSessionStorage<AiModel>("aiSettings", defaultModel);

  const handleResumeReview = async () => {
    if (!resumeText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter resume text to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setReviewResult("");

    try {
      const response = await fetch("/api/ai/resume/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          selectedModel: selectedModel || defaultModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();
      setReviewResult(data.result);
      
      toast({
        title: "Review Complete",
        description: "Resume review has been completed successfully.",
      });
    } catch (error) {
      console.error("Resume review error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze resume. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (modelLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Resume Review</CardTitle>
          <CardDescription>Loading AI settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <CardTitle>AI Resume Review</CardTitle>
        </div>
        <CardDescription>
          Get AI-powered feedback on your resume content and suggestions for improvement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resume-text">Resume Content</Label>
          <Textarea
            id="resume-text"
            placeholder="Paste your resume content here for AI analysis and feedback..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Using: {selectedModel}
            </Badge>
          </div>
          
          <Button
            onClick={handleResumeReview}
            disabled={isLoading || !resumeText.trim()}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Review Resume</span>
              </>
            )}
          </Button>
        </div>

        {reviewResult && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <Label className="text-sm font-medium">Review Results</Label>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: reviewResult }} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
