import { NextResponse } from 'next/server';
import locations from '@/data/locations.json';
import { isIndexable } from '@/lib/quality-gate';

const BASE = 'https://publicboatramps.com';

export function GET() {
  const indexableRamps = (locations as any[]).filter(isIndexable);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexableRamps.map(r => {
  const lastmod = r.lastEditedDate
    ? new Date(r.lastEditedDate).toISOString().split('T')[0]
    : '2026-05-16';
  return `  <url>
    <loc>${BASE}/${r.stateSlug}/${r.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
}).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
