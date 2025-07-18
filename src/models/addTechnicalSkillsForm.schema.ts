import { z } from "zod";

export const AddTechnicalSkillsFormSchema = z.object({
  id: z.string().optional(),
  resumeId: z.string().optional(),
  sectionTitle: z
    .string({
      required_error: "Section title is required.",
    })
    .min(1),
  sectionType: z.string().optional(),
  title: z
    .string({
      required_error: "Skills category is required.",
    })
    .min(1),
  content: z
    .string({
      required_error: "Skills content is required",
    })
    .min(1),
}); 