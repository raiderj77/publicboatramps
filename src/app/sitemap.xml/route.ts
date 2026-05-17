import { NextResponse } from 'next/server';

const BASE = 'https://publicboatramps.com';

export function GET() {
  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE}/sitemap-states.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE}/sitemap-ramps.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
