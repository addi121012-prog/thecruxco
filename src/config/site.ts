// Single source of truth for site-wide configuration.
// Update values here, not scattered across files.

export const SITE = {
  name: 'TheCruxCo',
  brand: 'The Crux.',
  domain: 'thecruxco.com',
  url: 'https://thecruxco.com',
  tagline: 'Get to the crux.',
  description:
    'Daily knowledge-first news digest for ambitious Indians. Seven categories, thirty-five items, under seven minutes. Every day.',
  email: 'hello@thecruxco.com',
  location: 'India',
} as const;

// Beehiiv newsletter integration.
// Update these when the publication or form changes.
export const NEWSLETTER = {
  // Publication URL (Beehiiv's hosted homepage / subscribe page).
  publicationUrl: 'https://thecruxco.beehiiv.com',
  // Hosted subscribe page fallback (used in nav button + when JS embed fails).
  hostedSubscribeUrl: 'https://thecruxco.beehiiv.com/subscribe',
  // Embedded form ID (from Beehiiv Subscribe Forms → Embed code).
  embedFormId: '3037a5ca-4c83-45a0-8c8b-9c838f32d3cf',
  // Sender email shown in transactional copy (informational only).
  senderEmail: 'hello@thecruxco.com',
} as const;

// Brand colours referenced in non-CSS contexts.
export const COLOURS = {
  ink: '#0E0E0E',
  paper: '#FBFAF7',
  accent: '#6F1D1B',
} as const;
