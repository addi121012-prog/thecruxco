// Single source of truth for site-wide configuration.

export const SITE = {
  name: 'The Crux',
  brand: 'The Crux',
  domain: 'thecruxco.com',
  url: 'https://thecruxco.com',
  tagline: 'Cut through the noise.',
  description:
    'The Crux gives you honest, tested product reviews and sharp takes on what is actually happening — the signal, without the noise.',
  email: 'hello@thecruxco.com',
  location: 'India',
  // The daily-takes section. Rename here to change it everywhere (route stays /essays).
  briefName: 'The Brief',
} as const;

// Affiliate disclosure — single source of truth. Required by the FTC,
// by Amazon/most affiliate networks, and shown on every review.
export const AFFILIATE = {
  disclosureShort:
    'Some links on this page are affiliate links. If you buy through one, we may earn a commission — at no extra cost to you. It never decides the verdict.',
  disclosurePage: '/disclosure/',
  disclosureLong:
    'The Crux earns affiliate commissions on some outbound links. We only recommend something after judging it on its merits, and the commission never changes the pick.',
} as const;

// Brand colours referenced in non-CSS contexts.
export const COLOURS = {
  ink: '#0E0E0E',
  paper: '#FBFAF7',
  accent: '#6F1D1B',
} as const;
