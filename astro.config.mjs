import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

// Production site URL — used for canonical links, RSS, and OG metadata.
export default defineConfig({
  site: 'https://thecruxco.com',

  build: {
    inlineStylesheets: 'auto'
  },

  compressHTML: true,
  output: "hybrid",
  adapter: cloudflare()
});