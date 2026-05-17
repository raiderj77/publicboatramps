import { NextResponse } from 'next/server';

const BASE = 'https://publicboatramps.com';

export function GET() {
  const today = '2026-05-16';
  const staticUrls = [
    { loc: BASE, priority: '1.0', changefreq: 'weekly' },
    { loc: `${BASE}/about`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${BASE}/editorial`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${BASE}/editorial/contributors/marcus-whitfield`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${BASE}/contact`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${BASE}/privacy`, priority: '0.2', changefreq: 'yearly' },
    { loc: `${BASE}/terms`, priority: '0.2', changefreq: 'yearly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
