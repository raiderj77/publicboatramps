import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import locations from '@/data/locations';
import { isIndexable } from '@/lib/quality-gate';
import { getAllArticles } from '@/lib/editorial';
import { activeStates } from '@/lib/nav-data';
import StateRampListing, { type RampRow } from '@/components/StateRampListing';

export const revalidate = 86400;

const stateList = [
  { name: 'Alabama', slug: 'alabama' }, { name: 'Alaska', slug: 'alaska' },
  { name: 'Arizona', slug: 'arizona' }, { name: 'Arkansas', slug: 'arkansas' },
  { name: 'California', slug: 'california' }, { name: 'Colorado', slug: 'colorado' },
  { name: 'Connecticut', slug: 'connecticut' }, { name: 'Delaware', slug: 'delaware' },
  { name: 'Florida', slug: 'florida' }, { name: 'Georgia', slug: 'georgia' },
  { name: 'Hawaii', slug: 'hawaii' }, { name: 'Idaho', slug: 'idaho' },
  { name: 'Illinois', slug: 'illinois' }, { name: 'Indiana', slug: 'indiana' },
  { name: 'Iowa', slug: 'iowa' }, { name: 'Kansas', slug: 'kansas' },
  { name: 'Kentucky', slug: 'kentucky' }, { name: 'Louisiana', slug: 'louisiana' },
  { name: 'Maine', slug: 'maine' }, { name: 'Maryland', slug: 'maryland' },
  { name: 'Massachusetts', slug: 'massachusetts' }, { name: 'Michigan', slug: 'michigan' },
  { name: 'Minnesota', slug: 'minnesota' }, { name: 'Mississippi', slug: 'mississippi' },
  { name: 'Missouri', slug: 'missouri' }, { name: 'Montana', slug: 'montana' },
  { name: 'Nebraska', slug: 'nebraska' }, { name: 'Nevada', slug: 'nevada' },
  { name: 'New Hampshire', slug: 'new-hampshire' }, { name: 'New Jersey', slug: 'new-jersey' },
  { name: 'New Mexico', slug: 'new-mexico' }, { name: 'New York', slug: 'new-york' },
  { name: 'North Carolina', slug: 'north-carolina' }, { name: 'North Dakota', slug: 'north-dakota' },
  { name: 'Ohio', slug: 'ohio' }, { name: 'Oklahoma', slug: 'oklahoma' },
  { name: 'Oregon', slug: 'oregon' }, { name: 'Pennsylvania', slug: 'pennsylvania' },
  { name: 'Rhode Island', slug: 'rhode-island' }, { name: 'South Carolina', slug: 'south-carolina' },
  { name: 'South Dakota', slug: 'south-dakota' }, { name: 'Tennessee', slug: 'tennessee' },
  { name: 'Texas', slug: 'texas' }, { name: 'Utah', slug: 'utah' },
  { name: 'Vermont', slug: 'vermont' }, { name: 'Virginia', slug: 'virginia' },
  { name: 'Washington', slug: 'washington' }, { name: 'West Virginia', slug: 'west-virginia' },
  { name: 'Wisconsin', slug: 'wisconsin' }, { name: 'Wyoming', slug: 'wyoming' },
];

function getStateName(slug: string) {
  return stateList.find(s => s.slug === slug)?.name ?? slug;
}

function adaScore(level: string | null): number {
  if (!level) return 0;
  if (level.includes('High Level') || level.includes('Fully')) return 3;
  if (level.includes('Moderate Level') || level.includes('Partially')) return 2;
  if (level.includes('Low Level')) return 1;
  return 0;
}

function isAdaRecord(loc: Record<string, unknown>): boolean {
  const al = String(loc.accessibilityLevel ?? '');
  return al.includes('High Level') || al.includes('Moderate Level') ||
    al.includes('Fully') || al.includes('Partially') ||
    loc.isRestroomAccessible === 'Yes';
}

function normalizeCounty(c: unknown): string | null {
  if (!c || typeof c !== 'string') return null;
  return c.replace(/\s+County$/i, '').trim();
}

