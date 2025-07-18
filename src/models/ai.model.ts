export interface ResumeReviewResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  score: number;
}
export interface JobMatchResponse {
  matching_score: number;
  detailed_analysis: JobMatchAnalysis[];
  suggestions: JobMatchAnalysis[];
  additional_comments: string[];
}

export type JobMatchAnalysis = {
  category: string;
  value: string[];
};

export interface AiModel {
  model: string;
}

export enum OpenaiModel {
  GPT3_5 = "gpt-3.5-turbo",
  // GPT4o = "gpt-4o",
  // GPT4_TURBO = "gpt-4-turbo", // expensive model, but faster
}

export const defaultModel: AiModel = {
  model: OpenaiModel.GPT3_5,
};
