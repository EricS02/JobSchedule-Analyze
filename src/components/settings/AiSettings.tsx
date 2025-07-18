"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Sparkles, Crown } from "lucide-react";
import { useSessionStorage } from "@/hooks/useSessionStorage";

type AiModel = "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo" | "claude-3-sonnet";

const defaultModel: AiModel = "gpt-3.5-turbo";

const modelOptions = [
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Fast and efficient for most tasks",
    icon: Brain,
    badge: "Fast",
    badgeVariant: "secondary" as const,
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "More capable and creative",
    icon: Zap,
    badge: "Powerful",
    badgeVariant: "default" as const,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Latest model with improved performance",
    icon: Sparkles,
    badge: "Latest",
    badgeVariant: "default" as const,
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    description: "Anthropic's advanced AI model",
    icon: Crown,
    badge: "Advanced",
    badgeVariant: "destructive" as const,
  },
];

export default function AiSettings() {
  const { value: selectedModel, setValue: setSelectedModel, loading } = useSessionStorage<AiModel>("aiSettings", defaultModel);

  const handleModelChange = async (model: AiModel) => {
    await setSelectedModel(model);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Model Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Settings</CardTitle>
        <CardDescription>
          Choose your preferred AI model for resume reviews and job matching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedModel}
          onValueChange={handleModelChange}
          className="grid gap-4"
        >
          {modelOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="flex flex-1 cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{option.name}</span>
                        <Badge variant={option.badgeVariant} className="text-xs">
                          {option.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <div className="rounded-lg bg-muted p-4">
          <h4 className="font-medium mb-2">Current Selection</h4>
          <p className="text-sm text-muted-foreground">
            You're currently using: <strong>{selectedModel}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
