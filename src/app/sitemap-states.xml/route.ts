import { NextResponse } from 'next/server';
import locations from '@/data/locations.json';

const BASE = 'https://publicboatramps.com';

export function GET() {
  const today = '2026-05-16';
  const stateSlugs = Array.from(new Set((locations as any[]).map(l => l.stateSlug))).sort() as string[];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${stateSlugs.map(slug => `  <url>
    <loc>${BASE}/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
