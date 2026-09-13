// Content categories — the taxonomy the hybrid model hangs on.
// Each category is a hub: reviews (money) + guides (traffic) cluster under it.
// Add a category here, then tag reviews/articles with its `slug`.

export interface Category {
  slug: string;
  name: string;
  tagline: string;        // short line under the category name
  description: string;    // meta description for the hub page
  intro: string;          // opening paragraph on the hub page
  commercialIntent: 'high' | 'medium' | 'low'; // internal planning signal
}

export const CATEGORIES: Category[] = [
  {
    slug: 'ai-tools',
    name: 'AI & Software Tools',
    tagline: 'We try the tools so you install one, not nine.',
    description:
      'Honest, tested verdicts on AI and software tools — one pick per job, plus everything we rejected and why. No sponsored rankings.',
    intro:
      'Every category of software now has fifty near-identical options and a review page for each that reads like it was written by the vendor. We do the opposite: pick one job, try the serious contenders, name the one worth paying for, and publish the ones that fell short — with the reason.',
    commercialIntent: 'high',
  },
  {
    slug: 'personal-finance',
    name: 'Personal Finance Tools',
    tagline: 'Money tools, judged on what they cost you — not what they pay us.',
    description:
      'Independent takes on budgeting apps, brokers, cards and money tools — one recommendation, the trade-offs stated plainly.',
    intro:
      'Money content online is mostly affiliate bait dressed as advice. We keep the affiliate links (they are disclosed) but we refuse to let the payout pick the winner. When the honest answer is "none of these, do this instead," that is what we publish.',
    commercialIntent: 'high',
  },
  {
    slug: 'health-wellness',
    name: 'Health & Wellness',
    tagline: 'Fewer products, checked properly.',
    description:
      'Evidence-first picks for health and wellness products — what the research supports, what is marketing, and the one worth buying.',
    intro:
      'This is the category where overclaiming does the most damage, so it gets the most caution. We separate what the evidence actually supports from what the label promises, and we would rather recommend nothing than recommend hopefully.',
    commercialIntent: 'medium',
  },
];

export const getCategory = (slug: string): Category | undefined =>
  CATEGORIES.find((c) => c.slug === slug);
