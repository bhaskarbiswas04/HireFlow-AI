import { access, readdir } from "node:fs/promises";
import { join } from "node:path";

// JavaScript needs no compilation step. This verifies the API entry files exist.
for (const file of ["src/server.js", "src/app.js", "src/config/env.js", "src/config/database.js"]) {
  await access(new URL(`../${file}`, import.meta.url));
}
console.log("API JavaScript source check passed.");
