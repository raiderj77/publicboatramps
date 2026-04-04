import type { Metadata } from 'next';
import Link from 'next/link';
import locations from '@/data/locations.json';

export const revalidate = 86400;

const states = [
  { name: 'Alabama', slug: 'alabama' },
  { name: 'Alaska', slug: 'alaska' },
  { name: 'Arizona', slug: 'arizona' },
  { name: 'Arkansas', slug: 'arkansas' },
  { name: 'California', slug: 'california' },
  { name: 'Colorado', slug: 'colorado' },
  { name: 'Connecticut', slug: 'connecticut' },
  { name: 'Delaware', slug: 'delaware' },
  { name: 'Florida', slug: 'florida' },
  { name: 'Georgia', slug: 'georgia' },
  { name: 'Hawaii', slug: 'hawaii' },
  { name: 'Idaho', slug: 'idaho' },
  { name: 'Illinois', slug: 'illinois' },
  { name: 'Indiana', slug: 'indiana' },
  { name: 'Iowa', slug: 'iowa' },
  { name: 'Kansas', slug: 'kansas' },
  { name: 'Kentucky', slug: 'kentucky' },
  { name: 'Louisiana', slug: 'louisiana' },
  { name: 'Maine', slug: 'maine' },
  { name: 'Maryland', slug: 'maryland' },
  { name: 'Massachusetts', slug: 'massachusetts' },
  { name: 'Michigan', slug: 'michigan' },
  { name: 'Minnesota', slug: 'minnesota' },
  { name: 'Mississippi', slug: 'mississippi' },
  { name: 'Missouri', slug: 'missouri' },
  { name: 'Montana', slug: 'montana' },
  { name: 'Nebraska', slug: 'nebraska' },
  { name: 'Nevada', slug: 'nevada' },
  { name: 'New Hampshire', slug: 'new-hampshire' },
  { name: 'New Jersey', slug: 'new-jersey' },
  { name: 'New Mexico', slug: 'new-mexico' },
  { name: 'New York', slug: 'new-york' },
  { name: 'North Carolina', slug: 'north-carolina' },
  { name: 'North Dakota', slug: 'north-dakota' },
  { name: 'Ohio', slug: 'ohio' },
  { name: 'Oklahoma', slug: 'oklahoma' },
  { name: 'Oregon', slug: 'oregon' },
  { name: 'Pennsylvania', slug: 'pennsylvania' },
  { name: 'Rhode Island', slug: 'rhode-island' },
  { name: 'South Carolina', slug: 'south-carolina' },
  { name: 'South Dakota', slug: 'south-dakota' },
  { name: 'Tennessee', slug: 'tennessee' },
  { name: 'Texas', slug: 'texas' },
  { name: 'Utah', slug: 'utah' },
  { name: 'Vermont', slug: 'vermont' },
  { name: 'Virginia', slug: 'virginia' },
  { name: 'Washington', slug: 'washington' },
  { name: 'West Virginia', slug: 'west-virginia' },
  { name: 'Wisconsin', slug: 'wisconsin' },
  { name: 'Wyoming', slug: 'wyoming' },
];

export async function generateStaticParams() {
  return states.map((state) => ({
    state: state.slug,
  }));
}

function getStateNameFromSlug(slug: string): string | undefined {
  const state = states.find((s) => s.slug === slug);
  return state?.name;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const stateName = getStateNameFromSlug(state);

  return {
    title: `Public Boat Ramps in ${stateName || 'State'}`,
    description: `Find free public boat ramps and launches in ${stateName}. Browse available facilities with amenities and location details.`,
    openGraph: {
      title: `Public Boat Ramps in ${stateName}`,
      description: `Find free public boat ramps and launches in ${stateName}.`,
    },
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const stateName = getStateNameFromSlug(state);

  const stateLocations = locations.filter(
    (loc) => loc.stateSlug === state.toLowerCase().replace(/-/g, '')
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://publicboatramps.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: stateName || 'State',
                item: `https://publicboatramps.com/${state}`,
              },
            ],
          }),
        }}
      />

      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#0066cc', marginRight: '1rem' }}>
          ← Back to Home
        </Link>
      </div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#003d99' }}>
        Public Boat Ramps in {stateName}
      </h1>

      {stateLocations.length > 0 ? (
        <div>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Found {stateLocations.length} public boat ramp
            {stateLocations.length !== 1 ? 's' : ''} in {stateName}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {stateLocations.map((location) => (
              <article
                key={location.slug}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '1.5rem',
                  background: '#fafafa',
                }}
              >
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#003d99' }}>
                  {location.name}
                </h2>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                  {location.city}, {location.state}
                </p>
                <p style={{ margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                  {location.description}
                </p>
                {location.amenities.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: '#333' }}>
                      Amenities:
                    </p>
                    <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                      {location.amenities.map((amenity) => (
                        <li key={amenity} style={{ color: '#666', fontSize: '0.95rem' }}>
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link
                  href={`/${state}/${location.slug}`}
                  style={{
                    color: '#0066cc',
                    fontWeight: '500',
                  }}
                >
                  View Details →
                </Link>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '2rem',
            background: '#f0f4f8',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Coming soon — check back soon for boat ramps in {stateName}
          </p>
        </div>
      )}
    </>
  );
}
