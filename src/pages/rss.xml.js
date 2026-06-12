import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const digests = await getCollection('digests', d => !d.data.draft && !d.slug.startsWith('drafts/'));
  const essays = await getCollection('essays', e => !e.data.draft);

  const digestItems = digests.map((d) => ({
    title: d.data.title,
    pubDate: d.data.date,
    description: d.data.editorsNote || 'Today’s digest — six categories, thirty items, under five minutes.',
    link: `/digest/${d.slug}/`,
  }));

  const essayItems = essays.map((e) => ({
    title: e.data.title,
    pubDate: e.data.pubDate,
    description: e.data.excerpt,
    link: `/essays/${e.slug}/`,
  }));

  return rss({
    title: 'TheCruxCo',
    description: 'Daily knowledge-first news digest for ambitious Indians. Signal over noise.',
    site: context.site,
    items: [...digestItems, ...essayItems].sort((a, b) => +b.pubDate - +a.pubDate),
    customData: `<language>en-in</language>`,
  });
}
