/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import locations from '@/data/locations.json';

export const dynamic = 'force-static';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

function getMapboxImage(lat: number, lng: number, width = 800, height = 500): string {
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${lng},${lat},14,0/${width}x${height}?access_token=${MAPBOX_TOKEN}`;
}

function getRampPreview(ramp: { name: string; state: string; city: string; amenities: string[]; description: string }): string {
  const amenityCount = ramp.amenities.length;
  const location = ramp.city ? `${ramp.city}, ${ramp.state}` : ramp.state;
  if (amenityCount >= 2) {
    return `Public boat launch in ${location} with ${amenityCount} amenities including ${ramp.amenities.slice(0, 2).join(' and ').toLowerCase()}.`;
  }
  return `Public boat launch in ${location}. Free access to local waterways for boating and fishing.`;
}

export const metadata: Metadata = {
  title: 'Find Public Boat Ramps Near You | Free Directory',
  description:
    'Browse free public boat ramps and launches across the United States. Search by state and find the perfect access point for your boating adventure.',
  openGraph: {
    title: 'Find Public Boat Ramps Near You',
    description: 'Browse free public boat ramps and launches across the United States.',
  },
};

const ALL_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

export default function Home() {
  const featuredRamps = locations.slice(0, 6);
  const statesWithData = Array.from(new Set(locations.map((l) => l.state))).sort();
  const totalStates = statesWithData.length;

  return (
    <>
      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebSite',
        url: 'https://publicboatramps.com',
        name: 'Public Boat Ramps Directory',
        dateModified: new Date().toISOString().substring(0,10),
        potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://publicboatramps.com/search?q={search_term_string}' }, 'query-input': 'required name=search_term_string' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Organization',
        name: 'Public Boat Ramps',
        url: 'https://publicboatramps.com',
        description: 'Directory of public boat ramps across the United States',
        dateModified: new Date().toISOString().substring(0,10),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'LocalBusiness',
        name: 'Public Boat Ramps Directory',
        url: 'https://publicboatramps.com',
        description: 'Find public boat ramps near you across the United States',
        areaServed: 'United States',
        dateModified: new Date().toISOString().substring(0,10),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Public Boat Ramps Editorial Team',
        url: 'https://publicboatramps.com/editorial',
        worksFor: {
          '@type': 'Organization',
          name: 'Public Boat Ramps Directory',
          url: 'https://publicboatramps.com',
        },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        dateModified: new Date().toISOString().substring(0,10),
        mainEntity: [
          { '@type': 'Question', name: 'How do I find a public boat ramp near me?', acceptedAnswer: { '@type': 'Answer', text: 'Use the Public Boat Ramps directory to search by state, county, or city. Each listing includes the ramp address, number of lanes, parking availability, fees, and facility amenities like courtesy docks and fish cleaning stations.' } },
          { '@type': 'Question', name: 'Are public boat ramps free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Many public boat ramps are free, but some charge a daily or annual launch fee ranging from $5 to $25 per day. Fee structures vary by state and managing agency — some ramps are managed by the Army Corps of Engineers, state fish and wildlife agencies, or local municipalities. Always check the individual listing for current fee information.' } },
          { '@type': 'Question', name: 'What should I bring to a public boat ramp?', acceptedAnswer: { '@type': 'Answer', text: 'Bring your boat registration, a valid fishing or boating license if required in your state, sufficient cash or card for launch fees, and safety equipment including life jackets and a throwable device. Check local regulations for required equipment specific to your state.' } },
          { '@type': 'Question', name: 'Can I launch any type of boat at a public ramp?', acceptedAnswer: { '@type': 'Answer', text: 'Most public ramps accommodate trailered powerboats, jon boats, and fishing boats. Some smaller or steeper ramps may have length or weight restrictions. Check the ramp listing for maximum boat size, trailer length limits, and surface condition (concrete, gravel, or dirt).' } },
          { '@type': 'Question', name: 'Do public boat ramps have parking for trailers?', acceptedAnswer: { '@type': 'Answer', text: 'Most public boat ramps include trailer parking, though capacity varies significantly. Popular ramps at peak times like summer weekends can fill quickly — arriving early is recommended. Some locations charge separate trailer parking fees. Check individual listings for parking details.' } },
        ],
      }) }} />

      {/* ── Hero ── */}
      <section style={{ position: 'relative', background: 'linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 100%)', overflow: 'hidden', padding: '6rem 1.5rem 7rem' }}>
        {/* Decorative circles */}
        <div aria-hidden style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(201,168,76,0.06)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(26,92,138,0.15)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="section-label anim-fade-up">Free Public Directory</p>
          <h1 className="anim-fade-up anim-delay-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: 'var(--white)', fontWeight: 700, marginBottom: '1.25rem', lineHeight: 1.15 }}>
            Find Public Boat Ramps<br />
            <span style={{ color: 'var(--gold)' }}>Near You</span>
          </h1>
          <p className="anim-fade-up anim-delay-2" style={{ fontSize: '1.15rem', color: '#9ab8cf', marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            Discover free public boat launches and water access points across all 50 states.
          </p>
          <div className="anim-fade-up anim-delay-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a href="#states" className="btn btn-gold">Browse by State →</a>
            <a href="/pennsylvania" className="btn btn-outline">View Sample Ramps</a>
          </div>
        </div>

        {/* Wave SVG */}
        <svg aria-hidden viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'block' }} preserveAspectRatio="none">
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="var(--cream)" />
        </svg>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: 'var(--white)', borderBottom: '1px solid rgba(10,22,40,0.08)', boxShadow: '0 2px 12px rgba(10,22,40,0.06)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { n: `${locations.length}+`, l: 'Listed Ramps' },
            { n: `${totalStates}`, l: 'States Covered' },
            { n: '100%', l: 'Free to Access' },
            { n: '24/7', l: 'Always Online' },
          ].map(({ n, l }) => (
            <div key={l} className="stat-item">
              <div className="stat-number">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Ramps ── */}
      <section style={{ padding: '5rem 1.5rem 4rem' }}>
        <div className="container">
          <p className="section-label">Top Picks</p>
          <h2 className="section-title">Featured Boat Ramps</h2>
          <p className="section-sub" style={{ marginBottom: '3rem' }}>Hand-picked public launches with great amenities and easy water access.</p>
          <div className="grid-3">
            {featuredRamps.map((ramp, i) => (
              <Link key={ramp.slug} href={`/${ramp.stateSlug}/${ramp.slug}`} style={{ textDecoration: 'none' }}>
                <article className="card">
                  <img
                    src={getMapboxImage(ramp.lat, ramp.lng)}
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
                    <h3 className="card-title">{ramp.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#667', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                      {getRampPreview(ramp)}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {ramp.amenities.slice(0, 3).map((a) => <span key={a} className="chip">{a}</span>)}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: 'var(--navy)', padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(201,168,76,0.07) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="section-label">Simple Process</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--white)' }}>How to Find Your Ramp</h2>
          </div>
          <div className="grid-3">
            {[
              { num: '1', title: 'Browse by State', desc: 'Select your state from the directory to see all public boat ramps in that region.' },
              { num: '2', title: 'Review Details', desc: 'Check amenities, GPS coordinates, and facility information for each ramp.' },
              { num: '3', title: 'Hit the Water', desc: 'Navigate directly to your chosen ramp and enjoy free public water access.' },
            ].map(({ num, title, desc }) => (
              <div key={num} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="step-num">{num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ color: '#8a9bb0', lineHeight: 1.7, fontSize: '0.95rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content / SEO ── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <article>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '1.25rem' }}>About Public Boat Ramps</h2>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Public boat ramps are essential infrastructure that provides free or affordable access to America's waterways. These facilities allow boaters of all experience levels to safely launch and retrieve their vessels, supporting recreational boating, fishing, water sports, and tourism throughout the nation. Whether you're planning a weekend fishing trip, launching a sailboat, or exploring a new lake, public boat ramps offer convenient water access without breaking the bank.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Most public boat ramps are maintained by state fish and wildlife agencies, the U.S. Army Corps of Engineers, or local park departments. These organizations ensure that facilities are safe, well-maintained, and accessible to the public. Common amenities include paved launch ramps (which accommodate trailers and larger vessels), dedicated trailer parking, restroom facilities, picnic areas, and sometimes fishing piers or fish cleaning stations.
            </p>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>How to Use the Directory</h3>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Our comprehensive directory makes it easy to find public boat ramps in your area. Browse by state using the links below, or search for a specific location. Each listing includes the ramp's address, coordinates for GPS navigation, available amenities, and a brief description to help you choose the best access point for your needs.
            </p>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>Best Practices for Visiting Public Boat Ramps</h3>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              When using public boat ramps, remember these etiquette guidelines: Always move your vehicle and trailer away from the ramp once your boat is in the water, allowing other boaters to launch. Respect posted rules and hours of operation. Check if your state requires boat registration or launch permits before heading out. Trailer parking can be limited at popular ramps, so arrive early on busy weekends. Leave the launch area clean and take out what you bring in.
            </p>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>Required Permits and Registration</h3>
            <p style={{ lineHeight: 1.85 }}>
              Most U.S. states require boat registration for recreational vessels. Registration fees are typically modest and help fund water safety programs and facility maintenance. Some states also offer launch permits or day-use passes for specific facilities, though many public ramps are completely free to use. Contact your state's fish and wildlife agency or check their website to confirm current requirements for your vessel and the specific ramp you plan to visit.
            </p>
          </article>
        </div>
      </section>

      {/* ── GEO Content ── */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid rgba(10,22,40,0.06)', padding: '5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <article>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
              How to find the best public boat ramp for your trip
            </h2>
            <p style={{ fontStyle: 'italic', color: 'var(--navy)', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.7 }}>
              Search by state or county, then filter by amenities — concrete ramps, courtesy docks, trailer parking, and restrooms are the key features that separate a good ramp from a frustrating one.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              When evaluating a ramp, match the facility to your boat type. A flat-bottomed jon boat can handle a gravel or dirt ramp, but a deep-V trailered boat needs a concrete surface that extends far enough into the water for a safe float-off. Courtesy docks are essential if you&apos;re launching solo. There are over 20,000 public boat ramps across the United States, managed by a mix of federal, state, and local agencies — the quality and amenities vary widely even within the same county.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem' }}>
              Trailer parking capacity is often the deciding factor on busy weekends. A ramp with only 10 trailer spaces fills before 8am on summer Saturdays at popular lakes. Use the listings to check parking notes before you make the drive. Recreational boating contributes over $230 billion to the U.S. economy annually, according to the National Marine Manufacturers Association — well-maintained public infrastructure is part of what sustains that activity.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
              What are the busiest times at public boat ramps?
            </h2>
            <p style={{ fontStyle: 'italic', color: 'var(--navy)', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.7 }}>
              Summer weekends between 6am and 10am are the busiest times at most public boat ramps. Arriving before 8am on Saturday and Sunday significantly reduces wait times at popular launches.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Seasonal patterns matter too. Spring and fall weekdays are typically the least crowded times to launch, with shorter ramp queues and more available trailer parking. Summer holiday weekends — Memorial Day, Fourth of July, and Labor Day — see the longest waits, often with ramp lines forming before sunrise at well-known fishing destinations.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem' }}>
              Fishing tournaments create unpredictable congestion even on weekdays. A bass tournament drawing 200 boats can back up a ramp for 90 minutes starting at 5am. Over 100 million Americans participate in recreational boating and fishing each year, according to the U.S. Fish and Wildlife Service — the demand on public launches is significant and growing. Check local fishing club schedules and tournament calendars before planning a mid-week launch.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
              What boat ramp etiquette should I follow?
            </h2>
            <p style={{ fontStyle: 'italic', color: 'var(--navy)', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.7 }}>
              Prepare your boat fully in the staging area before pulling onto the ramp. Move quickly during the launch, then immediately pull your vehicle and trailer out of the ramp lane to allow the next boater access.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Loading and unloading etiquette follows the same principle: retrieve your boat from the water, pull to the staging area, then take your time securing the vessel and gear without blocking the ramp. When retrieving, have your trailer backed and ready before your boat reaches the dock — don&apos;t back the trailer while other boaters wait on the water.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem' }}>
              Most ramp conflicts arise from boats being rigged on the ramp itself rather than in designated staging areas. Attaching downriggers, loading gear, and adjusting straps while occupying the active launch lane delays everyone behind you. Courteous ramp use means arriving prepared and treating the ramp as a high-traffic shared resource, not a private marina slip.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
              Are public boat ramps open year-round?
            </h2>
            <p style={{ fontStyle: 'italic', color: 'var(--navy)', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.7 }}>
              Many public boat ramps are open year-round, but seasonal closures are common in northern states where ice or flooding makes launching unsafe. Some ramps close October through April.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem' }}>
              Water levels after heavy rainfall can temporarily close ramps even during open seasons — a ramp that&apos;s submerged under 3 feet of flood water is unusable regardless of its posted hours. Always check with the local managing agency — Army Corps of Engineers project offices, state DNR websites, and county park departments typically post current closure notices online before you make the trip.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--navy)', marginBottom: '1rem' }}>
              Further Reading
            </h2>
            <ul style={{ lineHeight: 2, paddingLeft: '1.25rem' }}>
              <li>
                <a href="https://www.recreation.gov" rel="nofollow noopener noreferrer" target="_blank" style={{ color: 'var(--navy)' }}>
                  U.S. Army Corps of Engineers — Recreation Area Finder
                </a>{' '}(recreation.gov)
              </li>
              <li>
                <a href="https://www.nmma.org" rel="nofollow noopener noreferrer" target="_blank" style={{ color: 'var(--navy)' }}>
                  National Marine Manufacturers Association — Boating Resources
                </a>{' '}(nmma.org)
              </li>
              <li>
                <a href="https://www.fws.gov" rel="nofollow noopener noreferrer" target="_blank" style={{ color: 'var(--navy)' }}>
                  U.S. Fish and Wildlife Service — Fishing and Boating
                </a>{' '}(fws.gov)
              </li>
            </ul>

          </article>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid rgba(10,22,40,0.06)', padding: '5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-label">Common Questions</p>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          {[
            { q: 'What are public boat ramps?', a: 'Public boat ramps are free or low-cost water access points where boaters can launch their vessels. Most are maintained by government agencies and allow recreational boating, fishing, and water sports.' },
            { q: 'Are there fees to use public boat ramps?', a: 'Most public boat ramps are free to use. Some facilities may charge nominal parking fees or require a permit, which is typically inexpensive — often under $10 per day.' },
            { q: 'What amenities are available at public boat ramps?', a: 'Common amenities include paved launch ramps, trailer parking, restrooms, picnic areas, and fishing piers. Availability varies by location and managing agency.' },
            { q: 'Do I need a permit to launch a boat at public ramps?', a: 'Most public ramps are free to use without a launch permit. However, most states require your vessel to be registered. Check with your state fish and wildlife agency for specific requirements.' },
            { q: 'How can I find boat ramps near me?', a: 'Browse our directory by state using the links below, or use the search bar at the top of this page. Each listing includes GPS coordinates, amenities, and location details.' },
          ].map(({ q, a }) => (
            <details key={q} className="faq-item">
              <summary>{q}</summary>
              <div className="faq-answer">{a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Browse by State ── */}
      <section id="states" style={{ padding: '5rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p className="section-label">All States</p>
            <h2 className="section-title">Browse by State</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Select your state to see all public boat ramps and launches in that region.</p>
          </div>
          <div className="grid-states">
            {ALL_STATES.map((state) => (
              <Link
                key={state}
                href={`/${state.toLowerCase().replace(/\s+/g, '-')}`}
                className="state-link"
              >
                {state}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--navy)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <p className="section-label">Ready to Launch?</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--white)', marginBottom: '1rem' }}>Find Your Perfect Ramp Today</h2>
          <p style={{ color: '#8a9bb0', marginBottom: '2rem', lineHeight: 1.7 }}>
            Free access to over {locations.length} public boat launches across the United States.
          </p>
          <Link href="/pennsylvania" className="btn btn-gold">Explore Ramps →</Link>
        </div>
      </section>
    </>
  );
}
