import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import locations from '@/data/locations';
import { isIndexable } from '@/lib/quality-gate';
import { getAllArticles } from '@/lib/editorial';
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

function isAdaRecord(loc: Record<string, unknown>): boolean {
  const al = String(loc.accessibilityLevel ?? '');
  return al.includes('High Level') || al.includes('Moderate Level') ||
    al.includes('Fully') || al.includes('Partially') ||
    loc.isRestroomAccessible === 'Yes';
}

function modalValue<T>(items: T[]): T | null {
  if (!items.length) return null;
  const counts = new Map<T, number>();
  for (const v of items) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function waterTypeLabel(wt: string | null): string | null {
  if (!wt) return null;
  if (wt.includes('Salt') || wt.includes('Brackish')) return 'Saltwater';
  if (wt.includes('Fresh')) return 'Freshwater';
  return null;
}

interface CrossLink {
  slug: string;
  name: string;
  count: number;
  waterType: string | null;
}

interface WaterBodyData {
  waterBodyName: string;
  total: number;
  freeCount: number;
  adaCount: number;
  waterType: string | null;
  hasFwcData: boolean;
  listingRamps: RampRow[];
  crossLinks: CrossLink[];
  lastmod: string;
}

function computeWaterBodyData(stateSlug: string, wbSlug: string): WaterBodyData | null {
  const indexable = (locations as Record<string, unknown>[]).filter(l => isIndexable(l));
  const stateRamps = indexable.filter(l => l.stateSlug === stateSlug);
  const wbRamps = stateRamps.filter(l => l.waterBodySlug === wbSlug);

  if (wbRamps.length < 3) return null;

  // Canonical name: modal waterBodyName across records
  const names = wbRamps.map(r => r.waterBodyName as string).filter(Boolean);
  const waterBodyName = modalValue(names) ?? wbSlug;

  const freeCount = wbRamps.filter(r => r.isFeeRequired === 'No').length;
  const adaCount  = wbRamps.filter(r => isAdaRecord(r)).length;
  const hasFwcData = wbRamps.some(r => r.dataSource === 'FWC_FL');

  const waterTypes = wbRamps.map(r => r.waterType as string | null).filter(Boolean) as string[];
  const waterType = waterTypeLabel(modalValue(waterTypes));

  const listingRamps: RampRow[] = wbRamps.map(r => ({
    slug:                String(r.slug),
    name:                String(r.name),
    city:                r.city ? String(r.city) : null,
    county:              r.county ? String(r.county).replace(/\s+County$/i, '').trim() : null,
    totalLanes:          r.totalLanes != null ? Number(r.totalLanes) : null,
    rampSurface:         r.rampSurface ? String(r.rampSurface) : null,
    accessibilityLevel:  r.accessibilityLevel ? String(r.accessibilityLevel) : null,
    isFeeRequired:       r.isFeeRequired ? String(r.isFeeRequired) : null,
    isRestroomAccessible: r.isRestroomAccessible ? String(r.isRestroomAccessible) : null,
    stateSlug,
  }));

  // Cross-links: other water bodies in same state with >= 3 ramps, top 6 by count
  const crossMap = new Map<string, { name: string; count: number; waterType: string | null }>();
  for (const r of stateRamps) {
    const wb = r.waterBodySlug as string | null;
    if (!wb || wb === wbSlug) continue;
    const entry = crossMap.get(wb);
    if (entry) {
      entry.count++;
    } else {
      crossMap.set(wb, {
        name: (r.waterBodyName as string) || wb,
        count: 1,
        waterType: waterTypeLabel(r.waterType as string | null),
      });
    }
  }
  const crossLinks: CrossLink[] = [...crossMap.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([slug, v]) => ({ slug, ...v }));

  const dates = wbRamps.map(r => r.lastEditedDate as string | null).filter(Boolean) as string[];
  const lastmod = dates.length ? [...dates].sort().reverse()[0] : '2026-05-17';

  return { waterBodyName, total: wbRamps.length, freeCount, adaCount, waterType, hasFwcData, listingRamps, crossLinks, lastmod };
}

// Build the set of valid (state::slug) combos once for notFound checks
function buildValidCombos(): Set<string> {
  const indexable = (locations as Record<string, unknown>[]).filter(l => isIndexable(l));
  const counts = new Map<string, number>();
  for (const r of indexable) {
    const wb = r.waterBodySlug as string | null;
    const state = r.stateSlug as string | null;
    if (!wb || !state) continue;
    const key = `${state}::${wb}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const valid = new Set<string>();
  for (const [key, count] of counts) {
    if (count >= 3) valid.add(key);
  }
  return valid;
}

const VALID_COMBOS = buildValidCombos();

export async function generateStaticParams() {
  return [...VALID_COMBOS].map(key => {
    const [state, slug] = key.split('::');
    return { state, slug };
  });
}

export async function generateMetadata(
  { params }: { params: Promise<{ state: string; slug: string }> }
): Promise<Metadata> {
  const { state, slug } = await params;
  if (!VALID_COMBOS.has(`${state}::${slug}`)) {
    return { robots: { index: false, follow: false } };
  }
  const data = computeWaterBodyData(state, slug);
  if (!data) return { robots: { index: false, follow: false } };

  const stateName = getStateName(state);
  const { waterBodyName, total, freeCount, adaCount } = data;
  const title = `${waterBodyName} Boat Ramps in ${stateName}`;
  const description = `${total} public boat ramps and launches on ${waterBodyName} in ${stateName}. ${freeCount} free, ${adaCount} ADA-accessible.`;

  return {
    title,
    description,
    alternates: { canonical: `https://publicboatramps.com/${state}/water-body/${slug}` },
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: `https://publicboatramps.com/${state}/water-body/${slug}`,
      siteName: 'Public Boat Ramps Directory',
      type: 'website',
    },
  };
}

