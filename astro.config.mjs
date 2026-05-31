import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Change `site` to your final domain before launch (e.g. https://thecrux.co).
export default defineConfig({
  site: 'https://thecruxco.com',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto'
  },
  compressHTML: true,
});
