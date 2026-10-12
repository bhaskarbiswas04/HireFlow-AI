import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.info("MongoDB connected.");
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}