// Per-state county allowlists (normalized ,  no "County" suffix).
// Used to exclude border-area records mislabeled with a neighboring state's county.
const STATE_COUNTY_SETS: Partial<Record<string, Set<string>>> = {
  florida: new Set([
    'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun',
    'Charlotte', 'Citrus', 'Clay', 'Collier', 'Columbia', 'Desoto', 'Dixie',
    'Duval', 'Escambia', 'Flagler', 'Franklin', 'Gadsden', 'Gilchrist', 'Glades',
    'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando', 'Highlands', 'Hillsborough',
    'Holmes', 'Indian River', 'Jackson', 'Jefferson', 'Lafayette', 'Lake', 'Lee',
    'Leon', 'Levy', 'Liberty', 'Madison', 'Manatee', 'Marion', 'Martin',
    'Miami-Dade', 'Monroe', 'Nassau', 'Okaloosa', 'Okeechobee', 'Orange', 'Osceola',
    'Palm Beach', 'Pasco', 'Pinellas', 'Polk', 'Putnam', 'Saint Johns', 'Saint Lucie',
    'Santa Rosa', 'Sarasota', 'Seminole', 'Sumter', 'Suwannee', 'Taylor', 'Union',
    'Volusia', 'Wakulla', 'Walton', 'Washington',
  ]),
};

function waterTypeLabel(wt: unknown): string | null {
  const s = String(wt ?? '');
  if (s.includes('Salt') || s.includes('Brackish')) return 'Saltwater';
  if (s.includes('Fresh')) return 'Freshwater';
  return null;
}

interface WaterBody {
  name: string;
  slug: string;
  count: number;
  waterType: string | null;
}

interface StateSignals {
  totalRamps: number;
  indexableCount: number;
  freeCount: number;
  adaCount: number;
  hasFwcData: boolean;
  countyCount: number;
  waterBodyDistribution: WaterBody[];
  topRamps: Record<string, unknown>[];
  listingRamps: RampRow[];
}

