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

function getStateNameFromSlug(slug: string): string | undefined {
  const state = states.find((s) => s.slug === slug);
  return state?.name;
}

export async function generateStaticParams() {
  return locations.map((location) => ({
    state: location.stateSlug,
    slug: location.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}): Promise<Metadata> {
  const { state, slug } = await params;
  const location = locations.find((loc) => loc.slug === slug);
  const stateName = getStateNameFromSlug(state);

  return {
    title: `${location?.name || 'Boat Ramp'} — Public Boat Ramp in ${location?.city}, ${stateName}`,
    description: location?.description || `Public boat ramp in ${location?.city}, ${stateName}`,
    openGraph: {
      title: `${location?.name} in ${location?.city}, ${stateName}`,
      description: location?.description,
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}) {
  const { state, slug } = await params;
  const location = locations.find((loc) => loc.slug === slug);
  const stateName = getStateNameFromSlug(state);

  if (!location) {
    return (
      <div>
        <h1>Location Not Found</h1>
        <p>The boat ramp you're looking for could not be found.</p>
        <Link href="/">← Back to Home</Link>
      </div>
    );
  }

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
              {
                '@type': 'ListItem',
                position: 3,
                name: location.name,
                item: `https://publicboatramps.com/${state}/${slug}`,
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Park',
            name: location.name,
            description: location.description,
            geo: {
              '@type': 'GeoCoordinates',
              latitude: location.lat,
              longitude: location.lng,
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: location.city,
              addressRegion: location.state,
            },
            amenityFeature: location.amenities.map((amenity) => ({
              '@type': 'LocationFeatureSpecification',
              name: amenity,
            })),
          }),
        }}
      />

      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/${state}`} style={{ color: '#0066cc' }}>
          ← Back to {stateName} Ramps
        </Link>
      </div>

      <article>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
          {location.name}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
          {location.city}, {location.state}
        </p>

        <div
          style={{
            background: '#f0f4f8',
            padding: '1.5rem',
            borderRadius: '6px',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#003d99' }}>
            Location Information
          </h2>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <dt style={{ fontWeight: 'bold', color: '#333' }}>City</dt>
              <dd style={{ margin: '0.25rem 0 1rem 0' }}>{location.city}</dd>
            </div>
            <div>
              <dt style={{ fontWeight: 'bold', color: '#333' }}>State</dt>
              <dd style={{ margin: '0.25rem 0 1rem 0' }}>{location.state}</dd>
            </div>
            <div>
              <dt style={{ fontWeight: 'bold', color: '#333' }}>Latitude</dt>
              <dd style={{ margin: '0.25rem 0 1rem 0' }}>{location.lat.toFixed(4)}</dd>
            </div>
            <div>
              <dt style={{ fontWeight: 'bold', color: '#333' }}>Longitude</dt>
              <dd style={{ margin: '0.25rem 0 1rem 0' }}>{location.lng.toFixed(4)}</dd>
            </div>
          </dl>
        </div>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#003d99' }}>
          About This Ramp
        </h2>
        <p style={{ marginBottom: '2rem', lineHeight: '1.8' }}>
          {location.description}
        </p>

        {location.amenities.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#003d99' }}>
              Available Amenities
            </h2>
            <ul
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem',
                paddingLeft: '1rem',
              }}
            >
              {location.amenities.map((amenity) => (
                <li key={amenity} style={{ color: '#666' }}>
                  ✓ {amenity}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          style={{
            background: '#f9f9f9',
            padding: '1.5rem',
            borderRadius: '6px',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ marginBottom: '0.5rem', color: '#003d99' }}>GPS Coordinates</h3>
          <p style={{ margin: '0' }}>
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
            Use these coordinates with your GPS device or mapping app for navigation.
          </p>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd' }}>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            <strong>Disclaimer:</strong> The information on this directory is provided for informational
            purposes only. While we strive to keep listings current and accurate, conditions at boat ramps
            may change. Always verify facility hours, amenities, and any required permits before visiting.
            Contact your state's fish and wildlife agency for the most up-to-date information.
          </p>
        </div>
      </article>
    </>
  );
}
