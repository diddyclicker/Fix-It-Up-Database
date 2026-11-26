# Fix It Up Database — CarLiner

A simple Next.js + Vercel vehicle-value database. The source of truth is `data/cars.json` in your GitHub repository. There is no separate database provider.

## What it includes

- Public vehicle list at `/`
- Search and category filter
- Admin dashboard at `/admin`
- Add, edit and remove vehicles
- Publish changes by committing `data/cars.json` to GitHub
- API endpoint: `/api/cars`

## 1. Upload this project to your existing GitHub repository

Download and extract the ZIP, then upload **all files and folders inside** to the root of your existing repository. Commit the files to the branch you connected to Vercel (usually `main`).

Make sure the repository contains:
- `package.json`
- `app/`
- `data/cars.json`

## 2. Create a GitHub token

Create a fine-grained personal access token in GitHub:
- Repository access: **Only select repositories** → choose this repository
- Repository permissions → Contents: **Read and write**
- No other permissions are needed for this starter

Copy the token once. Never put it in a source file or share it.

## 3. Add Vercel Environment Variables

In Vercel: Project → Settings → Environment Variables. Add:

| Name | Value |
|---|---|
| `GITHUB_OWNER` | Your GitHub username or organization |
| `GITHUB_REPO` | Exact repository name, e.g. `Fix-It-Up-Database` |
| `GITHUB_BRANCH` | `main` (or your actual branch) |
| `GITHUB_TOKEN` | Your fine-grained GitHub token |
| `ADMIN_PASSWORD` | A long, unique password for `/admin` |

After saving the variables, redeploy the project.

## 4. Use it

- Public database: your domain `/`
- Admin dashboard: your domain `/admin`
- API: your domain `/api/cars`

The initial `data/cars.json` contains one example vehicle. Remove it or replace it from the admin page.

## Important limitations

- Changes are saved as commits in GitHub. This is intentionally file-backed rather than a separate database service.
- GitHub and Vercel have API/rate and deployment limits. This is suitable for a small community database, not high-frequency writes.
- This starter does not automatically know when Fix It Up updates. You must enter verified new values in Admin after game updates.
- The admin password is a simple shared-secret gate. Keep it private. For a larger public service, add proper user authentication and rate limiting.
- Keep `GITHUB_TOKEN` and `ADMIN_PASSWORD` only in Vercel Environment Variables (and local `.env.local` if testing). Never commit `.env` files.
- If the repository is public, the vehicle data is public. Do not store private user information in `cars.json`.

## Local development (optional)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in `.env.local` before testing API/admin features.
