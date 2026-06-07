import { defineCollection, z } from 'astro:content';

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

export const collections = { digests, essays };
