# The Crux CRM — Deployment Runbook

The site is now an Astro **hybrid** app on Cloudflare Pages: marketing pages stay static
(SEO preserved), and `/app/*` + `/api/*` run as server functions backed by **D1** (database)
and **R2** (file attachments). Deploys still happen by pushing to GitHub — Cloudflare Pages
auto-builds. All steps below run in **your Mac Terminal** (the Claude bridge can't run git).

## 0. One-time: log in to wrangler
```bash
cd ~/Documents/Claude/Projects/"News App and Website Launch"/thecruxco
npx wrangler login
```

## 1. Create the database (D1) and file bucket (R2)
```bash
npx wrangler d1 create thecrux-crm
# → copy the printed database_id
npx wrangler r2 bucket create thecrux-attachments
```
Open `wrangler.toml` and replace `REPLACE_WITH_D1_DATABASE_ID` with the id from above.

## 2. Create the tables (run once against the REMOTE database)
```bash
npx wrangler d1 execute thecrux-crm --remote --file=./db/schema.sql
```

## 3. Push the code
```bash
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null
git checkout -b feature/crm
git add -A
git commit -m "Launch The Crux Sales & Pre-Sales CRM + reposition site"
git push -u origin feature/crm
```
Push to `feature/crm` first to get a **preview** deploy, verify it, then merge to `main`
for production (Pages auto-deploys `main`).

## 4. Configure the Pages project (Cloudflare dashboard → your Pages project → Settings)
Build settings (Build & deployments):
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable `NODE_VERSION` = `20`

Functions → Compatibility:
- Compatibility date: `2024-09-23`
- Compatibility flags: `nodejs_compat`

Functions → Bindings (must match these exact names):
- **D1 database binding**: Variable name `DB` → database `thecrux-crm`
- **R2 bucket binding**: Variable name `ATTACHMENTS` → bucket `thecrux-attachments`

Environment variables (Settings → Environment variables → **encrypt** these):
- `AUTH_SECRET` = a long random string (required). Generate: `openssl rand -base64 32`
- `ANTHROPIC_API_KEY` = your Claude API key (optional — enables "Analyze opportunity"; the app works without it)
- `RESEND_API_KEY` = a Resend key (optional — enables real password-reset & invite emails; without it those links are logged, not emailed)

Add the same bindings/vars to **both** Production and Preview environments if you want the preview to work.

Redeploy after adding bindings (Deployments → Retry/redeploy the latest).

## 5. Verify live
1. Visit the site → hero should read "Sales shouldn't be this complicated."
2. `/signup` → create an account → create a workspace → you land on the dashboard.
3. Add a lead → Convert → drag it across the pipeline → Send to Pre-Sales → add a Proposal + upload a file → add a Task.
4. Check `/essays/revolut-wasnt-hacked-it-was-asked/` still loads (editorial preserved).

## Local development
```bash
cp .dev.vars.example .dev.vars   # set AUTH_SECRET
npx wrangler d1 execute thecrux-crm --local --file=./db/schema.sql
npm run build && npx wrangler pages dev
```

## Notes
- Billing is **stubbed**: choosing a plan in Settings activates it without charging. Wire Razorpay
  into `src/pages/api/workspace/plan.ts` when ready — the subscription fields already exist.
- Email is **driver-based**: add `RESEND_API_KEY` (or swap `src/server/email.ts`) to send real mail.
- Schema changes: add SQL to `db/schema.sql` (idempotent `CREATE ... IF NOT EXISTS`) and re-run the
  `d1 execute --remote` command.
