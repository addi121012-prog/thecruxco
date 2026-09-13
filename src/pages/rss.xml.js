import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site';

export async function GET(context) {
  const digests = await getCollection('digests', d => !d.data.draft && !d.slug.startsWith('drafts/'));
  const essays = await getCollection('essays', e => !e.data.draft);
  const reviews = await getCollection('reviews', r => !r.data.draft);
  const articles = await getCollection('articles', a => !a.data.draft);

  const reviewItems = reviews.map((r) => ({
    title: r.data.title,
    pubDate: r.data.updatedDate ?? r.data.pubDate,
    description: r.data.excerpt,
    link: `/reviews/${r.slug}/`,
  }));

  const guideItems = articles.map((a) => ({
    title: a.data.title,
    pubDate: a.data.updatedDate ?? a.data.pubDate,
    description: a.data.excerpt,
    link: `/guides/${a.slug}/`,
  }));

  const essayItems = essays.map((e) => ({
    title: e.data.title,
    pubDate: e.data.pubDate,
    description: e.data.excerpt,
    link: `/essays/${e.slug}/`,
  }));

  const digestItems = digests.map((d) => ({
    title: d.data.title,
    pubDate: d.data.date,
    description: d.data.editorsNote || 'From the archived daily digest (May–July 2026).',
    link: `/digest/${d.slug}/`,
  }));

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: [...reviewItems, ...guideItems, ...essayItems, ...digestItems].sort((a, b) => +b.pubDate - +a.pubDate),
    customData: `<language>en-in</language>`,
  });
}
