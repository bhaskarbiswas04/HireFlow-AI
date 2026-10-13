import { z } from "zod";

const websiteSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => {
      if (!value) return true;

      try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol);
      } catch {
        return false;
      }
    },
    { message: "Website must be a valid HTTP or HTTPS URL." },
  )
  .default("");

export const createCompanySchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().max(5000).optional().default(""),
    website: websiteSchema,
    industry: z.string().trim().max(100).optional().default(""),
  })
  .strict();
