import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { apiHealthSchema } from "@hireflow/shared";
import { env } from "./config/env.js";
import { isDatabaseReady } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";

import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import companyRoutes from "./modules/companies/company.routes.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "1mb" }));

app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  const payload = { status: "ok", service: "hireflow-api", environment: env.NODE_ENV, timestamp: new Date().toISOString() };
  // Validate the response contract too, so web and API stay aligned.
  res.status(200).json(apiHealthSchema.parse(payload));
});

app.get("/api/health/ready", (_req, res) => {
  const ready = isDatabaseReady();
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    database: ready ? "connected" : mongoose.connection.readyState === 2 ? "connecting" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);

app.use((_req, res) =>
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested API route does not exist.",
    },
  }),
);

app.use((_req, res) =>
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested API route does not exist.",
    },
  }),
);

app.use((_req, res) =>
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested API route does not exist.",
    },
  }),
);

app.use((_req, res) =>
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested API route does not exist.",
    },
  }),
);

app.use((_req, res) =>
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested API route does not exist.",
    },
  }),
);
app.use(errorHandler);

app.use((error, _req, res, _next) => {
  console.error("Unhandled request error:", error);
  res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected server error occurred." } });
});
