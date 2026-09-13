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
  publicationUrl: 'https://thecruxco.beehiiv.com',
  hostedSubscribeUrl: 'https://thecruxco.beehiiv.com/subscribe',
  embedFormId: '3037a5ca-4c83-45a0-8c8b-9c838f32d3cf',
  senderEmail: 'hello@thecruxco.com',
} as const;

// Affiliate disclosure — single source of truth. Required by the FTC,
// by Amazon/most affiliate networks, and by our own standard.
// Shown on every review and on any guide that carries an outbound money link.
export const AFFILIATE = {
  disclosureShort:
    'Some links on this page are affiliate links. If you buy through one, we may earn a commission — at no extra cost to you. It never decides the verdict. Here is why.',
  disclosurePage: '/standards/',
  disclosureLong:
    'The Crux Co earns affiliate commissions on some outbound links. We only recommend something after judging it on its merits, we name what we rejected and why, and when the honest answer is "buy none of these," we say so. The commission never changes the pick.',
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
    href: '/guides/',
    hrefLabel: 'Read the guides',
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
    statusLabel: 'In progress',
    accent: '#1B4DE4',
    blurb:
      'We try the options, judge them on their merits, and publish one verdict plus everything we rejected. When nothing is worth recommending, we say that instead of picking a winner anyway.',
    cut: "What we'll leave out: a catalogue. We expect to carry fewer than a dozen things.",
    href: '/reviews/',
    hrefLabel: 'See the reviews',
    facts: [
      { k: 'First category', v: 'AI tools' },
      { k: 'Verdict per job', v: 'One' },
      { k: 'Rejections shown', v: 'Always' },
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

// ---------------------------------------------------------------
// CRUX STUDIO — the productised content service (the money engine).
// Landing page at /studio. Edit prices/contact here, nowhere else.
// The page works immediately via email; WhatsApp + lead form appear
// only once you fill `whatsapp` and `formEndpoint`.
// ---------------------------------------------------------------
export const STUDIO = {
  email: 'hello@thecruxco.com',
  whatsapp: '',        // digits only incl. country code, e.g. '919812345678' → shows a WhatsApp button
  formEndpoint: '',    // paste a free Formspree endpoint (https://formspree.io/f/xxxx) → shows a lead form
  currency: '₹',
  usdNote: 'Serving global clients too — USD pricing on request.',
  tiers: [
    {
      name: 'Single article',
      price: '₹2,999',
      unit: 'per article',
      best: 'Try before you commit',
      features: [
        'One SEO article, up to ~1,200 words',
        'Keyword + intent research included',
        'Human-edited, not raw AI output',
        'One round of revisions',
        'Delivered in 3 working days',
      ],
      highlight: false,
      cta: 'Start with one',
    },
    {
      name: 'Growth',
      price: '₹9,999',
      unit: 'per month',
      best: 'Most popular',
      features: [
        '4 SEO articles a month',
        'A simple monthly content plan',
        'Internal-linking + meta done for you',
        'Two revision rounds per piece',
        'Priority 2-day turnaround',
      ],
      highlight: true,
      cta: 'Book Growth',
    },
    {
      name: 'Scale',
      price: '₹18,999',
      unit: 'per month',
      best: 'For teams publishing weekly',
      features: [
        '8 SEO articles a month',
        'Keyword strategy + content calendar',
        'Briefs you can hand to anyone',
        'Unlimited light revisions',
        'A dedicated Slack/WhatsApp line',
      ],
      highlight: false,
      cta: 'Book Scale',
    },
  ],
} as const;
