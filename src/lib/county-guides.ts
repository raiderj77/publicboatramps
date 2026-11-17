// County-level fee, parking and local notes for hub pages.
// Content lives in src/data/county_guides.json, keyed by "<stateSlug>/<countySlug>".
// Every entry is written from the managing agencies' own published pages plus this
// directory's source records, and carries the date it was checked.
import guides from '@/data/county_guides.json';

export type CountyGuideSource = { label: string; url?: string };
export type CountyGuide = {
  county: string;
  checked: string;
  intro: string;
  notes: string[];
  sources: CountyGuideSource[];
};

const guideMap = guides as Record<string, CountyGuide>;

export function getCountyGuide(stateSlug: string, countySlug: string): CountyGuide | null {
  return guideMap[`${stateSlug}/${countySlug}`] ?? null;
}
