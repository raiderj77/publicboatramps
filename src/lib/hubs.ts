import locations from '@/data/locations';
import { isIndexable } from '@/lib/quality-gate';
import type { RampRow } from '@/components/StateRampListing';

// Only counties with at least 10 and cities with at least 8 indexable ramps get hubs.
export const COUNTY_FLOOR = 10;
export const CITY_FLOOR = 8;
export const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
type CityLink = { name: string; citySlug: string; count: number };
type Hub = { stateSlug: string; state: string; name: string; slug: string; ramps: RampRow[]; rampCount: number; freeCount: number; waterBodies: { slug: string; name: string; count: number }[] };
export type CountyHub = Hub & { cities: CityLink[] };
export type CityHub = Hub & { county: { name: string; countySlug: string } | null; otherCities: CityLink[] };
type RecordRow = Record<string, unknown>;
const indexed = (locations as RecordRow[]).filter(isIndexable);
const waterCounts = new Map<string, number>();
for (const r of indexed) {
  const key = `${r.stateSlug}:${r.waterBodySlug}`;
  waterCounts.set(key, (waterCounts.get(key) ?? 0) + 1);
}
function groups(field: 'county' | 'city', floor: number): Hub[] {
  const grouped = new Map<string, RecordRow[]>();
  for (const r of indexed) {
    if (typeof r[field] !== 'string' || !r[field].trim()) continue;
    const key = `${r.stateSlug}:${slugify(r[field])}`;
    grouped.set(key, [...(grouped.get(key) ?? []), r]);
  }
  return [...grouped.values()].filter(rows => rows.length >= floor).map(rows => {
    const first = rows[0];
    const water = new Map<string, { slug: string; name: string; count: number }>();
    for (const r of rows) {
      if (!r.waterBodySlug || !r.waterBodyName) continue;
      const slug = String(r.waterBodySlug);
      // Existing water-body pages require at least three records across the state.
      if ((waterCounts.get(`${r.stateSlug}:${slug}`) ?? 0) < 3) continue;
      const entry = water.get(slug) ?? { slug, name: String(r.waterBodyName), count: 0 };
      entry.count++;
      water.set(slug, entry);
    }
    const ramps: RampRow[] = rows.map(r => ({
      slug: String(r.slug), name: String(r.name), stateSlug: String(r.stateSlug),
      city: r.city ? String(r.city) : null, county: r.county ? String(r.county) : null,
      totalLanes: r.totalLanes == null ? null : Number(r.totalLanes),
      rampSurface: r.rampSurface ? String(r.rampSurface) : null,
      accessibilityLevel: r.accessibilityLevel ? String(r.accessibilityLevel) : null,
      isFeeRequired: r.isFeeRequired ? String(r.isFeeRequired) : null,
      isRestroomAccessible: r.isRestroomAccessible ? String(r.isRestroomAccessible) : null,
    }));
    return { stateSlug: String(first.stateSlug), state: String(first.state), name: String(first[field]), slug: slugify(String(first[field])), ramps, rampCount: rows.length, freeCount: rows.filter(r => r.isFeeRequired === 'No').length, waterBodies: [...water.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 8) };
  }).sort((a, b) => a.stateSlug.localeCompare(b.stateSlug) || a.name.localeCompare(b.name));
}
export const countyHubs: CountyHub[] = groups('county', COUNTY_FLOOR).map(h => ({ ...h, cities: [] }));
export const cityHubs: CityHub[] = groups('city', CITY_FLOOR).map(h => {
  const counts = new Map<string, number>();
  for (const r of h.ramps) if (r.county) counts.set(r.county, (counts.get(r.county) ?? 0) + 1);
  const name = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
  const county = countyHubs.find(c => c.stateSlug === h.stateSlug && c.slug === slugify(name ?? ''));
  return { ...h, county: county ? { name: county.name, countySlug: county.slug } : null, otherCities: [] };
});
for (const h of countyHubs) h.cities = cityHubs.filter(c => c.stateSlug === h.stateSlug && h.ramps.some(r => slugify(r.city ?? '') === c.slug)).map(c => ({ name: c.name, citySlug: c.slug, count: h.ramps.filter(r => slugify(r.city ?? '') === c.slug).length })).filter(c => c.count >= CITY_FLOOR);
for (const h of cityHubs) h.otherCities = h.county ? cityHubs.filter(c => c.stateSlug === h.stateSlug && c.slug !== h.slug && c.county?.countySlug === h.county?.countySlug).map(c => ({ name: c.name, citySlug: c.slug, count: c.rampCount })) : [];
export const getCountyHub = (stateSlug: string, countySlug: string) => countyHubs.find(h => h.stateSlug === stateSlug && h.slug === countySlug);
export const getCityHub = (stateSlug: string, citySlug: string) => cityHubs.find(h => h.stateSlug === stateSlug && h.slug === citySlug);
export const countyHubsForState = (stateSlug: string) => countyHubs.filter(h => h.stateSlug === stateSlug);
export const cityHubsForState = (stateSlug: string) => cityHubs.filter(h => h.stateSlug === stateSlug);
