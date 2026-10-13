// This validates the authentication configuration when the API starts.

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(4000),

  WEB_ORIGIN: z.string().url(),

  MONGODB_URI: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(30).default(7),

  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid API environment configuration:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
