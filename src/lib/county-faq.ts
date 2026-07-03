import locationsRaw from '@/data/locations';
import { isIndexable } from '@/lib/quality-gate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>;

// Appends "County" unless the stored name already ends with County/Parish/Borough.
export function countyLabel(county: string): string {
  const t = county.trim();
  const l = t.toLowerCase();
  if (l.endsWith(' county') || l.endsWith(' parish') || l.endsWith(' borough')) return t;
  return `${t} County`;
}

function isAdaRamp(loc: AnyRec): boolean {
  const level = loc.accessibilityLevel;
  if (level && typeof level === 'string') {
    if (
      level.includes('High Level') ||
      level.includes('Moderate Level') ||
      level.includes('Fully') ||
      level.includes('Partially')
    ) return true;
  }
  return loc.isRestroomAccessible === 'Yes';
}

// Normalize the 290+ rampSurface values to ~8 canonical buckets.
function normalizeSurface(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes('concrete')) return 'Concrete';
  if (s.includes('asphalt')) return 'Asphalt';
  if (s.includes('gravel')) return 'Gravel';
  if (s.includes('sand')) return 'Sand';
  if (
    s.includes('natural') ||
    s.includes('earthen') ||
    s.includes('dirt') ||
    s.includes('soil') ||
    s.includes('bank')
  ) return 'Natural/Earthen';
  if (s.includes('rock') || s.includes('stone') || s.includes('cobble')) return 'Rock/Stone';
  if (s.includes('grass')) return 'Grass';
  return raw.split(',')[0].trim();
}

interface CountyAgg {
  county: string;   // raw stored value, e.g. "Marion"
  state: string;    // e.g. "Florida"
  stateSlug: string;
  rampCount: number;
  freeCount: number;
  feeDataCount: number;
  adaCount: number;
  waterTypeSet: Set<string>;
  waterBodySet: Set<string>;
  surfaceCounts: Map<string, number>;
}

// Build aggregation at module load ,  runs once at build time (SSG).
const countyMap = new Map<string, CountyAgg>();

