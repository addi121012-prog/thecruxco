import { getCollection } from 'astro:content';
import { CATEGORIES } from '../config/categories';
import { SITE } from '../config/site';

export async function GET() {
  const essays = await getCollection('essays', e => !e.data.draft);
  const reviews = await getCollection('reviews', r => !r.data.draft);

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/reviews/', priority: '0.9', changefreq: 'weekly' },
    { url: '/essays/', priority: '0.9', changefreq: 'daily' },
    { url: '/pricing/', priority: '0.9', changefreq: 'monthly' },
    { url: '/about/', priority: '0.6', changefreq: 'monthly' },
    { url: '/contact/', priority: '0.4', changefreq: 'monthly' },
    { url: '/disclosure/', priority: '0.3', changefreq: 'yearly' },
    { url: '/privacy/', priority: '0.3', changefreq: 'yearly' },
  ];
  const topicUrls = CATEGORIES.map((c) => ({ url: `/topics/${c.slug}/`, priority: '0.7', changefreq: 'weekly' }));
  const reviewUrls = reviews
    .sort((a, b) => +(b.data.updatedDate ?? b.data.pubDate) - +(a.data.updatedDate ?? a.data.pubDate))
    .map((r) => ({ url: `/reviews/${r.slug}/`, priority: '0.9', changefreq: 'monthly', lastmod: (r.data.updatedDate ?? r.data.pubDate).toISOString().split('T')[0] }));
  const essayUrls = essays
    .sort((a, b) => +b.data.pubDate - +a.data.pubDate)
    .map((e) => ({ url: `/essays/${e.slug}/`, priority: '0.7', changefreq: 'monthly', lastmod: e.data.pubDate.toISOString().split('T')[0] }));

  const allUrls = [...staticPages, ...topicUrls, ...reviewUrls, ...essayUrls];
  const today = new Date().toISOString().split('T')[0];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${SITE.url}${u.url}</loc>
    <lastmod>${u.lastmod ?? today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
