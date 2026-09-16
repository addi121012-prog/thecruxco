import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// The Crux — marketing pages stay prerendered (static, SEO-preserving);
// CRM app (/app/*) and API (/api/*) run server-side on Cloudflare Pages
// via the adapter. Individual dynamic routes opt in with `export const prerender = false`.
export default defineConfig({
  site: 'https://thecruxco.com',
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: { enabled: true }, // exposes D1/R2 bindings to `astro dev`
    imageService: 'passthrough',
  }),
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