for (const loc of locationsRaw as AnyRec[]) {
  if (!isIndexable(loc)) continue;
  const county = loc.county;
  const stateSlug = loc.stateSlug;
  if (!county || typeof county !== 'string' || !stateSlug) continue;

  const key = `${stateSlug}|${county}`;
  if (!countyMap.has(key)) {
    countyMap.set(key, {
      county,
      state: String(loc.state ?? ''),
      stateSlug: String(stateSlug),
      rampCount: 0,
      freeCount: 0,
      feeDataCount: 0,
      adaCount: 0,
      waterTypeSet: new Set(),
      waterBodySet: new Set(),
      surfaceCounts: new Map(),
    });
  }

  const agg = countyMap.get(key)!;
  agg.rampCount++;

  if (loc.isFeeRequired === 'No' || loc.isFeeRequired === 'Yes') {
    agg.feeDataCount++;
    if (loc.isFeeRequired === 'No') agg.freeCount++;
  }

  if (isAdaRamp(loc)) agg.adaCount++;

  if (
    loc.waterType &&
    typeof loc.waterType === 'string' &&
    loc.waterType !== 'Unknown' &&
    loc.waterType !== 'N/A'
  ) {
    agg.waterTypeSet.add(loc.waterType);
  }

  if (
    loc.waterBodyName &&
    typeof loc.waterBodyName === 'string' &&
    loc.waterBodyName !== 'Unknown' &&
    loc.waterBodyName !== 'N/A'
  ) {
    agg.waterBodySet.add(loc.waterBodyName);
  }

  if (
    loc.rampSurface &&
    typeof loc.rampSurface === 'string' &&
    loc.rampSurface !== 'Unknown' &&
    loc.rampSurface !== 'N/A'
  ) {
    const norm = normalizeSurface(loc.rampSurface);
    agg.surfaceCounts.set(norm, (agg.surfaceCounts.get(norm) ?? 0) + 1);
  }
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CountyFaqResult {
  faqs: FaqItem[];
  stats: {
    rampCount: number;
    freeCount: number;
    feeDataCount: number;
    adaCount: number;
    waterBodyCount: number;
    waterTypes: string[];
    dominantSurface: string | null;
    dominantSurfaceCount: number;
  };
}

function buildFaqs(agg: CountyAgg): FaqItem[] {
  const { county, state, rampCount, freeCount, feeDataCount, adaCount,
    waterTypeSet, waterBodySet, surfaceCounts } = agg;

  const label = countyLabel(county);
  const waterBodyCount = waterBodySet.size;
  const waterTypes = Array.from(waterTypeSet);
  const faqs: FaqItem[] = [];

  // Q1: Total ramp count ,  always emit
  let waterBodyPhrase = '';
  if (waterBodyCount > 1) {
    waterBodyPhrase = `, offering access to ${waterBodyCount} different water bodies`;
  } else if (waterBodyCount === 1) {
    waterBodyPhrase = `, with access to ${Array.from(waterBodySet)[0]}`;
  }
  faqs.push({
    question: `How many public boat ramps are in ${label}?`,
    answer: `There ${rampCount === 1 ? 'is' : 'are'} ${rampCount} public boat ramp${rampCount !== 1 ? 's' : ''} in ${label}, ${state} listed in our directory${waterBodyPhrase}.`,
  });

  // Q2: Free access ,  only if fee data exists and some ramps are free.
  // Avoid "most" language for small samples (feeDataCount < 3).
  if (feeDataCount > 0 && freeCount > 0) {
    let answer: string;
    if (feeDataCount >= 3 && freeCount / feeDataCount >= 0.75) {
      answer = `Yes ,  most ramps in ${label} with known fee status (${freeCount} of ${feeDataCount}) offer free public access. Fees can change seasonally, so confirm before visiting.`;
    } else if (feeDataCount <= 2 && freeCount === feeDataCount) {
      // All known ramps are free but sample is too small to say "most"
      answer = feeDataCount === 1
        ? `The one ramp in ${label} with known fee data is free to launch. Fees can change, so confirm before visiting.`
        : `Both ramps in ${label} with known fee data offer free public access. Confirm before visiting as fees can change.`;
    } else {
      answer = `${freeCount} of the ${feeDataCount} ramps in ${label} with known fee information offer free access. The remainder charge a launch fee ,  contact the managing agency for current rates.`;
    }
    faqs.push({ question: `Are there free boat ramps in ${label}?`, answer });
  }

  // Q3: ADA accessibility ,  only if any are accessible
  if (adaCount > 0) {
    const plural = adaCount !== 1;
    faqs.push({
      question: `Are there ADA-accessible boat ramps in ${label}?`,
      answer: `${adaCount} boat ramp${plural ? 's' : ''} in ${label} report${plural ? '' : 's'} ADA-accessible facilities. Features vary by site but may include accessible parking, restrooms, and launch areas. Call ahead to confirm current conditions before visiting.`,
    });
  }

  // Q4: Water type ,  only if waterType data exists
  if (waterTypes.length > 0) {
    const hasFresh = waterTypes.some(t => t === 'Freshwater');
    const hasSalt = waterTypes.some(
      t => t.toLowerCase().includes('salt') || t.toLowerCase().includes('brackish'),
    );
    let waterDesc: string;
    if (hasFresh && hasSalt) {
      waterDesc = 'both freshwater inland lakes and rivers, and saltwater or brackish coastal waterways';
    } else if (hasSalt) {
      waterDesc = 'saltwater and brackish coastal waterways';
    } else {
      waterDesc = 'freshwater lakes and rivers';
    }
    const closingClause =
      waterBodyCount > 1
        ? `The county's ${waterBodyCount} water bodies offer a variety of fishing, boating, and recreation opportunities.`
        : waterBodyCount === 1
          ? `The primary launch destination is ${Array.from(waterBodySet)[0]}.`
          : 'Verify specific water body access at each launch site.';
    faqs.push({
      question: `What type of water access is available in ${label}?`,
      answer: `Boat ramps in ${label} provide access to ${waterDesc}. ${closingClause}`,
    });
  }

  // Q5: Dominant surface ,  only if ≥2 ramps share a normalized surface
  if (surfaceCounts.size > 0) {
    let topSurface = '';
    let topCount = 0;
    for (const [surf, count] of surfaceCounts) {
      if (count > topCount) { topSurface = surf; topCount = count; }
    }
    if (topCount >= 2) {
      faqs.push({
        question: `What is the most common boat ramp surface in ${label}?`,
        answer: `${topSurface} is the most common ramp surface in ${label}, found at ${topCount} of the ${rampCount} boat ramp${rampCount !== 1 ? 's' : ''} in our directory. Surface type affects traction and trailer loading ,  particularly important in wet or winter conditions.`,
      });
    }
  }

  return faqs;
}

export function getCountyFaq(stateSlug: string, county: string): CountyFaqResult | null {
  if (!stateSlug || !county) return null;
  const key = `${stateSlug}|${county}`;
  const agg = countyMap.get(key);
  if (!agg) return null;

  const faqs = buildFaqs(agg);
  if (faqs.length < 2) return null;

  let dominantSurface: string | null = null;
  let dominantSurfaceCount = 0;
  for (const [surf, count] of agg.surfaceCounts) {
    if (count > dominantSurfaceCount) { dominantSurface = surf; dominantSurfaceCount = count; }
  }

  return {
    faqs,
    stats: {
      rampCount: agg.rampCount,
      freeCount: agg.freeCount,
      feeDataCount: agg.feeDataCount,
      adaCount: agg.adaCount,
      waterBodyCount: agg.waterBodySet.size,
      waterTypes: Array.from(agg.waterTypeSet),
      dominantSurface,
      dominantSurfaceCount,
    },
  };
}
