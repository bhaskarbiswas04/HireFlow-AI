# HireFlow AI — JavaScript Stage 1

An **npm-workspaces monorepo** foundation for an AI-assisted job portal and applicant tracking system. This stage includes a React + JavaScript + Vite dashboard shell, Express + JavaScript API, MongoDB Atlas/Mongoose startup connection, Zod response validation, health/readiness endpoints, and a shared validation package. It does **not** yet include authentication, job CRUD, applications, resume parsing, or AI matching.

## Stack
- Web: React, JavaScript (ES modules), Vite
- API: Node.js, Express, JavaScript (ES modules)
- Data: MongoDB Atlas + Mongoose
- Validation: Zod in `packages/shared`
- Workspace/package manager: npm workspaces (no pnpm required)

## Requirements
- Node.js 20.19+ (or compatible newer LTS)
- npm (included with Node.js)
- MongoDB Atlas cluster and database user

## Setup
1. In Atlas, allow your current development IP under **Network Access** and create a database user under **Database Access**. Use the database user's password in the connection URI; URL-encode special characters in it.
2. Copy `apps/api/.env.example` to `apps/api/.env` and replace the placeholder `MONGODB_URI`. Never commit the real `.env` file.
3. From the repository root, run `npm install`. npm will install/link the three workspace packages and create `package-lock.json`.
4. Run `npm run dev`. Web: `http://localhost:5173`; API: `http://localhost:4000`.
5. Check `http://localhost:4000/api/health` and `http://localhost:4000/api/health/ready`. Readiness should return HTTP 200 after Atlas connects.
6. Run `npm run build` to verify the production builds.

## Useful commands
- `npm run dev` — run frontend and backend together
- `npm run dev:web` — frontend only
- `npm run dev:api` — backend only
- `npm run build` — build/check shared package, API, and frontend
- `npm run lint` — run the current source syntax checks

## Environment variables
`apps/api/.env`:
- `NODE_ENV` — `development` or `production`
- `PORT` — API port, default `4000`
- `WEB_ORIGIN` — allowed web origin, default `http://localhost:5173`
- `MONGODB_URI` — Atlas connection URI (required)

`apps/web/.env` is optional; `VITE_API_BASE_URL` defaults to `http://localhost:4000`.

## Health endpoints
- `GET /api/health` — process/liveness check (does not prove database connectivity).
- `GET /api/health/ready` — readiness check; returns 503 until Mongoose is connected.

## Repository structure
```text
apps/
  api/       Express API
  web/       React + Vite dashboard
packages/
  shared/    Zod schemas shared by web and API
```

## Product direction
The planned product includes candidate and recruiter accounts, tenant-isolated companies, profiles/resume uploads, job listings, applications and stage transitions, a recruiter Kanban pipeline, interview scheduling, notifications, analytics, and explainable AI resume-to-job matching. AI is advisory rather than an automatic rejection mechanism. These are roadmap items, not features implemented in this starter.

## Security notes
- Keep secrets only in ignored `.env` files or a deployment secret manager.
- Limit Atlas access to the developer IP during local development. Avoid `0.0.0.0/0` except as a deliberate temporary diagnostic.
- Server-side authorization and tenant isolation must be implemented before real candidate/recruiter data is used.

## Migrating from pnpm
1. Stop all development servers.
2. Back up or commit your current work.
3. Replace the old root `package.json` with this npm-workspaces version and replace the `package.json` files in `apps/api` and `apps/web` with the versions in this scaffold.
4. Remove `pnpm-workspace.yaml`, `.npmrc` if it contains pnpm-only settings, and `pnpm-lock.yaml`. Do not delete your source code or `.env` file.
5. Remove generated `node_modules` folders and `dist` folders if present.
6. Run `npm install` from the root, then `npm run dev`.

Keep `apps/api/.env` and your actual Atlas URI. Do not copy placeholder credentials over your working environment file.
