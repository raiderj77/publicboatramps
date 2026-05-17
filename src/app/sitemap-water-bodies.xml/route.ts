import { NextResponse } from 'next/server';
import locations from '@/data/locations';
import { isIndexable } from '@/lib/quality-gate';

const BASE = 'https://publicboatramps.com';

export function GET() {
  const indexable = (locations as any[]).filter(isIndexable);

  const groups = new Map<string, { state: string; slug: string; count: number; dates: string[] }>();
  for (const r of indexable) {
    const wb = r.waterBodySlug as string | null;
    const state = r.stateSlug as string | null;
    if (!wb || !state) continue;
    const key = `${state}::${wb}`;
    const entry = groups.get(key);
    if (entry) {
      entry.count++;
      if (r.lastEditedDate) entry.dates.push(r.lastEditedDate);
    } else {
      groups.set(key, { state, slug: wb, count: 1, dates: r.lastEditedDate ? [r.lastEditedDate] : [] });
    }
  }

  const entries = [...groups.values()]
    .filter(v => v.count >= 3)
    .map(v => ({
      state: v.state,
      slug: v.slug,
      lastmod: v.dates.length
      ? new Date([...v.dates].sort().reverse()[0]).toISOString().split('T')[0]
      : '2026-05-17',
    }))
    .sort((a, b) => `${a.state}/${a.slug}`.localeCompare(`${b.state}/${b.slug}`));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${BASE}/${e.state}/water-body/${e.slug}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
