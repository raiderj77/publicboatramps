/* eslint-disable @next/next/no-img-element */
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
  return stateList.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const stateName = getStateName(state);
  return {
    title: `Public Boat Ramps in ${stateName}`,
    description: `Find free public boat ramps and launches in ${stateName}. Browse available facilities with amenities and GPS coordinates.`,
    alternates: { canonical: `https://publicboatramps.com/${state}` },
    openGraph: { title: `Public Boat Ramps in ${stateName}`, description: `Find free public boat ramps in ${stateName}.`, url: `https://publicboatramps.com/${state}` },
  };
}

const IMG_KEYWORDS = ['boat+ramp','lake+dock','fishing+boat','marina','boat+launch','river+boat','lake+fishing','waterway'];

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateName = getStateName(state);
  const ramps = locations.filter((l) => l.stateSlug === state);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://publicboatramps.com' },
          { '@type': 'ListItem', position: 2, name: stateName, item: `https://publicboatramps.com/${state}` },
        ],
      }) }} />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)', padding: '4rem 1.5rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'url("https://source.unsplash.com/1200x600/?lake,boat&sig=99") center/cover no-repeat', opacity: 0.12, pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ color: 'var(--gold)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontWeight: 600 }}>← Back to All States</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'white', marginBottom: '0.75rem' }}>
            Public Boat Ramps in <span style={{ color: 'var(--gold)' }}>{stateName}</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="chip chip-navy">{ramps.length} {ramps.length === 1 ? 'Ramp' : 'Ramps'} Listed</span>
            <span style={{ color: '#8a9bb0', fontSize: '0.9rem' }}>Free public water access</span>
          </div>
        </div>
        <svg aria-hidden viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'block' }} preserveAspectRatio="none">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="var(--cream)" />
        </svg>
      </section>

      {/* Listings grid */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div className="container">
          {ramps.length > 0 ? (
            <div className="grid-3">
              {ramps.map((ramp, i) => (
                <Link key={ramp.slug} href={`/${state}/${ramp.slug}`} style={{ textDecoration: 'none' }}>
                  <article className="card">
                    <img
                      src={`https://source.unsplash.com/800x500/?${IMG_KEYWORDS[i % IMG_KEYWORDS.length]}&sig=${i + 20}`}
                      alt={ramp.name}
                      className="card-img"
                      loading="lazy"
                      width={800}
                      height={500}
                    />
                    <div className="card-body">
                      <div className="card-meta">
                        <span>📍</span>
                        <span>{ramp.city ? `${ramp.city}, ` : ''}{ramp.state}</span>
                      </div>
                      <h2 className="card-title">{ramp.name}</h2>
                      <p style={{ fontSize: '0.875rem', color: '#667', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                        {ramp.description.slice(0, 100)}…
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {ramp.amenities.slice(0, 3).map((a) => <span key={a} className="chip">{a}</span>)}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚓</p>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '0.75rem' }}>Coming Soon</h2>
              <p style={{ color: 'var(--gray)' }}>We're adding boat ramps in {stateName} soon. Check back soon!</p>
              <Link href="/" className="btn btn-gold" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>Browse Other States</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
