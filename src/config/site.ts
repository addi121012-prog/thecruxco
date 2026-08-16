// Single source of truth for site-wide configuration.
// Update values here, not scattered across files.

export const SITE = {
  name: 'The Crux Co',
  brand: 'The Crux Co',
  domain: 'thecruxco.com',
  url: 'https://thecruxco.com',
  tagline: 'Fewer things. Each one worth it.',
  description:
    'The Crux Co builds a small number of guides, products and meals — each one cut down to what actually works. We publish the reasoning behind every decision, including the parts that make us look worse.',
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

// The brands in the ecosystem. Single source of truth — used on the
// homepage, the /company page and the footer.
//
// RULE: `status` must be honest. Nothing is marked 'live' until it is
// actually purchasable or readable today. See /standards.
export const BRANDS = [
  {
    slug: 'guides',
    name: 'Crux Guides',
    status: 'live',
    statusLabel: 'Live',
    accent: '#6F1D1B',
    blurb:
      'Short, finishable guides and essays on things that are usually explained badly. We tell you the length before you start, and we list every source.',
    cut: 'What we left out: a daily news cycle, a podcast, and anything longer than one sitting.',
    href: '/essays/',
    hrefLabel: 'Read the writing',
    facts: [
      { k: 'Essays published', v: '3' },
      { k: 'Digests archived', v: '34' },
      { k: 'Free to read', v: 'All of it' },
    ],
  },
  {
    slug: 'picks',
    name: 'Crux Picks',
    status: 'planned',
    statusLabel: 'Not yet',
    accent: '#1B4DE4',
    blurb:
      'We buy the options, test them, and publish one verdict plus everything we rejected. When nothing is worth recommending, we say that instead of picking a winner anyway.',
    cut: "What we'll leave out: a catalogue. We expect to carry fewer than a dozen things.",
    href: '/company/',
    hrefLabel: 'What this will be',
    facts: [
      { k: 'Categories at launch', v: '1' },
      { k: 'Products tested first', v: '9' },
      { k: 'Target', v: 'Q1 2027' },
    ],
  },
  {
    slug: 'the-usual',
    name: 'The Usual',
    status: 'planned',
    statusLabel: 'Not yet',
    accent: '#C8641E',
    blurb:
      'A very short menu of meals designed to be eaten again tomorrow. Lab-verified macros printed on the box. Six dishes, not sixty — because the person eating this eats it five times a week.',
    cut: "What we'll leave out: variety, which is the entire premise of every other menu.",
    href: '/company/',
    hrefLabel: 'What this will be',
    facts: [
      { k: 'Dishes on the menu', v: '6' },
      { k: 'Macros lab-tested', v: 'All 6' },
      { k: 'Target', v: 'Mid 2027' },
    ],
  },
] as const;
