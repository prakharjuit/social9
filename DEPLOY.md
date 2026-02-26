# Deployment Guide

This document explains how to deploy the Social9 frontend and backend to common static hosts and container platforms.

---

## Frontend (Vercel)

1. Sign in to Vercel and create a new project.
2. Import this repository from GitHub.
3. Under Project Settings -> Build & Output Settings, Vercel will detect `package.json`. It should use the build command `npm run build` and the output directory `social9-frontend/dist`.
4. Environment variables (none required for static app). If you want to configure a default `VITE_API_URL` or similar, add it in Vercel UI.

Notes: I added `vercel.json` at the repo root that tells Vercel to build using `social9-frontend/package.json` and publish the `dist` folder.

---

## Frontend (Netlify)

1. Sign in to Netlify and create a new site from Git.
2. Choose this repository and set the build settings:
   - Base directory: `social9-frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Confirm and deploy.

Notes: A `netlify.toml` file is included that sets the build base and publish directory.

---

## Backend (recommended hosts: Render, Railway, Fly, Heroku)

The backend requires a running Postgres database and several environment variables. I included a `Dockerfile` in `social9-backend/` so you can deploy as a container or directly use a Node service.

Required environment variables (example names used in the repo):

- `DATABASE_URL` - Postgres connection string (eg: `postgresql://user:pass@host:5432/dbname`)
- `JWT_SECRET` - secret for JWT signing
- `FRONTEND_URL` - e.g., `https://yourapp.com`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` (if using LinkedIn)
- `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET` (if using Instagram OAuth)
- `REDIS_URL` - required only if you use the job queue (optional)
- `AWS_*` - required only if using S3 uploads
- `STRIPE_*` - required only if billing features are enabled

### Deploying (example: Render)
1. Create a new Web Service on Render and connect your GitHub repo.
2. Choose Docker or Node environment. If Docker is chosen, Render will build the `social9-backend/Dockerfile`.
3. Set environment variables on the service as listed above.
4. Ensure your Postgres database is available and `DATABASE_URL` is set.
5. After the service starts, run Prisma migrations on the instance (or locally) using:

```bash
cd social9-backend
npx prisma migrate deploy
```

Alternatively run `npx prisma migrate dev` locally and push migrations, then `prisma migrate deploy` on production.

### Notes on Postgres & Prisma
- Migrations are stored in `social9-backend/prisma/migrations`.
- If you create the DB on Render/Railway they typically provide a `DATABASE_URL` you can copy to your service env.

---

## Quick local build commands

Frontend build (for preview):

```bash
cd social9-frontend
npm install
npm run build
npx serve dist
```

Backend (Docker):

```bash
cd social9-backend
docker build -t social9-backend .
docker run -e DATABASE_URL="postgresql://..." -p 4000:4000 social9-backend
```

---

If you want, I can:
- Deploy the frontend to Vercel/Netlify for you (I will need access to your GitHub or you can connect the repo in Vercel/Netlify and share the URLs),
- Deploy the backend to Render/Railway if you provide access or credentials, or I can provide a script and exact environment list that you can use.

Tell me which host you prefer for the backend (Render, Railway, Fly, Heroku) and whether you want me to proceed with automatic deployment (I will need access).