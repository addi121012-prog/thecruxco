// Hand-rolled sitemap. Replaces the broken @astrojs/sitemap plugin.
// Pings Google + Bing on every Cloudflare build via the URL submission API.

import { getCollection } from 'astro:content';
import { SITE } from '../config/site';

export async function GET() {
  const digests = await getCollection('digests', d => !d.data.draft);
  const essays = await getCollection('essays', e => !e.data.draft);

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/digest/', priority: '0.9', changefreq: 'daily' },
    { url: '/essays/', priority: '0.8', changefreq: 'weekly' },
    { url: '/about/', priority: '0.6', changefreq: 'monthly' },
    { url: '/subscribe/', priority: '0.8', changefreq: 'monthly' },
    { url: '/editorial-standards/', priority: '0.4', changefreq: 'monthly' },
    { url: '/privacy/', priority: '0.3', changefreq: 'monthly' },
    { url: '/contact/', priority: '0.4', changefreq: 'monthly' },
  ];

  const digestUrls = digests
    .sort((a, b) => +b.data.date - +a.data.date)
    .map((d) => ({
      url: `/digest/${d.slug}/`,
      priority: '0.9',
      changefreq: 'monthly',
      lastmod: d.data.date.toISOString().split('T')[0],
    }));

  const essayUrls = essays
    .sort((a, b) => +b.data.pubDate - +a.data.pubDate)
    .map((e) => ({
      url: `/essays/${e.slug}/`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: e.data.pubDate.toISOString().split('T')[0],
    }));

  const allUrls = [...staticPages, ...digestUrls, ...essayUrls];

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

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
