import { defineCollection, z } from 'astro:content';

/* ---------------- Existing: digests ---------------- */
const itemSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  source: z.string().url().optional(),
});

const categorySchema = z.object({
  name: z.string(),
  items: z.array(itemSchema).min(1).max(8),
});

const digests = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    editorsNote: z.string().optional(),
    categories: z.array(categorySchema).min(7).max(10),
    draft: z.boolean().default(false),
  }),
});

/* ---------------- Existing: essays ---------------- */
const essays = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    author: z.string(),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/* ---------------- New: reviews (Crux Picks — "The Cut") ----------------
   The money layer. One verdict + everything we rejected.
   NOTE: `draft` defaults to TRUE. This is the human-approval gate — a
   review only goes live once a person has verified the claims, prices and
   affiliate links and flipped draft to false. */
const linkedThing = z.object({
  name: z.string(),
  oneLiner: z.string(),
  forWho: z.string().optional(),
  price: z.string().optional(),
  url: z.string().optional(),          // affiliate/outbound URL (optional until added)
  rating: z.number().min(0).max(5).optional(),
});

const reviews = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),               // category slug (see src/config/categories.ts)
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('The Crux Co'),
    excerpt: z.string(),
    heroImage: z.string().optional(),
    verdict: z.string(),                // one line: what we'd actually get
    lastChecked: z.string().optional(), // e.g. "September 2026" — shown for trust
    testedCount: z.number().optional(), // how many options were considered
    pick: linkedThing,                  // the winner
    runnersUp: z.array(linkedThing).default([]),
    rejected: z.array(z.object({ name: z.string(), reason: z.string() })).default([]),
    comparison: z.object({
      columns: z.array(z.string()),
      rows: z.array(z.object({
        name: z.string(),
        cells: z.array(z.string()),
        url: z.string().optional(),
      })),
    }).optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
    editorNote: z.string().optional(),  // internal only — never rendered
    draft: z.boolean().default(true),
    featured: z.boolean().default(false),
  }),
});

/* ---------------- New: articles (Crux Guides — traffic layer) ----------------
   Informational how-to / explainer content that ranks and links INTO reviews.
   `draft` defaults to true as well, for consistency of the approval gate. */
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('The Crux Co'),
    excerpt: z.string(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    relatedReviews: z.array(z.string()).default([]), // review slugs to link to
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
    draft: z.boolean().default(true),
    featured: z.boolean().default(false),
  }),
});

export const collections = { digests, essays, reviews, articles };