export default async function WaterBodyPage(
  { params }: { params: Promise<{ state: string; slug: string }> }
) {
  const { state, slug } = await params;

  if (!VALID_COMBOS.has(`${state}::${slug}`)) notFound();

  const data = computeWaterBodyData(state, slug);
  if (!data) notFound();

  const { waterBodyName, total, freeCount, adaCount, waterType, hasFwcData, listingRamps, crossLinks, lastmod } = data;
  const stateName = getStateName(state);
  const BASE = 'https://publicboatramps.com';

  // Editorial callout: articles tagged for this water body
  const allArticles = getAllArticles();
  const relatedArticles = allArticles.filter(a =>
    a.waterBody === slug ||
    a.tags.some(t => t.toLowerCase() === waterBodyName.toLowerCase())
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BodyOfWater',
        '@id': `${BASE}/${state}/water-body/${slug}`,
        name: waterBodyName,
        description: `${total} public boat ramps and launches on ${waterBodyName} in ${stateName}.`,
        url: `${BASE}/${state}/water-body/${slug}`,
        containedInPlace: {
          '@type': 'State',
          name: stateName,
          url: `${BASE}/${state}`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: `${stateName} Boat Ramps`, item: `${BASE}/${state}` },
          { '@type': 'ListItem', position: 3, name: waterBodyName, item: `${BASE}/${state}/water-body/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
        padding: '4rem 1.5rem 3.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'rgba(201,168,76,0.05)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'var(--gold)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(205,216,232,0.4)', fontSize: '0.875rem' }}>›</span>
            <Link href={`/${state}`} style={{ color: 'var(--gold)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>{stateName} Boat Ramps</Link>
            <span style={{ color: 'rgba(205,216,232,0.4)', fontSize: '0.875rem' }}>›</span>
            <span style={{ color: 'rgba(205,216,232,0.7)', fontSize: '0.875rem' }}>{waterBodyName}</span>
          </nav>

          <p className="section-label" style={{ color: 'rgba(201,168,76,0.8)' }}>Public Boat Ramps</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: 'white',
            marginBottom: '0.6rem',
            lineHeight: 1.15,
          }}>
            Boat Ramps on <span style={{ color: 'var(--gold)' }}>{waterBodyName}</span>
          </h1>
          <p style={{ color: 'rgba(205,216,232,0.85)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '560px' }}>
            Public launch facilities on {waterBodyName} in {stateName}
          </p>

          {/* Stat row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(205,216,232,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>Total Ramps</div>
            </div>
            {freeCount > 0 && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{freeCount}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(205,216,232,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>No Launch Fee</div>
              </div>
            )}
            {adaCount > 0 && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{adaCount}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(205,216,232,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>ADA Accessible</div>
              </div>
            )}
            {waterType && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'rgba(205,216,232,0.9)', lineHeight: 1, paddingTop: '0.35rem' }}>{waterType}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(205,216,232,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>Water Type</div>
              </div>
            )}
          </div>
        </div>
        <svg aria-hidden="true" viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'block' }}
          preserveAspectRatio="none">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="var(--cream)" />
        </svg>
      </section>

      {/* Editorial callout — renders only when a matching article exists */}
      {relatedArticles.length > 0 && (
        <section style={{ background: 'var(--gold-pale)', borderTop: '3px solid var(--gold)', borderBottom: '1px solid rgba(201,168,76,0.25)', padding: '2.5rem 1.5rem' }}>
          <div className="container">
            <p className="section-label">Featured Guides</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.5rem' }}>
              {relatedArticles.map(a => (
                <article key={a.slug} style={{
                  background: 'var(--white)', borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-card)', padding: '1.5rem 1.75rem',
                  flex: '1 1 280px', maxWidth: '420px', borderLeft: '4px solid var(--gold)',
                }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    <Link href={`/editorial/${a.slug}`} style={{ color: 'var(--navy)', textDecoration: 'none' }}>{a.title}</Link>
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#556', lineHeight: 1.6, marginBottom: '1rem' }}>{a.description}</p>
                  <Link href={`/editorial/${a.slug}`} style={{ color: 'var(--ocean)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
                    Read guide →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full ramp listing */}
      <section style={{ padding: '3.5rem 1.5rem', background: 'var(--cream)' }}>
        <div className="container">
          <p className="section-label">All Ramps</p>
          <h2 className="section-title">Launch Sites on {waterBodyName}</h2>
          <div style={{ marginTop: '1.5rem' }}>
            <StateRampListing ramps={listingRamps} stateSlug={state} />
          </div>
        </div>
      </section>

      {/* Cross-link block */}
      {crossLinks.length > 0 && (
        <section style={{ padding: '3.5rem 1.5rem', background: 'var(--white)' }}>
          <div className="container">
            <p className="section-label">Explore More</p>
            <h2 className="section-title">Other Water Bodies in {stateName}</h2>
            <div className="grid-3" style={{ marginTop: '1.5rem' }}>
              {crossLinks.map(wb => (
                <Link key={wb.slug} href={`/${state}/water-body/${wb.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)', lineHeight: 1.3, flex: 1, marginRight: '0.5rem' }}>
                        {wb.name}
                      </span>
                      <span className="chip chip-navy" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', flexShrink: 0 }}>{wb.count}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {wb.waterType && (
                        <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{wb.waterType}</span>
                      )}
                      <span style={{ fontSize: '0.78rem', color: 'var(--ocean)', fontWeight: 600, fontFamily: 'var(--font-display)', alignSelf: 'center' }}>View ramps →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FWC data attribution */}
      {hasFwcData && (
        <section style={{ padding: '1.5rem', background: 'rgba(26,92,138,0.06)', borderTop: '1px solid rgba(26,92,138,0.15)' }}>
          <div className="container">
            <p style={{ fontSize: '0.8rem', color: 'var(--gray)', textAlign: 'center', lineHeight: 1.6 }}>
              Ramp data sourced from the{' '}
              <a href="https://myfwc.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ocean)', textDecoration: 'underline' }}>
                Florida Fish and Wildlife Conservation Commission
              </a>
              {' '}(public domain) and OpenStreetMap contributors (ODbL).
              Last updated {lastmod}. Verify access, fees, and seasonal closures directly with the managing agency before launching.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
