"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  AiModel,
  defaultModel,
  OpenaiModel,
} from "@/models/ai.model";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "@/utils/localstorage.utils";
import { toast } from "../ui/use-toast";

function AiSettings() {
  const [selectedModel, setSelectedModel] = useState<AiModel>(defaultModel);

  const setSelectedModelValue = (model: string) => {
    setSelectedModel({ model });
  };

  useEffect(() => {
    const savedSettings = getFromLocalStorage("aiSettings", defaultModel);
    setSelectedModel(savedSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveModelSettings = () => {
    if (!selectedModel.model) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a model to save.",
      });
      return;
    }
    saveToLocalStorage("aiSettings", selectedModel);
    toast({
      variant: "success",
      title: "Saved!",
      description: "AI Settings saved successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Settings</CardTitle>
      </CardHeader>
      <CardContent className="ml-4">
        <div>
          <Label className="my-4" htmlFor="ai-model">
            OpenAI Model
          </Label>
          <Select
            value={selectedModel.model}
            onValueChange={setSelectedModelValue}
          >
            <SelectTrigger
              id="ai-model"
              aria-label="Select OpenAI Model"
              className="w-[180px]"
            >
              <SelectValue placeholder="Select OpenAI Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(OpenaiModel).map(([key, value]) => (
                  <SelectItem key={key} value={value} className="capitalize">
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button className="mt-8" onClick={saveModelSettings}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}

export default AiSettings;
