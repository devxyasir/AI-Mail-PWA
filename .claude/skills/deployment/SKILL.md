---
name: deployment
description: Use this skill when deploying to Vercel, setting up environment variables in Vercel, configuring PWA for production, running the pre-deployment checklist, or troubleshooting build failures.
---

# Deployment Skill

## When to Use

Use this skill when:
- Deploying the app to Vercel for the first time
- Updating Vercel environment variables
- Running the pre-deployment checklist
- Troubleshooting build failures
- Creating a production build locally

## Step-by-Step Workflow

### Step 1 — Read the deployment spec

```
Read docs/specs/08-deployment-spec.md before deploying.
```

### Step 2 — Pre-deployment checklist

Before deploying, verify all of these pass:

```bash
npm run lint          # must have zero errors
npm run test          # must have zero failures
npm run build         # must succeed with no errors
```

### Step 3 — Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Step 4 — Initial deploy

```bash
vercel
```

When prompted:
- Link to existing project: No
- Project name: `ai-mail-pwa`
- Directory: `./`
- Override settings: No

### Step 5 — Set environment variables in Vercel

Go to Vercel dashboard → Project → Settings → Environment Variables.
Add all variables from `.env.local`:

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL (set to your Vercel URL)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_TENANT_ID
AI_API_KEY
AI_BASE_URL
CREDENTIAL_ENCRYPTION_KEY
```

### Step 6 — Production deploy

```bash
vercel --prod
```

### Step 7 — Verify deployment

- Visit the live URL
- Test login flow
- Test inbox loading
- Test AI summary on an email
- Verify PWA install prompt appears on mobile

### Step 8 — Update OAuth redirect URIs

In Google Cloud Console, add your Vercel URL to authorized redirect URIs:
```
https://your-app.vercel.app/api/auth/callback/google
```

In Azure App Registration, add:
```
https://your-app.vercel.app/api/auth/callback/azure-ad
```

## Acceptance Criteria

- [ ] `npm run build` succeeds locally
- [ ] Vercel deploy succeeds
- [ ] All env variables are set in Vercel
- [ ] Live URL is accessible
- [ ] OAuth redirect URIs are updated
- [ ] PWA is installable from live URL
- [ ] AI features work on live URL

## Example Prompts

```
Use the documentation agent and deployment skill.
Read docs/specs/08-deployment-spec.md first.
Run npm run test:all and verify it passes.
Deploy the app to Vercel.
Update docs/architecture.md with the live Vercel URL.
```