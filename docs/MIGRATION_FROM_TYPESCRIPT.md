# Scaffold migration notes

This JavaScript scaffold uses React + Vite, Node.js + Express, MongoDB Atlas + Mongoose, Zod, and npm workspaces. It does not require TypeScript or pnpm.

## If replacing the previous TypeScript scaffold
1. Commit or back up your repository.
2. Copy the new `apps/`, `packages/`, root `package.json`, `.gitignore`, `.env.example`, and README into the repository. Keep `.git/` and unrelated work.
3. Remove only obsolete scaffold TypeScript files (`*.ts`, `*.tsx`, and `tsconfig*.json`) that are no longer imported. Do not delete custom files without checking their imports.
4. Preserve `apps/api/.env` if it already contains your working Atlas URI.
5. Delete generated `node_modules` and `dist` folders, then run `npm install` and `npm run dev` from the repository root.

## If migrating from pnpm to npm
1. Stop the development servers and back up your work.
2. Use the npm-workspaces root `package.json` and workspace package manifests from this scaffold.
3. Remove `pnpm-workspace.yaml`, pnpm-only `.npmrc` settings, and `pnpm-lock.yaml`.
4. Delete generated `node_modules` and `dist` folders; preserve source files and `.env`.
5. Run `npm install`, then `npm run dev`. This generates a new `package-lock.json`.

## Verify
- Frontend: `http://localhost:5173`
- API liveness: `http://localhost:4000/api/health`
- Database readiness: `http://localhost:4000/api/health/ready`
- Production build checks: `npm run build`
