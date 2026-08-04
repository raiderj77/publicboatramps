import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import NearbyServices from '@/components/NearbyServices';
import locations from '@/data/locations';
import { FWC_ACCESS_URL, getDataSourceAttribution } from '@/lib/data-sources';
import { serializeJsonLd } from '@/lib/json-ld';
import { isIndexable } from '@/lib/quality-gate';
import { getRetiredRamp, retiredRamps } from '@/lib/retired-ramps';

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
  return stateList.find((s) => s.slug === slug)?.name ?? slug;
}

export async function generateStaticParams() {
  const activeParams = (locations as any[])
    .filter(isIndexable)
    .map((l) => ({ state: l.stateSlug, slug: l.slug }));
  const retiredParams = retiredRamps.map((ramp) => ({ state: ramp.stateSlug, slug: ramp.slug }));
  return [...activeParams, ...retiredParams];
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; slug: string }> }): Promise<Metadata> {
  const { state, slug } = await params;
  const location = locations.find((l) => l.slug === slug && l.stateSlug === state);
  if (!location || !isIndexable(location as Record<string, any>)) {
    const retiredRamp = getRetiredRamp(state, slug);
    if (!retiredRamp) return { robots: { index: false, follow: false } };
    return {
      title: `${retiredRamp.name} | Retired Source Record`,
      description: 'This source-backed ramp URL is retained to explain a directory data change. Check the official FWC finder for current information.',
      alternates: { canonical: `https://publicboatramps.com/${state}/${slug}` },
      robots: { index: false, follow: true },
    };
  }
  const stateName = getStateName(state);
  const preview = getRampPreview(location);
  return {
    title: `${location.name} | Public Boat Ramp in ${stateName}`,
    description: preview,
    alternates: { canonical: `https://publicboatramps.com/${state}/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { title: `${location.name} | Public Boat Ramps`, description: preview, url: `https://publicboatramps.com/${state}/${slug}` },
  };
}

const AMENITY_ICONS: Record<string, string> = {
  'Boat launch': '🚤', 'Trailer parking': '🅿️', 'Restrooms': '🚻', 'Parking': '🅿️',
  'Picnic area': '🌳', 'Fishing pier': '🎣', 'Fish cleaning station': '🐟',
  'Handicap accessible': '♿', 'Lighting': '💡', 'Security': '🔒',
};

function getRampPreview(ramp: { name: string; state: string; city: string; amenities: string[]; description?: string }): string {
  if (ramp.description && ramp.description.length > 20) {
    const firstSentence = ramp.description.split(/(?<=[.!?])\s/)[0];
    return firstSentence.length <= 160 ? firstSentence : firstSentence.slice(0, 157) + '...';
  }
  const amenityCount = ramp.amenities.length;
  const loc = ramp.city ? `${ramp.city}, ${ramp.state}` : ramp.state;
  if (amenityCount >= 2) {
    return `Public boat launch in ${loc} with ${amenityCount} amenities including ${ramp.amenities.slice(0, 2).join(' and ').toLowerCase()}.`;
  }
  return `Public boat launch in ${loc}. Check current access and facility details before your trip.`;
}

// Returns false for null / undefined / empty / common sentinel strings
function val(v: unknown): boolean {
  return v !== null && v !== undefined && v !== '' && v !== 'Unknown' && v !== 'N/A' && v !== 'None';
}

const ACCESS_TYPE_LABELS: Record<string, string> = {
  'Public': 'Public Access',
  'Government Owned for General Public Use': 'Government — Open to Public',
  'Commercially Owned for General Public Use': 'Commercial — Open to Public',
};

function formatAccessType(raw: string): string {
  return ACCESS_TYPE_LABELS[raw] ?? raw;
}

// Strips bare HUC numeric codes; extracts name from "DIGITS-Name" hybrids.
function formatWatershed(raw: unknown): string | null {
  if (!val(raw)) return null;
  const s = String(raw).trim();
  if (/^\d{6,12}$/.test(s)) return null;
  const m = s.match(/^\d{6,12}-(.+)$/);
  if (m) return m[1].trim();
  return s;
}

const PARKING_CONDITION_MAP: Record<string, string> = {
  'good': 'Good',
  'excellent': 'Excellent',
  'ok': 'Fair',
  'poor': 'Poor',
  'rough': 'Rough',
  'good to excellent': 'Good to Excellent',
  'good to excellent condition': 'Good to Excellent',
  'good  ': 'Good',
  'good limited': 'Good – Limited',
  'good-limited': 'Good – Limited',
  'good limted': 'Good – Limited',
  'good to fair': 'Good to Fair',
  'rough limited': 'Rough – Limited',
  'rough - 4x4 recommended': 'Rough (4×4 Recommended)',
  'average': 'Average',
  'average to good': 'Average to Good',
  'average to poor': 'Average to Poor',
  'limited': 'Limited',
  'no parking': 'No On-Site Parking',
  'no parking on-site': 'No On-Site Parking',
  'no parking at boat ramp': 'No On-Site Parking',
  'na': '',
  'not available': '',
};

function normalizeParking(raw: unknown): string | null {
  if (!val(raw)) return null;
  const trimmed = String(raw).trim();
  const lower = trimmed.toLowerCase();
  if (lower in PARKING_CONDITION_MAP) {
    const mapped = PARKING_CONDITION_MAP[lower];
    return mapped || null;
  }
  return trimmed;
}

function isValidHttpsUrl(url: unknown): url is string {
  if (!url || typeof url !== 'string') return false;
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function formatDate(dateStr: unknown): string | null {
  if (!val(dateStr)) return null;
  try {
    const rawDate = String(dateStr);
    const isCalendarDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
    const d = new Date(isCalendarDate ? `${rawDate}T00:00:00Z` : rawDate);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(isCalendarDate ? { timeZone: 'UTC' } : {}),
    });
  } catch {
    return null;
  }
}

