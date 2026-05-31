import { defineConfig } from 'astro/config';

// Production site URL — used for canonical links, RSS, and OG metadata.
export default defineConfig({
  site: 'https://thecruxco.com',
  build: {
    inlineStylesheets: 'auto'
  },
  compressHTML: true,
});
