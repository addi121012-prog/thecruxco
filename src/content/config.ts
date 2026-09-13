import { defineCollection, z } from 'astro:content';

/* ---------------- The Brief (daily takes; folder stays `essays`) ---------------- */
const essays = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('The Crux'),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/* ---------------- Reviews (affiliate money layer) ---------------- */
const linkedThing = z.object({
  name: z.string(),
  oneLiner: z.string(),
  forWho: z.string().optional(),
  price: z.string().optional(),
  url: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
});

const reviews = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('The Crux'),
    excerpt: z.string(),
    heroImage: z.string().optional(),
    verdict: z.string(),
    lastChecked: z.string().optional(),
    testedCount: z.number().optional(),
    pick: linkedThing,
    runnersUp: z.array(linkedThing).default([]),
    rejected: z.array(z.object({ name: z.string(), reason: z.string() })).default([]),
    comparison: z.object({
      columns: z.array(z.string()),
      rows: z.array(z.object({ name: z.string(), cells: z.array(z.string()), url: z.string().optional() })),
    }).optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
    editorNote: z.string().optional(),
    draft: z.boolean().default(true),
    featured: z.boolean().default(false),
  }),
});

export const collections = { essays, reviews };