function formatFeeCurrency(value: unknown): string | null {
  if (!val(value)) return null;
  const amount = Number(String(value).replace(/[$,]/g, ''));
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : null;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loc = Record<string, any>;

// ── Shared inline style objects ───────────────────────────────────────────────

const dividerSection: CSSProperties = {
  borderTop: '1px solid rgba(10,22,40,0.08)',
  paddingTop: '2.5rem',
  marginBottom: '3rem',
};

const sectionH2: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.4rem',
  color: 'var(--navy)',
  marginBottom: '1.25rem',
};

const colHead: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--gray)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 700,
  marginBottom: '0.75rem',
};

const dlRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '0.55rem 0',
  borderBottom: '1px solid rgba(10,22,40,0.06)',
};

const dtStyle: CSSProperties = {
  color: '#667',
  fontSize: '0.875rem',
  paddingRight: '1rem',
  flexShrink: 0,
};

const ddStyle: CSSProperties = {
  color: 'var(--navy)',
  fontWeight: 600,
  fontSize: '0.875rem',
  margin: 0,
  textAlign: 'right',
};

// ─────────────────────────────────────────────────────────────────────────────

export default async function LocationPage({ params }: { params: Promise<{ state: string; slug: string }> }) {
  const { state, slug } = await params;
  const location = locations.find((l) => l.slug === slug && l.stateSlug === state);
  const stateName = getStateName(state);

  if (!location || !isIndexable(location)) {
    const retiredRamp = getRetiredRamp(state, slug);
    if (!retiredRamp) notFound();
    const explanation = retiredRamp.reason === 'removed-from-source'
      ? 'The August 3, 2026 directory refresh no longer found this record in the official FWC inventory.'
      : 'The official FWC record remains available, but its current fields no longer meet this directory’s publication threshold.';

    return (
      <section style={{ padding: '4rem 1.5rem 6rem' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <p className="section-label">Source Record Update</p>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, marginBottom: '1rem' }}>
            {retiredRamp.name}
          </h1>
          <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--gold)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '1.35rem', marginBottom: '0.75rem' }}>
              This directory record has been retired
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{explanation}</p>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>
              This is a source-data and publishing-status notice, not a closure notice. Do not infer that the facility is closed or unavailable. Verify current access, routing, fees, and conditions with FWC or the managing agency.
            </p>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Directory retirement date: {formatDate(retiredRamp.retiredOn)}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <a href={FWC_ACCESS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                Check the Official FWC Finder
              </a>
              <Link href={`/${state}`} className="btn btn-outline" style={{ color: 'var(--navy)', borderColor: 'rgba(10,22,40,0.35)' }}>
                Browse Current {stateName} Records
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const loc = location as Loc;
  const related = locations
    .filter((candidate) => candidate.stateSlug === state && candidate.slug !== slug && isIndexable(candidate))
    .sort((a, b) => {
      const relevance = (candidate: Loc) =>
        (val(loc.waterBodyName) && candidate.waterBodyName === loc.waterBodyName ? 4 : 0) +
        (val(location.city) && candidate.city === location.city ? 2 : 0) +
        (val(loc.county) && candidate.county === loc.county ? 1 : 0);
      return relevance(b as Loc) - relevance(a as Loc) || distanceMiles(location, a) - distanceMiles(location, b);
    })
    .slice(0, 3);

  // ── Section 2: Quick Facts ────────────────────────────────────────────────
  const isAda = val(loc.accessibilityLevel) &&
    (String(loc.accessibilityLevel).includes('Fully') ||
     String(loc.accessibilityLevel).includes('Partially') ||
     String(loc.accessibilityLevel).includes('High Level') ||
     String(loc.accessibilityLevel).includes('Moderate Level') ||
     loc.isRestroomAccessible === 'Yes');

  const feeChip = loc.isFeeRequired === 'No'
    ? 'No launch fee recorded'
    : loc.isFeeRequired === 'Yes'
      ? (formatFeeCurrency(loc.feeAmount) && Number(loc.feeAmount) !== 0 ? `${formatFeeCurrency(loc.feeAmount)} launch fee recorded` : 'Launch fee recorded')
      : null;

  const quickFacts: { label: string; icon: string }[] = [];
  if (val(loc.rampType)) quickFacts.push({ label: String(loc.rampType), icon: '🚤' });
  if (val(loc.totalLanes) && Number(loc.totalLanes) > 0)
    quickFacts.push({ label: `${loc.totalLanes} lane${Number(loc.totalLanes) !== 1 ? 's' : ''}`, icon: '🛣️' });
  if (val(loc.rampSurface)) quickFacts.push({ label: String(loc.rampSurface), icon: '🪨' });
  if (feeChip) quickFacts.push({ label: feeChip, icon: feeChip === 'No launch fee recorded' ? '🧾' : '💰' });
  if (val(loc.waterType)) quickFacts.push({ label: String(loc.waterType), icon: '💧' });
  if (isAda) quickFacts.push({ label: 'Accessibility feature recorded', icon: '♿' });

  // ── Section 4: Ramp Details ───────────────────────────────────────────────
  const leftRows: [string, string][] = [];
  if (val(loc.accessType)) leftRows.push(['Access', formatAccessType(String(loc.accessType))]);
  if (val(loc.rampType)) leftRows.push(['Ramp Type', String(loc.rampType)]);
  if (val(loc.rampSurface)) leftRows.push(['Surface', String(loc.rampSurface)]);
  if (val(loc.rampCondition)) leftRows.push(['Condition', String(loc.rampCondition)]);
  if (val(loc.singleLanes)) leftRows.push(['Single Lanes', String(loc.singleLanes)]);
  if (val(loc.doubleLanes)) leftRows.push(['Double Lanes', String(loc.doubleLanes)]);
  if (val(loc.totalLanes)) leftRows.push(['Total Lanes', String(loc.totalLanes)]);
  if (val(loc.dockType)) leftRows.push(['Dock', String(loc.dockType)]);
  if (val(loc.hours)) leftRows.push(['Source-record Hours', String(loc.hours)]);

  const rightRows: [string, string][] = [];
  if (val(loc.trailerSpaces) && Number(loc.trailerSpaces) > 0)
    rightRows.push(['Trailer Spaces', String(loc.trailerSpaces)]);
  if (val(loc.accessibleTrailerSpaces) && Number(loc.accessibleTrailerSpaces) > 0)
    rightRows.push(['Accessible Trailer Spaces', String(loc.accessibleTrailerSpaces)]);
  if (val(loc.vehicleSpaces) && Number(loc.vehicleSpaces) > 0)
    rightRows.push(['Vehicle Spaces', String(loc.vehicleSpaces)]);
  if (val(loc.parkingSurface)) rightRows.push(['Parking Surface', String(loc.parkingSurface)]);
  const parkingCond = normalizeParking(loc.parkingCondition);
  if (parkingCond) rightRows.push(['Parking Condition', parkingCond]);
  if (val(loc.restroomType) && loc.restroomType !== 'No Toilet') {
    const accessible = loc.isRestroomAccessible === 'Yes' ? ' (source marks accessible)' : '';
    rightRows.push(['Source restroom field', `${String(loc.restroomType)}${accessible}`]);
  }
  if (val(loc.accessibilityLevel)) rightRows.push(['Source accessibility field', String(loc.accessibilityLevel)]);

  const showDetails = leftRows.length > 0 || rightRows.length > 0;
  const showBothColumns = leftRows.length > 0 && rightRows.length > 0;

  // ── Section 5: Fee ────────────────────────────────────────────────────────
  const showFee = loc.isFeeRequired === 'Yes';
  const feeRows: [string, string][] = [['Source marks fee required', 'Yes']];
  const formattedFeeAmount = formatFeeCurrency(loc.feeAmount);
  if (formattedFeeAmount && Number(loc.feeAmount) !== 0) feeRows.push(['Recorded amount', formattedFeeAmount]);
  if (val(loc.feeCollectionType)) feeRows.push(['Recorded collection method', String(loc.feeCollectionType)]);

  // ── Section 7: Administrative ─────────────────────────────────────────────
  const source = getDataSourceAttribution(loc.dataSource);
  const formattedDate = formatDate(loc.lastEditedDate);
  const formattedSnapshotDate = formatDate(loc.sourceSnapshotDate);

  const formattedWatershed = formatWatershed(loc.watershed);

  const adminRows: { label: string; value: string; href?: string; rel?: string }[] = [];
  if (val(loc.adminEntity)) adminRows.push({ label: 'Managed by', value: String(loc.adminEntity) });
  if (val(loc.contactPhone)) adminRows.push({ label: 'Contact', value: String(loc.contactPhone), href: `tel:${String(loc.contactPhone)}` });
  if (formattedDate) adminRows.push({ label: 'Source record date', value: formattedDate });
  if (formattedSnapshotDate) adminRows.push({ label: 'Directory source refresh', value: formattedSnapshotDate });
  if (isValidHttpsUrl(loc.externalUrl)) adminRows.push({ label: 'Official information', value: 'Official website →', href: loc.externalUrl, rel: 'nofollow' });
  adminRows.push({ label: 'Data source', value: source.label, href: source.url });
  if (isValidHttpsUrl(loc.sourceOriginalMetadataUrl)) {
    adminRows.push({ label: 'Original source metadata', value: 'View FWC metadata →', href: loc.sourceOriginalMetadataUrl });
  }

  // ── JSON-LD ───────────────────────────────────────────────────────────────
  const addressObj: Record<string, string> = { '@type': 'PostalAddress', addressRegion: location.state, addressCountry: 'US' };
  if (val(loc.street)) addressObj.streetAddress = String(loc.street);
  if (val(location.city)) addressObj.addressLocality = location.city;
  if (val(loc.zipCode)) addressObj.postalCode = String(loc.zipCode);

  const placeSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    additionalType: 'https://www.wikidata.org/wiki/Q1361425',
    name: location.name,
    description: getRampPreview(location),
    address: addressObj,
  };
  if (source.allowsCoordinateDirections) {
    placeSchema.geo = { '@type': 'GeoCoordinates', latitude: location.lat, longitude: location.lng };
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://publicboatramps.com' },
          { '@type': 'ListItem', position: 2, name: stateName, item: `https://publicboatramps.com/${state}` },
          { '@type': 'ListItem', position: 3, name: location.name, item: `https://publicboatramps.com/${state}/${slug}` },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(placeSchema) }} />

      {/* ── SECTION 1: Hero ─────────────────────────────────────────────────── */}
      <div
        style={{ width: '100%', height: '400px', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 50%, #2d7aa8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}
        aria-label={`Location preview for ${location.name}`}
      >
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          <path d="M0,55 Q25,45 50,55 T100,55 L100,100 L0,100 Z" fill="white" />
          <path d="M0,65 Q25,55 50,65 T100,65 L100,100 L0,100 Z" fill="white" opacity="0.5" />
          <path d="M0,75 Q25,65 50,75 T100,75 L100,100 L0,100 Z" fill="white" opacity="0.3" />
        </svg>
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1, padding: '2rem' }}>
          <div style={{ color: 'var(--gold)', fontSize: '4rem', marginBottom: '0.5rem' }}>⚓</div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{location.name}</h1>
          <p style={{ color: 'var(--cream)', fontSize: '1.1rem' }}>{location.city ? `${location.city}, ` : ''}{location.state}</p>
        </div>
      </div>

      {/* ── SECTION 2: Quick Facts strip ────────────────────────────────────── */}
      {quickFacts.length > 0 && (
        <section style={{ background: 'var(--navy)', borderBottom: '2px solid var(--gold)' }}>
          <div className="container" style={{ padding: '0.875rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            {quickFacts.map(({ label, icon }) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '2rem', padding: '0.35rem 0.85rem', fontSize: '0.825rem', color: 'var(--cream)', whiteSpace: 'nowrap' }}>
                <span aria-hidden>{icon}</span>{label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Sections 3–7: Main content ──────────────────────────────────────── */}
      <section style={{ padding: '3rem 1.5rem 4rem' }}>
        <div className="container" style={{ maxWidth: '860px' }}>

          {/* SECTION 3: About */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={sectionH2}>About This Ramp</h2>
            <p style={{ lineHeight: 1.9, color: 'var(--text)', fontSize: '1.05rem' }}>
              {val(location.description)
                ? String(location.description)
                : `${location.name} is a public boat-launch record located in ${location.city ? `${location.city}, ` : ''}${location.state}. Review the source fields below and verify current access with the managing agency.`
              }
            </p>
          </div>

          {/* SECTION 4: Ramp Details */}
          {showDetails && (
            <div style={dividerSection}>
              <h2 style={sectionH2}>Ramp Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: showBothColumns ? 'repeat(2, 1fr)' : '1fr', gap: '2.5rem' }}>
                {leftRows.length > 0 && (
                  <div>
                    <p style={colHead}>Ramp &amp; Launch</p>
                    <dl style={{ margin: 0 }}>
                      {leftRows.map(([label, value]) => (
                        <div key={label} style={dlRow}>
                          <dt style={dtStyle}>{label}</dt>
                          <dd style={ddStyle}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                {rightRows.length > 0 && (
                  <div>
                    <p style={colHead}>Parking &amp; Facilities</p>
                    <dl style={{ margin: 0 }}>
                      {rightRows.map(([label, value]) => (
                        <div key={label} style={dlRow}>
                          <dt style={dtStyle}>{label}</dt>
                          <dd style={ddStyle}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: Fee Information */}
          {showFee && (
            <div style={dividerSection}>
              <h2 style={sectionH2}>Recorded Fee Information</h2>
              <dl style={{ margin: 0, maxWidth: '420px' }}>
                {feeRows.map(([label, value]) => (
                  <div key={label} style={dlRow}>
                    <dt style={dtStyle}>{label}</dt>
                    <dd style={ddStyle}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* SECTION 6: Water & Location */}
          <div style={dividerSection}>
            <h2 style={sectionH2}>Water &amp; Location</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
              <dl style={{ margin: 0 }}>
                {val(loc.waterBodyName) && (
                  <div style={dlRow}><dt style={dtStyle}>Water Body</dt><dd style={ddStyle}>{String(loc.waterBodyName)}</dd></div>
                )}
                {val(loc.waterType) && (
                  <div style={dlRow}><dt style={dtStyle}>Water Type</dt><dd style={ddStyle}>{String(loc.waterType)}</dd></div>
                )}
                {val(loc.hydrologicalType) && (
                  <div style={dlRow}><dt style={dtStyle}>Hydrological Type</dt><dd style={ddStyle}>{String(loc.hydrologicalType)}</dd></div>
                )}
                {formattedWatershed && (
                  <div style={dlRow}><dt style={dtStyle}>Watershed</dt><dd style={ddStyle}>{formattedWatershed}</dd></div>
                )}
                {val(loc.county) && (
                  <div style={dlRow}><dt style={dtStyle}>County</dt><dd style={ddStyle}>{String(loc.county)}</dd></div>
                )}
                {val(loc.street) && (
                  <div style={dlRow}><dt style={dtStyle}>Street</dt><dd style={ddStyle}>{String(loc.street)}</dd></div>
                )}
                {val(loc.zipCode) && (
                  <div style={dlRow}><dt style={dtStyle}>ZIP Code</dt><dd style={ddStyle}>{String(loc.zipCode)}</dd></div>
                )}
                <div style={dlRow}>
                  <dt style={dtStyle}>{source.kind === 'fwc' ? 'Source coordinates (not for navigation)' : 'Coordinates'}</dt>
                  <dd style={ddStyle}>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</dd>
                </div>
              </dl>
              {source.allowsCoordinateDirections ? (
                <div style={{ background: 'var(--navy-mid)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', minWidth: '170px', textAlign: 'center' }}>
                  <span aria-hidden style={{ fontSize: '2rem' }}>🗺️</span>
                  <p style={{ color: '#c5d1df', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>Open the source coordinates in your mapping app</p>
                  <a
                    href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold"
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.825rem' }}
                  >
                    Get Directions →
                  </a>
                </div>
              ) : (
                <div style={{ background: 'var(--navy-mid)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', minWidth: '190px', maxWidth: '230px', textAlign: 'center' }}>
                  <span aria-hidden style={{ fontSize: '2rem' }}>ℹ️</span>
                  <p style={{ color: '#c5d1df', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>FWC inventory coordinates are source-reference fields and are not provided for navigation.</p>
                  <a
                    href={FWC_ACCESS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold"
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.825rem' }}
                  >
                    Open Official FWC Finder →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 7: Administrative */}
          <div style={{ ...dividerSection, marginBottom: 0 }}>
            <h2 style={{ ...sectionH2, fontSize: '1rem', color: 'var(--gray)' }}>About This Data</h2>
            <dl style={{ margin: '0 0 1rem' }}>
              {adminRows.map(({ label, value, href, rel }) => (
                <div key={label} style={dlRow}>
                  <dt style={dtStyle}>{label}</dt>
                  <dd style={{ ...ddStyle, fontWeight: 400 }}>
                    {href
                      ? <a href={href} rel={rel} style={{ color: 'var(--navy)', textDecoration: 'underline' }}>{value}</a>
                      : value
                    }
                  </dd>
                </div>
              ))}
            </dl>
            <p style={{ fontSize: '0.8rem', color: '#596474', lineHeight: 1.7, marginBottom: '1.25rem' }}>{source.note}</p>
            {val(loc.sourceProcessingNote) && (
              <p style={{ fontSize: '0.8rem', color: '#596474', lineHeight: 1.7, margin: '-0.5rem 0 1.25rem' }}>
                <strong>Directory processing:</strong> {String(loc.sourceProcessingNote)}
              </p>
            )}
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1.125rem' }}>
              <p style={{ fontSize: '0.825rem', color: '#556', lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: 'var(--navy)' }}>Disclaimer:</strong> Information is provided for informational purposes only. Source fields are snapshots, not current inspections. Always verify facility hours, fees, accessibility, amenities, routing, and required permits before visiting. Contact the managing agency for current information.
              </p>
            </div>
          </div>

        </div>
      </section>

      <NearbyServices
        state={location.state}
        county={val(loc.county) ? String(loc.county) : null}
        city={val(location.city) ? String(location.city) : null}
      />

      {/* ── More Ramps in [State] ────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section style={{ background: 'var(--cream)', borderTop: '1px solid rgba(10,22,40,0.06)', padding: '4rem 1.5rem' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '2rem' }}>Nearby Ramps in {stateName}</h2>
            <div className="grid-3">
              {related.map((ramp) => (
                <Link key={ramp.slug} href={`/${state}/${ramp.slug}`} style={{ textDecoration: 'none' }}>
                  <article className="card">
                    <div
                      className="card-img"
                      style={{ width: '100%', height: '250px', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 60%, #2d7aa8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                      aria-label={`Map preview for ${ramp.name}`}
                    >
                      <svg aria-hidden viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
                        <path d="M0,60 Q25,50 50,60 T100,60 L100,100 L0,100 Z" fill="white" />
                        <path d="M0,70 Q25,60 50,70 T100,70 L100,100 L0,100 Z" fill="white" opacity="0.5" />
                      </svg>
                      <span style={{ position: 'relative', color: 'var(--gold)', fontSize: '2.5rem', zIndex: 1 }}>⚓</span>
                    </div>
                    <div className="card-body">
                      <div className="card-meta"><span>📍</span><span>{ramp.city ? `${ramp.city}, ` : ''}{ramp.state}</span></div>
                      <h3 className="card-title">{ramp.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#667', lineHeight: 1.6 }}>{getRampPreview(ramp)}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
