"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Target, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSessionStorage } from "@/hooks/useSessionStorage";

type AiModel = "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo" | "claude-3-sonnet";

const defaultModel: AiModel = "gpt-3.5-turbo";

export default function AiJobMatchSection() {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<string>("");
  const { value: selectedModel, loading: modelLoading } = useSessionStorage<AiModel>("aiSettings", defaultModel);

  const handleJobMatch = async () => {
    if (!jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a job description to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setMatchResult("");

    try {
      const response = await fetch("/api/ai/resume/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          selectedModel: selectedModel || defaultModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze job match");
      }

      const data = await response.json();
      setMatchResult(data.result);
      
      toast({
        title: "Analysis Complete",
        description: "Job match analysis has been completed successfully.",
      });
    } catch (error) {
      console.error("Job match error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze job match. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (modelLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Job Match Analysis</CardTitle>
          <CardDescription>Loading AI settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <CardTitle>AI Job Match Analysis</CardTitle>
        </div>
        <CardDescription>
          Analyze how well your resume matches a specific job description using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the job description here to analyze how well your resume matches..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
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
            onClick={handleJobMatch}
            disabled={isLoading || !jobDescription.trim()}
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
                <span>Analyze Match</span>
              </>
            )}
          </Button>
        </div>

        {matchResult && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <Label className="text-sm font-medium">Match Analysis</Label>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: matchResult }} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
