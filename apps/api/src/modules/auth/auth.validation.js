// We'll validate registration and login requests before they reach the database.


import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),

  password: z.string().min(12).max(128),

  role: z.enum(["candidate", "recruiter"]).default("candidate"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1).max(128),
});
