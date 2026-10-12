import { z } from "zod";

/** Shared health-response contract consumed by the API and web app. */
export const apiHealthSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("hireflow-api"),
  environment: z.enum(["development", "test", "production"]),
  timestamp: z.string().datetime(),
});
