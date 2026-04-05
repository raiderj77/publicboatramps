/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import locations from '@/data/locations.json';

export const dynamic = 'force-static';

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

const IMG_KEYWORDS = ['boat+ramp','lake+dock','marina','fishing+boat','boat+launch','river+boat'];

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
        potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://publicboatramps.com/search?q={search_term_string}' }, 'query-input': 'required name=search_term_string' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What are public boat ramps?', acceptedAnswer: { '@type': 'Answer', text: 'Public boat ramps are free or low-cost water access points where boaters can launch their vessels. Most are maintained by government agencies and allow recreational boating.' } },
          { '@type': 'Question', name: 'Are there fees to use public boat ramps?', acceptedAnswer: { '@type': 'Answer', text: 'Most public boat ramps are free to use. Some facilities may charge nominal parking fees or require a permit, which is typically inexpensive.' } },
          { '@type': 'Question', name: 'What amenities are available at public boat ramps?', acceptedAnswer: { '@type': 'Answer', text: 'Common amenities include paved launch ramps, trailer parking, restrooms, picnic areas, and fishing piers.' } },
          { '@type': 'Question', name: 'Do I need a permit to launch a boat at public ramps?', acceptedAnswer: { '@type': 'Answer', text: 'Most public ramps are free to use without a permit. Some states may require boat registration or launch permits.' } },
          { '@type': 'Question', name: 'How can I find boat ramps near me?', acceptedAnswer: { '@type': 'Answer', text: 'Browse our directory by state to find public boat ramps in your area.' } },
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
          <form method="GET" action="/search" className="anim-fade-up anim-delay-3">
            <div className="search-wrap">
              <input type="text" name="q" placeholder="Search by city, state, or ramp name…" className="search-input" />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>
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
                    src={`https://picsum.photos/seed/${ramp.slug}/800/500`}
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
                      {ramp.description.slice(0, 110)}…
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
      <section style={{ padding: '5rem 1.5rem' }}>
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
