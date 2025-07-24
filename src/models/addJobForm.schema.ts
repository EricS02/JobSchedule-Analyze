import { z } from "zod";
import { secureStringSchema, secureTextSchema, urlSchema } from "@/lib/security";

export const AddJobFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  title: z.string()
    .min(2, "Job title must be at least 2 characters.")
    .max(100, "Job title must be less than 100 characters.")
    .pipe(secureStringSchema),
  company: z.string()
    .min(2, "Company name must be at least 2 characters.")
    .max(100, "Company name must be less than 100 characters.")
    .pipe(secureStringSchema),
  location: z.string()
    .min(2, "Location must be at least 2 characters.")
    .max(100, "Location must be less than 100 characters.")
    .pipe(secureStringSchema),
  type: z.string().min(1).max(50).pipe(secureStringSchema),
  source: z.string()
    .min(2, "Source must be at least 2 characters.")
    .max(50, "Source must be less than 50 characters.")
    .pipe(secureStringSchema),
  status: z.string()
    .min(2, "Status must be at least 2 characters.")
    .max(20, "Status must be less than 20 characters.")
    .default("draft")
    .pipe(secureStringSchema),
  dueDate: z.date(),
  dateApplied: z.date().optional(),
  salaryRange: z.string().max(100).pipe(secureStringSchema).optional(),
  jobDescription: z.string()
    .min(10, "Job description must be at least 10 characters.")
    .max(10000, "Job description must be less than 10000 characters.")
    .pipe(secureTextSchema),
  jobUrl: urlSchema.optional(),
  applied: z.boolean().default(false),
  resume: z.string().max(1000).pipe(secureStringSchema).optional(),
  jobTitleId: z.string().max(50).pipe(secureStringSchema).optional(),
  companyId: z.string().max(50).pipe(secureStringSchema).optional(),
  locationId: z.string().max(50).pipe(secureStringSchema).optional(),
});
