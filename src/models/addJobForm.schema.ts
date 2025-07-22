import { z } from "zod";
import { secureStringSchema, secureTextSchema, urlSchema } from "@/lib/security";

export const AddJobFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  title: secureStringSchema
    .min(2, "Job title must be at least 2 characters.")
    .max(100, "Job title must be less than 100 characters."),
  company: secureStringSchema
    .min(2, "Company name must be at least 2 characters.")
    .max(100, "Company name must be less than 100 characters."),
  location: secureStringSchema
    .min(2, "Location must be at least 2 characters.")
    .max(100, "Location must be less than 100 characters."),
  type: secureStringSchema.min(1).max(50),
  source: secureStringSchema
    .min(2, "Source must be at least 2 characters.")
    .max(50, "Source must be less than 50 characters."),
  status: secureStringSchema
    .min(2, "Status must be at least 2 characters.")
    .max(20, "Status must be less than 20 characters.")
    .default("draft"),
  dueDate: z.date(),
  dateApplied: z.date().optional(),
  salaryRange: secureStringSchema.max(100).optional(),
  jobDescription: secureTextSchema
    .min(10, "Job description must be at least 10 characters.")
    .max(10000, "Job description must be less than 10000 characters."),
  jobUrl: urlSchema.optional(),
  applied: z.boolean().default(false),
  resume: secureStringSchema.max(1000).optional(),
  jobTitleId: secureStringSchema.max(50).optional(),
  companyId: secureStringSchema.max(50).optional(),
  locationId: secureStringSchema.max(50).optional(),
});