function computeSignals(stateSlug: string): StateSignals {
  const all = (locations as Record<string, unknown>[]).filter(l => l.stateSlug === stateSlug);
  const indexable = all.filter(l => isIndexable(l));

  const freeCount   = indexable.filter(l => l.isFeeRequired === 'No').length;
  const adaCount    = indexable.filter(isAdaRecord).length;
  const hasFwcData  = all.some(l => l.dataSource === 'FWC_FL');
  const normalizedCounties = new Set(indexable.map(l => normalizeCounty(l.county)).filter(Boolean) as string[]);
  const allowlist = STATE_COUNTY_SETS[stateSlug];
  const counties  = allowlist
    ? new Set([...normalizedCounties].filter(c => allowlist.has(c)))
    : normalizedCounties;

  // Water body distribution (indexable ramps only)
  const wbMap = new Map<string, { count: number; slug: string; waterType: string | null }>();
  for (const r of indexable) {
    const name = r.waterBodyName as string | null;
    if (!name) continue;
    const existing = wbMap.get(name);
    if (existing) {
      existing.count++;
    } else {
      wbMap.set(name, {
        count: 1,
        slug: (r.waterBodySlug as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        waterType: r.waterType as string | null,
      });
    }
  }
  const wbFiltered = [...wbMap.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count);

  const waterBodyDistribution: WaterBody[] = wbFiltered.length >= 8
    ? wbFiltered.slice(0, 12).map(([name, v]) => ({ name, ...v }))
    : [];

  // Top 6 ramps by lanes then ADA
  const topRamps = [...indexable]
    .sort((a, b) => {
      const ld = (Number(b.totalLanes) || 0) - (Number(a.totalLanes) || 0);
      return ld !== 0 ? ld : adaScore(b.accessibilityLevel as string | null) - adaScore(a.accessibilityLevel as string | null);
    })
    .slice(0, 6);

  // Slim listing payload for client component
  const listingRamps: RampRow[] = indexable.map(r => ({
    slug:               String(r.slug),
    name:               String(r.name),
    city:               r.city ? String(r.city) : null,
    county:             normalizeCounty(r.county),
    totalLanes:         r.totalLanes != null ? Number(r.totalLanes) : null,
    rampSurface:        r.rampSurface ? String(r.rampSurface) : null,
    accessibilityLevel: r.accessibilityLevel ? String(r.accessibilityLevel) : null,
    isFeeRequired:      r.isFeeRequired ? String(r.isFeeRequired) : null,
    isRestroomAccessible: r.isRestroomAccessible ? String(r.isRestroomAccessible) : null,
    stateSlug:          String(r.stateSlug),
  }));

  return {
    totalRamps: indexable.length,
    indexableCount: indexable.length,
    freeCount,
    adaCount,
    hasFwcData,
    countyCount: counties.size,
    waterBodyDistribution,
    topRamps,
    listingRamps,
  };
}

export async function generateStaticParams() {
  return activeStates.map(s => ({ state: s.stateSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const stateName = getStateName(state);
  const sig = computeSignals(state);
  const descParts = [`Find ${sig.totalRamps.toLocaleString()} source-attributed public boat-ramp records in ${stateName}.`];
  if (sig.freeCount > 0) descParts.push(`${sig.freeCount.toLocaleString()} with no launch fee recorded in source data.`);
  return {
    title: `Public Boat Ramps in ${stateName}`,
    description: descParts.join(' '),
    alternates: { canonical: `https://publicboatramps.com/${state}` },
    openGraph: {
      title: `Public Boat Ramps in ${stateName}`,
      description: descParts.join(' '),
      url: `https://publicboatramps.com/${state}`,
    },
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateName  = getStateName(state);
  const sig        = computeSignals(state);
  if (sig.indexableCount === 0) notFound();
  const editorialArticles = getAllArticles().filter(a => a.state === state);

  const showWaterBodies = sig.waterBodyDistribution.length >= 8;
  const showTopRamps    = sig.topRamps.length >= 3;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://publicboatramps.com' },
          { '@type': 'ListItem', position: 2, name: stateName, item: `https://publicboatramps.com/${state}` },
        ],
      }) }} />

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
        padding: '4rem 1.5rem 3.5rem', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'rgba(201,168,76,0.05)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ color: 'var(--gold)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            &larr; All States
          </Link>
          <p className="section-label" style={{ color: 'rgba(201,168,76,0.8)' }}>Public Boat Ramps</p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: 'white', marginBottom: '0.6rem', lineHeight: 1.15,
          }}>
            Boat Ramps in <span style={{ color: 'var(--gold)' }}>{stateName}</span>
          </h1>
          <p style={{ color: 'rgba(205,216,232,0.85)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '560px' }}>
            {sig.indexableCount > 0
              ? `${sig.totalRamps.toLocaleString()} source-attributed public boat-ramp records${sig.countyCount >= 2 ? ` across ${sig.countyCount} counties` : ''}`
              : `Public boat launch facilities in ${stateName}`}
          </p>

          {/* Stat row */}
          {(sig.freeCount > 0 || sig.adaCount > 0 || sig.countyCount > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {sig.totalRamps > 0 && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                    {sig.totalRamps.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(205,216,232,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
                    Ramp Records
                  </div>
                </div>
              )}
              {sig.freeCount > 0 && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
                    {sig.freeCount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(205,216,232,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
                    No Fee Recorded
                  </div>
                </div>
              )}
              {sig.adaCount > 0 && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                    {sig.adaCount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(205,216,232,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
                    Accessibility Recorded
                  </div>
                </div>
              )}
              {sig.countyCount >= 2 && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                    {sig.countyCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(205,216,232,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
                    Counties
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <svg aria-hidden viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'block' }}
          preserveAspectRatio="none">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="var(--cream)" />
        </svg>
      </section>

      {/* ── Editorial callout ── */}
      {editorialArticles.length > 0 && (
        <section style={{ background: 'var(--gold-pale)', borderTop: '3px solid var(--gold)', borderBottom: '1px solid rgba(201,168,76,0.25)', padding: '2.5rem 1.5rem' }}>
          <div className="container">
            <p className="section-label">Featured Guides</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.5rem' }}>
              {editorialArticles.slice(0, 3).map(article => (
                <article key={article.slug} style={{
                  background: 'var(--white)', borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-card)', padding: '1.5rem 1.75rem',
                  flex: '1 1 280px', maxWidth: '420px',
                  borderLeft: '4px solid var(--gold)',
                }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    <Link href={`/editorial/${article.slug}`} style={{ color: 'var(--navy)', textDecoration: 'none' }}>
                      {article.title}
                    </Link>
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#556', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {article.description}
                  </p>
                  <Link href={`/editorial/${article.slug}`} style={{ color: 'var(--ocean)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
                    Read guide &rarr;
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Water body section ── */}
      {showWaterBodies && (
        <section style={{ padding: '3.5rem 1.5rem', background: 'var(--cream)' }}>
          <div className="container">
            <p className="section-label">Browse by Water Body</p>
            <h2 className="section-title">Water Bodies in {stateName}</h2>
            <div className="grid-3" style={{ marginTop: '1.5rem' }}>
              {sig.waterBodyDistribution.map(wb => {
                const label = waterTypeLabel(wb.waterType);
                return (
                  <Link
                    key={wb.slug}
                    href={`/${state}/water-body/${wb.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="card" style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)', lineHeight: 1.3, flex: 1, marginRight: '0.5rem' }}>
                          {wb.name}
                        </span>
                        <span className="chip chip-navy" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', flexShrink: 0 }}>
                          {wb.count}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {label && (
                          <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{label}</span>
                        )}
                        <span style={{ fontSize: '0.78rem', color: 'var(--ocean)', fontWeight: 600, fontFamily: 'var(--font-display)', alignSelf: 'center' }}>
                          View ramps &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Top ramps ── */}
      {showTopRamps && (
        <section style={{ padding: '3.5rem 1.5rem', background: sig.hasFwcData ? 'var(--white)' : 'var(--cream)' }}>
          <div className="container">
            <p className="section-label">Featured Records</p>
            <h2 className="section-title">Selected Ramp Records in {stateName}</h2>
            <div className="grid-3" style={{ marginTop: '1.5rem' }}>
              {sig.topRamps.map(r => {
                const ada = adaScore(r.accessibilityLevel as string | null) >= 2;
                const slug = String(r.slug);
                const name = String(r.name);
                const city = r.city ? String(r.city) : null;
                const county = normalizeCounty(r.county);
                const lanes = r.totalLanes ? Number(r.totalLanes) : null;
                const surface = r.rampSurface ? String(r.rampSurface) : null;
                const fee = r.isFeeRequired ? String(r.isFeeRequired) : null;
                const wb = r.waterBodyName ? String(r.waterBodyName) : null;
                return (
                  <Link key={slug} href={`/${state}/${slug}`} style={{ textDecoration: 'none' }}>
                    <article className="card">
                      <div style={{
                        height: '120px', background: 'linear-gradient(135deg, var(--navy) 0%, var(--ocean) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ color: 'var(--gold)', fontSize: '2rem' }}>⚓</span>
                      </div>
                      <div className="card-body">
                        <div className="card-meta">
                          <span>📍</span>
                          <span>{[city, county].filter(Boolean).join(', ')}</span>
                        </div>
                        <h3 className="card-title">{name}</h3>
                        {wb && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--gray)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{wb}</p>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'auto' }}>
                          {lanes && lanes > 0 && (
                            <span className="chip chip-navy" style={{ fontSize: '0.75rem' }}>{lanes} {lanes === 1 ? 'lane' : 'lanes'}</span>
                          )}
                          {surface && surface !== 'Unknown' && (
                            <span className="chip" style={{ fontSize: '0.75rem' }}>{surface}</span>
                          )}
                          {fee === 'No' && (
                            <span className="chip" style={{ fontSize: '0.75rem', background: 'rgba(42,138,120,0.12)', color: 'var(--seafoam)', borderColor: 'rgba(42,138,120,0.3)' }}>No launch fee recorded</span>
                          )}
                          {ada && (
                            <span className="chip" style={{ fontSize: '0.75rem', background: 'rgba(26,92,138,0.1)', color: 'var(--ocean)', borderColor: 'rgba(26,92,138,0.25)' }}>Accessibility feature recorded</span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Full listing ── */}
      <section style={{ padding: '3.5rem 1.5rem', background: sig.hasFwcData ? 'var(--cream)' : 'var(--white)' }}>
        <div className="container">
          <p className="section-label">Full Directory</p>
          <h2 className="section-title">
            {sig.indexableCount > 0
              ? `All ${sig.indexableCount.toLocaleString()} Ramp Records in ${stateName}`
              : `Ramps in ${stateName}`}
          </h2>
          <div style={{ marginTop: '1.5rem' }}>
            {sig.listingRamps.length > 0 ? (
              <StateRampListing ramps={sig.listingRamps} stateSlug={state} />
            ) : (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚓</p>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '0.75rem' }}>Coming Soon</h3>
                <p style={{ color: 'var(--gray)' }}>Ramp data for {stateName} is being compiled.</p>
                <Link href="/" className="btn btn-gold" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>Browse Other States</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Data attribution ── */}
      {sig.hasFwcData && (
        <div style={{ background: 'var(--navy)', padding: '1rem 1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(205,216,232,0.6)', fontSize: '0.78rem' }}>
            Ramp data sourced from the{' '}
            <a href="https://myfwc.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(205,216,232,0.8)', textDecoration: 'underline' }}>
              FWC Florida Boat Ramp Inventory
            </a>
            {' '}(public domain). Verify access and fees directly with the managing agency before launching.
          </p>
        </div>
      )}
    </>
  );
}
