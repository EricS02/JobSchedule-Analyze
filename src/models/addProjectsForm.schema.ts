import { z } from "zod";

export const AddProjectsFormSchema = z.object({
  id: z.string().optional(),
  resumeId: z.string().optional(),
  sectionTitle: z.string().optional(),
  sectionType: z.string().optional(),
  title: z
    .string({
      required_error: "Project title is required.",
    })
    .min(1),
  content: z
    .string({
      required_error: "Project description is required",
    })
    .min(1),
  url: z.string().optional(),
}); 