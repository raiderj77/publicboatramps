import type { Metadata } from 'next';
import Link from 'next/link';
import locations from '@/data/locations.json';

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
  return locations.map((l) => ({ state: l.stateSlug, slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; slug: string }> }): Promise<Metadata> {
  const { state, slug } = await params;
  const location = locations.find((l) => l.slug === slug);
  const stateName = getStateName(state);
  return {
    title: `${location?.name ?? 'Boat Ramp'} — Public Boat Ramp in ${stateName}`,
    description: location?.description ?? `Public boat ramp in ${stateName}.`,
    alternates: { canonical: `https://publicboatramps.com/${state}/${slug}` },
    robots: { index: false, follow: true },
    openGraph: { title: `${location?.name} | Public Boat Ramps`, description: location?.description, url: `https://publicboatramps.com/${state}/${slug}` },
  };
}

const AMENITY_ICONS: Record<string, string> = {
  'Boat launch': '🚤', 'Trailer parking': '🅿️', 'Restrooms': '🚻', 'Parking': '🅿️',
  'Picnic area': '🌳', 'Fishing pier': '🎣', 'Fish cleaning station': '🐟',
  'Handicap accessible': '♿', 'Lighting': '💡', 'Security': '🔒',
};

function getRampPreview(ramp: { name: string; state: string; city: string; amenities: string[]; description: string }): string {
  const amenityCount = ramp.amenities.length;
  const location = ramp.city ? `${ramp.city}, ${ramp.state}` : ramp.state;
  if (amenityCount >= 2) {
    return `Public boat launch in ${location} with ${amenityCount} amenities including ${ramp.amenities.slice(0, 2).join(' and ').toLowerCase()}.`;
  }
  return `Public boat launch in ${location}. Free access to local waterways for boating and fishing.`;
}

export default async function LocationPage({ params }: { params: Promise<{ state: string; slug: string }> }) {
  const { state, slug } = await params;
  const location = locations.find((l) => l.slug === slug);
  const stateName = getStateName(state);

  if (!location) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)' }}>Ramp Not Found</h1>
        <Link href="/" className="btn btn-gold" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>← Back to Home</Link>
      </div>
    );
  }

  const related = locations.filter((l) => l.stateSlug === state && l.slug !== slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://publicboatramps.com' },
          { '@type': 'ListItem', position: 2, name: stateName, item: `https://publicboatramps.com/${state}` },
          { '@type': 'ListItem', position: 3, name: location.name, item: `https://publicboatramps.com/${state}/${slug}` },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Park',
        name: location.name, description: location.description,
        geo: { '@type': 'GeoCoordinates', latitude: location.lat, longitude: location.lng },
        address: { '@type': 'PostalAddress', addressLocality: location.city, addressRegion: location.state, addressCountry: 'US' },
        amenityFeature: location.amenities.map((a: string) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
      }) }} />

      {/* Hero */}
      <div
        style={{
          width: '100%',
          height: '400px',
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 50%, #2d7aa8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '8px',
        }}
        aria-label={`Location preview for ${location.name}`}
      >
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          <path d="M0,55 Q25,45 50,55 T100,55 L100,100 L0,100 Z" fill="white" />
          <path d="M0,65 Q25,55 50,65 T100,65 L100,100 L0,100 Z" fill="white" opacity="0.5" />
          <path d="M0,75 Q25,65 50,75 T100,75 L100,100 L0,100 Z" fill="white" opacity="0.3" />
        </svg>
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1, padding: '2rem' }}>
          <div style={{ color: 'var(--gold)', fontSize: '4rem', marginBottom: '0.5rem' }}>⚓</div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            {location.name}
          </h1>
          <p style={{ color: 'var(--cream)', fontSize: '1.1rem' }}>
            {location.city ? `${location.city}, ` : ''}{location.state}
          </p>
        </div>
      </div>

      {/* Main content */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>

          {/* Left — description + amenities */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1rem' }}>About This Ramp</h2>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem', color: 'var(--text)' }}>
              {location.name} is a public boat launch located in {location.city ? `${location.city}, ` : ''}{location.state}.{' '}
              This facility offers free public water access{location.amenities.length > 0 ? ` with ${location.amenities.length} available amenities including ${location.amenities.slice(0, 2).join(' and ').toLowerCase()}` : ''}.{' '}
              GPS coordinates are available for navigation directly to the launch site.
            </p>

            {location.amenities.length > 0 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1.25rem' }}>Available Amenities</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  {location.amenities.map((amenity: string) => (
                    <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--white)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', boxShadow: '0 1px 6px rgba(10,22,40,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}>
                      <span>{AMENITY_ICONS[amenity] ?? '✓'}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>{amenity}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Map placeholder */}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1rem' }}>Location</h2>
            <div style={{ background: 'var(--navy-mid)', borderRadius: 'var(--radius)', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🗺️</span>
              <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
              <p style={{ color: '#8a9bb0', fontSize: '0.875rem' }}>Open in your mapping app for directions</p>
              <a
                href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
                style={{ marginTop: '0.5rem', padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}
              >
                Get Directions →
              </a>
            </div>

            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#556', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--navy)' }}>Disclaimer:</strong> Information is provided for informational purposes only. Always verify facility hours, amenities, and any required permits before visiting. Contact your state's fish and wildlife agency for up-to-date information.
              </p>
            </div>
          </div>

          {/* Right — info panel */}
          <aside>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)', position: 'sticky', top: '90px' }}>
              <div style={{ background: 'var(--navy)', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.1rem', margin: 0 }}>Ramp Details</h3>
              </div>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                {[
                  ['📍 Location', `${location.city ? `${location.city}, ` : ''}${location.state}`],
                  ['🌐 State', location.state],
                  ['🗺️ Latitude', location.lat.toFixed(5)],
                  ['🗺️ Longitude', location.lng.toFixed(5)],
                  ['🎣 Amenities', `${location.amenities.length} available`],
                  ['💰 Cost', 'Free / Low-cost'],
                ].map(([label, value]) => (
                  <div key={String(label)} style={{ paddingBottom: '0.85rem', marginBottom: '0.85rem', borderBottom: '1px solid rgba(10,22,40,0.07)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.9rem' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related ramps */}
      {related.length > 0 && (
        <section style={{ background: 'var(--cream)', borderTop: '1px solid rgba(10,22,40,0.06)', padding: '4rem 1.5rem' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '2rem' }}>More Ramps in {stateName}</h2>
            <div className="grid-3">
              {related.map((ramp, i) => (
                <Link key={ramp.slug} href={`/${state}/${ramp.slug}`} style={{ textDecoration: 'none' }}>
                  <article className="card">
                    <div
                      className="card-img"
                      style={{
                        width: '100%',
                        height: '250px',
                        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 60%, #2d7aa8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
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
