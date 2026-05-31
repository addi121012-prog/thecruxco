# TheCruxCo

Daily knowledge-first news digest. Built with Astro + Cloudflare Pages.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:4321
```

## Build

```bash
npm run build
# output in ./dist/
```

## Publish a new digest

1. Copy `src/content/digests/2026-05-31.md` to today's date.
2. Update frontmatter (date, items in each category).
3. Commit and push to `main` — Cloudflare Pages auto-deploys.

## Publish an essay

1. Add a markdown file under `src/content/essays/<slug>.md`.
2. Frontmatter: `title`, `pubDate`, `author` (anonymous pen name), `excerpt`.
3. Body is normal markdown. Commit + push.

## Deploy

Connected via Cloudflare Pages → see `02_RUNBOOK.md` at repo root.
