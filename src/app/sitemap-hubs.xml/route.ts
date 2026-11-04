import { NextResponse } from 'next/server';
import { countyHubs, cityHubs } from '@/lib/hubs';

const BASE = 'https://publicboatramps.com';
export function GET() {
  const entries = [...countyHubs.map(h => `/${h.stateSlug}/county/${h.slug}`), ...cityHubs.map(h => `/${h.stateSlug}/city/${h.slug}`)].sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(path => `  <url><loc>${BASE}${path}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n')}
</urlset>`;
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } });
}
