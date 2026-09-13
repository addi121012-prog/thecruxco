import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site';

export async function GET(context) {
  const essays = await getCollection('essays', e => !e.data.draft);
  const reviews = await getCollection('reviews', r => !r.data.draft);
  const reviewItems = reviews.map((r) => ({ title: r.data.title, pubDate: r.data.updatedDate ?? r.data.pubDate, description: r.data.excerpt, link: `/reviews/${r.slug}/` }));
  const essayItems = essays.map((e) => ({ title: e.data.title, pubDate: e.data.pubDate, description: e.data.excerpt, link: `/essays/${e.slug}/` }));
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: [...reviewItems, ...essayItems].sort((a, b) => +b.pubDate - +a.pubDate),
    customData: `<language>en-in</language>`,
  });
}
