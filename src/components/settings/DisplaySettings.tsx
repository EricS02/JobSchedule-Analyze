"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useSessionStorage } from "@/hooks/useSessionStorage";

type Theme = "light" | "dark" | "system";

const defaultTheme: Theme = "system";

const themeOptions = [
  {
    id: "light",
    name: "Light",
    description: "Clean and bright interface",
    icon: Sun,
    badge: "Light",
    badgeVariant: "secondary" as const,
  },
  {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes in low light",
    icon: Moon,
    badge: "Dark",
    badgeVariant: "default" as const,
  },
  {
    id: "system",
    name: "System",
    description: "Follows your system preference",
    icon: Monitor,
    badge: "Auto",
    badgeVariant: "outline" as const,
  },
];

export default function DisplaySettings() {
  const { setTheme } = useTheme();
  const { value: selectedTheme, setValue: setSelectedTheme, loading } = useSessionStorage<Theme>("theme", defaultTheme);

  const handleThemeChange = async (theme: Theme) => {
    await setSelectedTheme(theme);
    setTheme(theme);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Settings</CardTitle>
        <CardDescription>
          Customize the appearance of JobSchedule
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Theme</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Choose your preferred color scheme
          </p>
          
          <RadioGroup
            value={selectedTheme}
            onValueChange={handleThemeChange}
            className="grid gap-4"
          >
            {themeOptions.map((option) => {
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
        </div>

        <div className="rounded-lg bg-muted p-4">
          <h4 className="font-medium mb-2">Current Theme</h4>
          <p className="text-sm text-muted-foreground">
            You're currently using: <strong className="capitalize">{selectedTheme}</strong> theme
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
