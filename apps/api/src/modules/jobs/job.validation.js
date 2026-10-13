import { z } from "zod";

const textList = z
  .array(z.string().trim().min(1).max(300))
  .max(50)
  .optional()
  .default([]);

const salarySchema = z
  .object({
    min: z.number().nonnegative().optional(),
    max: z.number().nonnegative().optional(),
    currency: z.string().trim().length(3).default("INR"),
    period: z.enum(["hourly", "monthly", "yearly"]).default("yearly"),
    isDisclosed: z.boolean().default(true),
  })
  .strict()
  .superRefine((salary, ctx) => {
    if (
      salary.min !== undefined &&
      salary.max !== undefined &&
      salary.min > salary.max
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["max"],
        message:
          "Maximum salary must be greater than or equal to minimum salary.",
      });
    }
  });

const experienceSchema = z
  .object({
    minYears: z.number().min(0).max(60).default(0),
    maxYears: z.number().min(0).max(60).default(0),
  })
  .strict()
  .superRefine((experience, ctx) => {
    if (experience.minYears > experience.maxYears) {
      ctx.addIssue({
        code: "custom",
        path: ["maxYears"],
        message:
          "Maximum experience must be greater than or equal to minimum experience.",
      });
    }
  });

const jobFields = {
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(50).max(30000),
  requirements: textList,
  responsibilities: textList,
  skills: z
    .array(z.string().trim().min(1).max(80))
    .max(50)
    .optional()
    .default([]),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]),
  workplace: z.enum(["onsite", "hybrid", "remote"]),
  location: z.string().trim().max(150).optional().default(""),
  salary: salarySchema.optional().default({}),
  experience: experienceSchema.optional().default({}),
  closesAt: z.string().datetime().nullable().optional(),
};

export const createJobSchema = z.object(jobFields).strict();

export const updateJobSchema = z
  .object({
    title: jobFields.title.optional(),
    description: jobFields.description.optional(),
    requirements: jobFields.requirements,
    responsibilities: jobFields.responsibilities,
    skills: jobFields.skills,
    employmentType: jobFields.employmentType.optional(),
    workplace: jobFields.workplace.optional(),
    location: jobFields.location,
    salary: salarySchema.optional(),
    experience: experienceSchema.optional(),
    closesAt: jobFields.closesAt,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });
