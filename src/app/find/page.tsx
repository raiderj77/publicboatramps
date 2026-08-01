import type { Metadata } from 'next';
import Link from 'next/link';
import locations from '@/data/locations';
import { activeStates } from '@/lib/nav-data';
import { isIndexable } from '@/lib/quality-gate';
import UseMyLocation from './UseMyLocation';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type LocationRecord = Record<string, unknown> & {
  name: string;
  slug: string;
  state: string;
  stateSlug: string;
  city?: string | null;
  county?: string | null;
  lat: number;
  lng: number;
  amenities: string[];
  zipCode?: string | number | null;
  waterBodyName?: string | null;
  watershed?: string | null;
  adminEntity?: string | null;
  isFeeRequired?: string | null;
  accessibilityLevel?: string | null;
  isRestroomAccessible?: string | null;
  rampType?: string | null;
  rampSurface?: string | null;
};

type SearchResult = LocationRecord & {
  distance: number | null;
};

const ALLOWED_RADII = new Set([25, 50, 100, 250]);
const ALLOWED_FEE_FILTERS = new Set(['no-fee-recorded', 'fee-recorded']);
const ALLOWED_ACCESSIBILITY_FILTERS = new Set(['recorded']);

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function validNumber(value: string, minimum: number, maximum: number): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum ? number : null;
}

function distanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(b.lat - a.lat);
  const longitudeDelta = toRadians(b.lng - a.lng);
  const startLatitude = toRadians(a.lat);
  const endLatitude = toRadians(b.lat);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 3958.8 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatCounty(value: string | null | undefined): string {
  const county = value?.trim() ?? '';
  if (!county) return '';
  return /\s+county$/i.test(county) ? county : `${county} County`;
}

function hasAccessibilityRecord(ramp: LocationRecord): boolean {
  const level = String(ramp.accessibilityLevel ?? '');
  return (
    level.includes('Fully') ||
    level.includes('Partially') ||
    level.includes('High Level') ||
    level.includes('Moderate Level') ||
    ramp.isRestroomAccessible === 'Yes'
  );
}

function searchableText(ramp: LocationRecord): string {
  return [
    ramp.name,
    ramp.city,
    ramp.county,
    ramp.state,
    ramp.zipCode,
    ramp.waterBodyName,
    ramp.watershed,
    ramp.adminEntity,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const hasSearch = Boolean(
    first(params.q) ||
    first(params.state) ||
    first(params.fee) ||
    first(params.accessibility) ||
    first(params.lat) ||
    first(params.lng),
  );

  return {
    title: hasSearch ? 'Boat Ramp Search Results' : 'Find Boat Ramps Near You',
    description:
      'Search source-attributed public boat ramp records by ramp name, city, county, ZIP code, water body, state, fee field, or optional rounded location.',
    alternates: { canonical: 'https://publicboatramps.com/find' },
    robots: hasSearch ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function FindPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q).trim();
  const state = first(params.state).trim();
  const rawFee = first(params.fee).trim();
  const fee = ALLOWED_FEE_FILTERS.has(rawFee) ? rawFee : '';
  const rawAccessibility = first(params.accessibility).trim();
  const accessibility = ALLOWED_ACCESSIBILITY_FILTERS.has(rawAccessibility) ? rawAccessibility : '';
  const lat = validNumber(first(params.lat), -90, 90);
  const lng = validNumber(first(params.lng), -180, 180);
  const requestedRadius = validNumber(first(params.radius), 25, 250);
  const radius = requestedRadius !== null && ALLOWED_RADII.has(requestedRadius) ? requestedRadius : 50;
  const hasCoordinates = lat !== null && lng !== null;
  const hasCriteria = Boolean(q || state || fee || accessibility || hasCoordinates);
  const query = q.toLowerCase();

  let results: SearchResult[] = (locations as LocationRecord[])
    .filter(isIndexable)
    .filter((ramp) => !query || searchableText(ramp).includes(query))
    .filter((ramp) => !state || ramp.stateSlug === state)
    .filter((ramp) => fee !== 'no-fee-recorded' || ramp.isFeeRequired === 'No')
    .filter((ramp) => fee !== 'fee-recorded' || ramp.isFeeRequired === 'Yes')
    .filter((ramp) => accessibility !== 'recorded' || hasAccessibilityRecord(ramp))
    .map((ramp): SearchResult => ({
      ...ramp,
      distance:
        hasCoordinates && lat !== null && lng !== null
          ? distanceMiles({ lat, lng }, { lat: Number(ramp.lat), lng: Number(ramp.lng) })
          : null,
    }))
    .filter((ramp) => ramp.distance === null || ramp.distance <= radius)
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return a.name.localeCompare(b.name);
    });

  const totalMatches = hasCriteria ? results.length : 0;
  results = hasCriteria ? results.slice(0, 100) : [];

  return (
    <article style={{ maxWidth: '1120px', margin: '0 auto', padding: '4rem 1.5rem 5rem' }}>
      <header style={{ maxWidth: '760px', marginBottom: '2rem' }}>
        <p className="section-label">Ramp Finder</p>
        <h1 style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, marginBottom: '1rem' }}>
          Find a public boat ramp
        </h1>
        <p style={{ color: '#556', lineHeight: 1.75, margin: 0 }}>
          Search by ramp name, city, county, ZIP code, water body, or managing agency. Results use source records,
          not a live inspection. Confirm access, fees, and conditions with the operator before traveling.
        </p>
      </header>

      <section aria-labelledby="search-form-title">
        <h2 id="search-form-title" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          Search filters
        </h2>

        <form
          action="/find"
          method="get"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '0.9rem',
            padding: '1.25rem',
            border: '1px solid rgba(10,22,40,0.12)',
            borderRadius: 'var(--radius)',
            background: 'white',
            boxShadow: '0 8px 30px rgba(10,22,40,0.06)',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontWeight: 700, color: 'var(--navy)' }}>
            Location or ramp
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="City, county, ZIP, lake, or ramp"
              autoComplete="off"
              style={{ minHeight: '48px', border: '1px solid rgba(10,22,40,0.25)', borderRadius: '6px', padding: '0.65rem 0.75rem', font: 'inherit' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontWeight: 700, color: 'var(--navy)' }}>
            State
            <select
              name="state"
              defaultValue={state}
              style={{ minHeight: '48px', border: '1px solid rgba(10,22,40,0.25)', borderRadius: '6px', padding: '0.65rem 0.75rem', background: 'white', font: 'inherit' }}
            >
              <option value="">All available states</option>
              {activeStates.map((item) => (
                <option key={item.stateSlug} value={item.stateSlug}>{item.state}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontWeight: 700, color: 'var(--navy)' }}>
            Fee field
            <select
              name="fee"
              defaultValue={fee}
              style={{ minHeight: '48px', border: '1px solid rgba(10,22,40,0.25)', borderRadius: '6px', padding: '0.65rem 0.75rem', background: 'white', font: 'inherit' }}
            >
              <option value="">Any fee field</option>
              <option value="no-fee-recorded">No launch fee recorded</option>
              <option value="fee-recorded">Fee recorded</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontWeight: 700, color: 'var(--navy)' }}>
            Accessibility
            <select
              name="accessibility"
              defaultValue={accessibility}
              style={{ minHeight: '48px', border: '1px solid rgba(10,22,40,0.25)', borderRadius: '6px', padding: '0.65rem 0.75rem', background: 'white', font: 'inherit' }}
            >
              <option value="">Any record</option>
              <option value="recorded">Accessibility feature recorded</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-gold" style={{ minHeight: '48px', border: 0, cursor: 'pointer' }}>
              Search Ramps
            </button>
            <Link href="/find" style={{ minHeight: '48px', display: 'inline-flex', alignItems: 'center', color: 'var(--navy)', fontWeight: 700 }}>
              Clear
            </Link>
          </div>
        </form>

        <UseMyLocation defaultRadius={radius} />
      </section>

      {!hasCriteria && (
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.75rem' }}>
            Start with a place or your location
          </h2>
          <p style={{ color: '#556', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            The current directory has its strongest coverage in Florida, plus limited border-area records in
            Alabama and Georgia.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {activeStates.map((item) => (
              <Link key={item.stateSlug} href={`/find?state=${item.stateSlug}`} className="state-link">
                {item.state}
              </Link>
            ))}
          </div>
        </section>
      )}

      {hasCriteria && (
        <section aria-live="polite" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div>
              <p className="section-label">Search Results</p>
              <h2 style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.7rem', margin: 0 }}>
                {totalMatches.toLocaleString()} matching record{totalMatches === 1 ? '' : 's'}
              </h2>
            </div>
            {hasCoordinates && (
              <p style={{ color: '#596474', margin: 0 }}>
                Within {radius} miles of the rounded search location
              </p>
            )}
          </div>

          {totalMatches > 100 && (
            <p style={{ color: '#596474', marginBottom: '1rem' }}>
              Showing the first 100 results. Add a city, county, ZIP code, water body, or filter to narrow the list.
            </p>
          )}

          {results.length === 0 ? (
            <div style={{ padding: '1.5rem', border: '1px solid rgba(10,22,40,0.12)', borderRadius: 'var(--radius)', background: 'var(--cream)' }}>
              <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>No matching source records</h3>
              <p style={{ color: '#556', marginBottom: 0 }}>
                Try a broader place name, remove a filter, or increase the location radius.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {results.map((ramp) => (
                <article key={`${ramp.stateSlug}:${ramp.slug}`} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: '1 1 520px' }}>
                      <p style={{ color: '#596474', fontSize: '0.85rem', margin: '0 0 0.35rem' }}>
                        {ramp.city ? `${ramp.city}, ` : ''}{ramp.state}
                        {ramp.county ? ` · ${formatCounty(ramp.county)}` : ''}
                        {ramp.distance !== null ? ` · ${ramp.distance.toFixed(1)} miles` : ''}
                      </p>
                      <h3 style={{ margin: '0 0 0.6rem', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                        <Link href={`/${ramp.stateSlug}/${ramp.slug}`} style={{ color: 'var(--navy)', textDecoration: 'none' }}>
                          {ramp.name}
                        </Link>
                      </h3>
                      <p style={{ margin: '0 0 0.75rem', color: '#556', lineHeight: 1.65 }}>
                        {ramp.waterBodyName ? `Access to ${ramp.waterBodyName}. ` : ''}
                        Review the source record and confirm current conditions before launching.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {ramp.rampType && <span className="chip">{String(ramp.rampType)}</span>}
                        {ramp.rampSurface && <span className="chip">{String(ramp.rampSurface)}</span>}
                        {ramp.isFeeRequired === 'No' && <span className="chip">No launch fee recorded</span>}
                        {ramp.isFeeRequired === 'Yes' && <span className="chip">Fee recorded</span>}
                        {hasAccessibilityRecord(ramp) && <span className="chip">Accessibility feature recorded</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <Link href={`/${ramp.stateSlug}/${ramp.slug}`} className="btn btn-gold" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                        View Record
                      </Link>
                      <a
                        href={`https://maps.google.com/?q=${ramp.lat},${ramp.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: 'var(--navy)', borderColor: 'rgba(10,22,40,0.35)' }}
                      >
                        Directions
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </article>
  );
}
