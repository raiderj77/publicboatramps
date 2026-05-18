import locations from '@/data/locations';
import { isIndexable } from '@/lib/quality-gate';

export type ActiveState = {
  stateSlug: string;
  state: string;
  indexableCount: number;
};

export type PopularWaterBody = {
  stateSlug: string;
  stateAbbr: string;
  waterBodySlug: string;
  waterBodyName: string;
  rampCount: number;
};

const STATE_NAMES: Record<string, string> = {
  alabama: 'Alabama', alaska: 'Alaska', arizona: 'Arizona', arkansas: 'Arkansas',
  california: 'California', colorado: 'Colorado', connecticut: 'Connecticut', delaware: 'Delaware',
  florida: 'Florida', georgia: 'Georgia', hawaii: 'Hawaii', idaho: 'Idaho',
  illinois: 'Illinois', indiana: 'Indiana', iowa: 'Iowa', kansas: 'Kansas',
  kentucky: 'Kentucky', louisiana: 'Louisiana', maine: 'Maine', maryland: 'Maryland',
  massachusetts: 'Massachusetts', michigan: 'Michigan', minnesota: 'Minnesota', mississippi: 'Mississippi',
  missouri: 'Missouri', montana: 'Montana', nebraska: 'Nebraska', nevada: 'Nevada',
  'new-hampshire': 'New Hampshire', 'new-jersey': 'New Jersey', 'new-mexico': 'New Mexico', 'new-york': 'New York',
  'north-carolina': 'North Carolina', 'north-dakota': 'North Dakota', ohio: 'Ohio', oklahoma: 'Oklahoma',
  oregon: 'Oregon', pennsylvania: 'Pennsylvania', 'rhode-island': 'Rhode Island', 'south-carolina': 'South Carolina',
  'south-dakota': 'South Dakota', tennessee: 'Tennessee', texas: 'Texas', utah: 'Utah',
  vermont: 'Vermont', virginia: 'Virginia', washington: 'Washington', 'west-virginia': 'West Virginia',
  wisconsin: 'Wisconsin', wyoming: 'Wyoming',
};

const STATE_ABBR: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR',
  california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new-hampshire': 'NH', 'new-jersey': 'NJ', 'new-mexico': 'NM', 'new-york': 'NY',
  'north-carolina': 'NC', 'north-dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
  'south-dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west-virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY',
};

function modalValue<T>(items: T[]): T | null {
  if (!items.length) return null;
  const counts = new Map<T, number>();
  for (const v of items) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

const indexable = (locations as Record<string, unknown>[]).filter(isIndexable);

const stateCountMap = new Map<string, number>();
for (const r of indexable) {
  const s = r.stateSlug as string;
  stateCountMap.set(s, (stateCountMap.get(s) ?? 0) + 1);
}

export const activeStates: ActiveState[] = [...stateCountMap.entries()]
  .map(([slug, count]) => ({
    stateSlug: slug,
    state: STATE_NAMES[slug] ?? slug,
    indexableCount: count,
  }))
  .sort((a, b) => a.state.localeCompare(b.state));

interface WbEntry {
  stateSlug: string;
  waterBodySlug: string;
  count: number;
  names: string[];
}

const wbMap = new Map<string, WbEntry>();
for (const r of indexable) {
  const wb = r.waterBodySlug as string | null;
  const state = r.stateSlug as string;
  if (!wb || !state) continue;
  const key = `${state}::${wb}`;
  const entry = wbMap.get(key);
  if (entry) {
    entry.count++;
    if (r.waterBodyName) entry.names.push(r.waterBodyName as string);
  } else {
    wbMap.set(key, {
      stateSlug: state,
      waterBodySlug: wb,
      count: 1,
      names: r.waterBodyName ? [r.waterBodyName as string] : [],
    });
  }
}

export const popularWaterBodies: PopularWaterBody[] = [...wbMap.values()]
  .filter(v => v.count >= 3)
  .sort((a, b) => b.count - a.count)
  .slice(0, 10)
  .map(v => ({
    stateSlug: v.stateSlug,
    stateAbbr: STATE_ABBR[v.stateSlug] ?? v.stateSlug.toUpperCase().slice(0, 2),
    waterBodySlug: v.waterBodySlug,
    waterBodyName: modalValue(v.names) ?? v.waterBodySlug,
    rampCount: v.count,
  }));
