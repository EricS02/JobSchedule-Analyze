import { z } from "zod";
import DOMPurify from 'isomorphic-dompurify';

function sanitizeText(text: string): string {
  if (!text) return '';
  // Remove HTML tags and encode special characters
  const clean = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return clean.trim();
}

export const AddJobFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  title: z
    .string({
      required_error: "Job title is required.",
    })
    .min(2, {
      message: "Job title must be at least 2 characters.",
    })
    .transform(sanitizeText),
  company: z
    .string({
      required_error: "Company name is required.",
    })
    .min(2, {
      message: "Company name must be at least 2 characters.",
    })
    .transform(sanitizeText),
  location: z
    .string({
      required_error: "Location is required.",
    })
    .min(2, {
      message: "Location name must be at least 2 characters.",
    })
    .transform(sanitizeText),
  type: z.string().min(1).transform(sanitizeText),
  source: z
    .string({
      required_error: "Source is required.",
    })
    .min(2, {
      message: "Source name must be at least 2 characters.",
    })
    .transform(sanitizeText),
  status: z
    .string({
      required_error: "Status is required.",
    })
    .min(2, {
      message: "Status must be at least 2 characters.",
    })
    .default("draft")
    .transform(sanitizeText),
  dueDate: z.date(),
  dateApplied: z.date().optional(),
  salaryRange: z.string().transform(sanitizeText),
  jobDescription: z
    .string({
      required_error: "Job description is required.",
    })
    .min(10, {
      message: "Job description must be at least 10 characters.",
    })
    .transform(sanitizeText),
  jobUrl: z.string().optional().transform((v) => v ? sanitizeText(v) : v),
  applied: z.boolean().default(false),
  resume: z.string().optional().transform((v) => v ? sanitizeText(v) : v),
  jobTitleId: z.string().optional().transform((v) => v ? sanitizeText(v) : v),
  companyId: z.string().optional().transform((v) => v ? sanitizeText(v) : v),
  locationId: z.string().optional().transform((v) => v ? sanitizeText(v) : v),
});
