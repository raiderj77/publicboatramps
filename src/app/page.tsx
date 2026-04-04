import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Find Public Boat Ramps Near You',
  description:
    'Browse free public boat ramps and launches across the United States. Search by state and find the perfect access point for your boating adventure.',
  openGraph: {
    title: 'Find Public Boat Ramps Near You',
    description:
      'Browse free public boat ramps and launches across the United States.',
  },
};

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

const featuredListings = [
  {
    name: 'Lake Texoma Public Launch',
    city: 'Denison',
    state: 'TX',
    description: 'Large public facility with multiple launch lanes and extensive parking.',
  },
  {
    name: 'Clear Lake Park Ramp',
    city: 'Houston',
    state: 'TX',
    description: 'Well-maintained ramp, excellent for saltwater and bay fishing.',
  },
  {
    name: 'Lake Okeechobee Public Access',
    city: 'Clewiston',
    state: 'FL',
    description: 'Free access to one of Florida\'s largest freshwater lakes.',
  },
  {
    name: 'California Delta Public Ramp',
    city: 'Stockton',
    state: 'CA',
    description: 'Great for fishing, water skiing, and cruising the delta waterways.',
  },
  {
    name: 'Wisconsin Dells Public Ramp',
    city: 'Wisconsin Dells',
    state: 'WI',
    description: 'Popular for tube floats, water sports, and scenic cruising.',
  },
  {
    name: 'Lake Union Public Launch',
    city: 'Seattle',
    state: 'WA',
    description: 'Perfect for sailboating, fishing, and waterfront recreation.',
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Public Boat Ramps Directory',
            url: 'https://publicboatramps.com',
            logo: 'https://publicboatramps.com/logo.png',
            description:
              'A comprehensive directory of free public boat ramps and launches across the United States.',
            sameAs: [
              'https://publicboatramps.com',
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://publicboatramps.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://publicboatramps.com/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What are public boat ramps?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Public boat ramps are free or low-cost water access points where boaters can launch their vessels. Most are maintained by government agencies and allow recreational boating.',
                },
              },
              {
                '@type': 'Question',
                name: 'Are there fees to use public boat ramps?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Most public boat ramps are free to use. Some facilities may charge nominal parking fees or require a permit, which is typically inexpensive.',
                },
              },
              {
                '@type': 'Question',
                name: 'What amenities are available at public boat ramps?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Common amenities include paved launch ramps, trailer parking, restrooms, picnic areas, and fishing piers. Availability varies by location.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I need a permit to launch a boat at public ramps?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Most public ramps are free to use without a permit. Some states may require boat registration or launch permits. Check with your state\'s fish and wildlife agency for specific requirements.',
                },
              },
              {
                '@type': 'Question',
                name: 'How can I find boat ramps near me?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Browse our directory by state or use the search function to find public boat ramps in your area. Each listing includes location details, amenities, and coordinates.',
                },
              },
            ],
          }),
        }}
      />

      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#003d99' }}>
          Find Public Boat Ramps Near You
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Discover free public boat launches and water access points across the United States
        </p>
        <form
          method="GET"
          action="/search"
          style={{ marginBottom: '2rem' }}
        >
          <input
            type="text"
            name="q"
            placeholder="Search by city, state, or ramp name..."
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              width: '100%',
              maxWidth: '400px',
              border: '2px solid #ddd',
              borderRadius: '4px',
              marginRight: '0.5rem',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              background: '#003d99',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            Search
          </button>
        </form>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#003d99' }}>
          Featured Public Boat Ramps
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {featuredListings.map((listing, idx) => (
            <article
              key={idx}
              style={{
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '1.5rem',
                background: '#fafafa',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#003d99' }}>
                {listing.name}
              </h3>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.95rem' }}>
                {listing.city}, {listing.state}
              </p>
              <p style={{ margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                {listing.description}
              </p>
              <Link
                href={`/${listing.state.toLowerCase()}`}
                style={{
                  color: '#0066cc',
                  fontWeight: '500',
                }}
              >
                View all ramps in {listing.state} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <article style={{ marginBottom: '3rem', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#003d99' }}>
          About Public Boat Ramps
        </h2>
        <p>
          Public boat ramps are essential infrastructure that provides free or affordable access to
          America's waterways. These facilities allow boaters of all experience levels to safely launch
          and retrieve their vessels, supporting recreational boating, fishing, water sports, and
          tourism throughout the nation. Whether you're planning a weekend fishing trip, launching a
          sailboat, or exploring a new lake, public boat ramps offer convenient water access without
          breaking the bank.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Most public boat ramps are maintained by state fish and wildlife agencies, the U.S. Army Corps
          of Engineers, or local park departments. These organizations ensure that facilities are safe,
          well-maintained, and accessible to the public. Common amenities include paved launch ramps
          (which accommodate trailers and larger vessels), dedicated trailer parking, restroom facilities,
          picnic areas, and sometimes fishing piers or fish cleaning stations.
        </p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
          How to Use the Directory
        </h3>
        <p>
          Our comprehensive directory makes it easy to find public boat ramps in your area. Browse by
          state using the links below, or search for a specific location. Each listing includes the
          ramp's address, coordinates for GPS navigation, available amenities, and a brief description
          to help you choose the best access point for your needs.
        </p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
          Best Practices for Visiting Public Boat Ramps
        </h3>
        <p>
          When using public boat ramps, remember these etiquette guidelines to ensure a pleasant experience
          for everyone: Always practice good launching etiquette by moving your vehicle and trailer away from
          the ramp once your boat is in the water, allowing other boaters to launch. Respect posted rules
          and hours of operation. Many facilities have specific closing times and seasonal restrictions.
          Check if your state requires boat registration or launch permits before heading out—most do, and
          these are inexpensive. Trailer parking can be limited at popular ramps, so arrive early on busy
          weekends. Leave the launch area clean and take out what you bring in. Finally, be aware of local
          fishing regulations and any special restrictions that may apply to the body of water you're visiting.
        </p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
          Required Permits and Registration
        </h3>
        <p>
          Most U.S. states require boat registration for recreational vessels. Registration fees are typically
          modest and help fund water safety programs and facility maintenance. Some states also offer launch
          permits or day-use passes for specific facilities, though many public ramps are completely free to use.
          Contact your state's fish and wildlife agency or check their website to confirm current requirements for
          your vessel and the specific ramp you plan to visit.
        </p>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#003d99' }}>
          Frequently Asked Questions
        </h3>
        <dl>
          <dt style={{ fontWeight: 'bold', marginTop: '1rem' }}>
            What are public boat ramps?
          </dt>
          <dd style={{ margin: '0.5rem 0 1rem 0' }}>
            Public boat ramps are free or low-cost water access points where boaters can launch their
            vessels. Most are maintained by government agencies and allow recreational boating.
          </dd>

          <dt style={{ fontWeight: 'bold', marginTop: '1rem' }}>
            Are there fees to use public boat ramps?
          </dt>
          <dd style={{ margin: '0.5rem 0 1rem 0' }}>
            Most public boat ramps are free to use. Some facilities may charge nominal parking fees or
            require a permit, which is typically inexpensive.
          </dd>

          <dt style={{ fontWeight: 'bold', marginTop: '1rem' }}>
            What amenities are available at public boat ramps?
          </dt>
          <dd style={{ margin: '0.5rem 0 1rem 0' }}>
            Common amenities include paved launch ramps, trailer parking, restrooms, picnic areas, and
            fishing piers. Availability varies by location.
          </dd>

          <dt style={{ fontWeight: 'bold', marginTop: '1rem' }}>
            Do I need a permit to launch a boat at public ramps?
          </dt>
          <dd style={{ margin: '0.5rem 0 1rem 0' }}>
            Most public ramps are free to use without a permit. Some states may require boat registration
            or launch permits. Check with your state's fish and wildlife agency for specific requirements.
          </dd>

          <dt style={{ fontWeight: 'bold', marginTop: '1rem' }}>
            How can I find boat ramps near me?
          </dt>
          <dd style={{ margin: '0.5rem 0 1rem 0' }}>
            Browse our directory by state or use the search function to find public boat ramps in your area.
            Each listing includes location details, amenities, and coordinates.
          </dd>
        </dl>

        <p style={{ marginTop: '1.5rem' }}>
          Discover the perfect public boat ramp for your next adventure. Browse by state below to explore
          available facilities in your area. Whether you're a seasoned boater or just getting started, our
          directory has the information you need to plan a successful outing.
        </p>
      </article>

      <section>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#003d99' }}>
          Browse by State
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {states.map((state) => (
            <Link
              key={state}
              href={`/${state.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                display: 'block',
                padding: '0.75rem',
                background: '#f0f4f8',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                color: '#0066cc',
                fontWeight: '500',
              }}
            >
              {state}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
