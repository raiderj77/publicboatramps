import type { Metadata } from 'next';
import Link from 'next/link';
import locations from '@/data/locations';
import { serializeJsonLd } from '@/lib/json-ld';
import { activeStates } from '@/lib/nav-data';
import { isIndexable } from '@/lib/quality-gate';

export const dynamic = 'force-static';

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

export const metadata: Metadata = {
  title: 'Find Public Boat Ramps Near You | Public Directory',
  description:
    'Browse source-attributed public boat ramp and launch records. Compare recorded locations, amenities, fee status, and source details.',
  openGraph: {
    title: 'Find Public Boat Ramps Near You',
    description: 'Browse source-attributed public boat ramp and launch records.',
  },
};

export default function Home() {
  const dataRichRamps = locations.filter((location) => isIndexable(location));
  const featuredRamps = dataRichRamps.slice(0, 6);

  return (
    <>
      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
        '@context': 'https://schema.org', '@type': 'WebSite',
        url: 'https://publicboatramps.com',
        name: 'Public Boat Ramps Directory',
        dateModified: '2026-08-03',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
        '@context': 'https://schema.org', '@type': 'Organization',
        name: 'Public Boat Ramps',
        url: 'https://publicboatramps.com',
        description: 'Directory of source-attributed public boat-ramp records in current indexed coverage areas',
        dateModified: '2026-08-03',
      }) }} />

      {/* ── Hero ── */}
      <section style={{ position: 'relative', background: 'linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 100%)', overflow: 'hidden', padding: '6rem 1.5rem 7rem' }}>
        {/* Decorative circles */}
        <div aria-hidden style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(201,168,76,0.06)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(26,92,138,0.15)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="section-label anim-fade-up" style={{ color: 'var(--gold-light)' }}>Public Access Directory</p>
          <h1 className="anim-fade-up anim-delay-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: 'var(--white)', fontWeight: 700, marginBottom: '1.25rem', lineHeight: 1.15 }}>
            Find Public Boat Ramps<br />{' '}
            <span style={{ color: 'var(--gold)' }}>Near You</span>
          </h1>
          <p className="anim-fade-up anim-delay-2" style={{ fontSize: '1.15rem', color: '#9ab8cf', marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            Compare source-attributed launch records, recorded facility details, fee status, and source limitations.
          </p>
          <form action="/find" method="get" className="anim-fade-up anim-delay-3" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <label htmlFor="home-ramp-search" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
              Search by city, county, ZIP code, water body, or ramp name
            </label>
            <input
              id="home-ramp-search"
              type="search"
              name="q"
              placeholder="City, county, ZIP, lake, or ramp"
              autoComplete="off"
              style={{ flex: '1 1 360px', minHeight: '52px', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '6px', padding: '0.75rem 1rem', font: 'inherit' }}
            />
            <button type="submit" className="btn btn-gold" style={{ minHeight: '52px', border: 0, cursor: 'pointer' }}>Search Ramps</button>
          </form>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem' }}>
            <Link href="/find" className="btn btn-outline">Use My Location</Link>
            <a href="#states" className="btn btn-outline">Browse by State</a>
          </div>
        </div>

        {/* Wave SVG */}
        <svg aria-hidden viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'block' }} preserveAspectRatio="none">
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="var(--cream)" />
        </svg>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: 'var(--white)', borderBottom: '1px solid rgba(10,22,40,0.08)', boxShadow: '0 2px 12px rgba(10,22,40,0.06)' }}>
        <div className="container stats-grid">
          {[
            { n: `${dataRichRamps.length.toLocaleString()}+`, l: 'Data-Rich Records' },
            { n: `${activeStates.length}`, l: 'States Covered' },
            { n: '$0', l: 'Membership Cost' },
            { n: 'Per Record', l: 'Source Attribution' },
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
          <p className="section-label">Featured Records</p>
          <h2 className="section-title">Featured Boat Ramps</h2>
          <p className="section-sub" style={{ marginBottom: '3rem' }}>A sample of data-rich listings with location, amenity, and source details.</p>
          <div className="grid-3">
            {featuredRamps.map((ramp, i) => (
              <Link key={ramp.slug} href={`/${ramp.stateSlug}/${ramp.slug}`} style={{ textDecoration: 'none' }}>
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
                    <div className="card-meta">
                      <span>📍</span>
                      <span>{ramp.city ? `${ramp.city}, ` : ''}{ramp.state}</span>
                    </div>
                    <h3 className="card-title">{ramp.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#667', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                      {getRampPreview(ramp)}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {ramp.amenities.slice(0, 3).map((a: string) => <span key={a} className="chip">{a}</span>)}
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
            <p className="section-label" style={{ color: 'var(--gold-light)' }}>Simple Process</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--white)' }}>How to Find Your Ramp</h2>
          </div>
          <div className="grid-3">
            {[
              { num: '1', title: 'Search or Browse', desc: 'Search by place, water body, ramp name, or optional rounded location.' },
              { num: '2', title: 'Review the Source Record', desc: 'Compare recorded amenities, fee status, GPS coordinates, and managing-agency information.' },
              { num: '3', title: 'Confirm and Go', desc: 'Confirm current conditions and safe routing with the managing agency before traveling.' },
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
              Public boat ramps are essential infrastructure that provides free or paid access to America&apos;s waterways. These facilities allow boaters of many experience levels to launch and retrieve vessels, supporting recreational boating, fishing, water sports, and tourism. Whether you&apos;re planning a weekend fishing trip, launching a sailboat, or exploring a new lake, check the recorded fee status and verify current charges with the operator.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Facility operators vary. Source records may identify a public agency, local government, or commercial operator and may list ramp surfaces, trailer parking, restrooms, docks, or other amenities. A recorded feature is not a current inspection; confirm conditions with the operator before traveling.
            </p>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>How to Use the Directory</h3>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Browse by state using the links below, then compare individual records. Listings may include an address, source-reference coordinates, amenities, fee status, managing agency, official source link, and a description. A mapping link appears only where the source terms allow it. Fields are shown only when the source record provides them.
            </p>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>Best Practices for Visiting Public Boat Ramps</h3>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Follow posted rules, hours, queueing instructions, and any directions from facility staff. Use a
              designated staging area when one is provided, keep active launch lanes clear, and move the vehicle
              and trailer to authorized parking after launching. Confirm vessel registration, launch permits,
              parking rules, and current operating conditions with the responsible agencies before traveling.
            </p>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>Required Permits and Registration</h3>
            <p style={{ lineHeight: 1.85 }}>
              Registration, launch permits, parking passes, and facility charges depend on the vessel, jurisdiction, and launch. Check the responsible state boating authority and the facility operator for current requirements. A record marked “No” for fee required means only that no launch fee was recorded in that source; parking or permit charges may still apply or may have changed.
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
              There is no universal best ramp. Search by place, then compare only the source-record fields that
              matter for your vessel, trailer, passengers, and planned water access.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Match the source-record fields to your needs, then confirm current ramp surface, water depth, dock condition, parking, closures, and vessel restrictions with the operator. This directory cannot determine whether a launch is suitable or safe for a particular boat.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem' }}>
              Parking values and amenity notes are reproduced from source records and may be incomplete or stale. Use them for initial planning, not as a reservation or availability guarantee.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
              When should I check current conditions?
            </h2>
            <p style={{ fontStyle: 'italic', color: 'var(--navy)', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.7 }}>
              Check immediately before departure whenever water level, weather, seasonal operations, construction, tournaments, or local events could affect the launch.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Use the managing agency or facility operator for closures and operating notices. Where a listing has an official source link or phone number, use it to confirm the details that matter to your trip.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem' }}>
              This directory does not publish live crowd levels, wait times, water depths, or parking availability.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
              What boat ramp etiquette should I follow?
            </h2>
            <p style={{ fontStyle: 'italic', color: 'var(--navy)', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.7 }}>
              Follow posted site procedures. When a staging area is provided, prepare and secure equipment there
              instead of occupying an active launch lane.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Keep docks, ramps, and traffic lanes available to other visitors; use only authorized parking and
              loading areas; and comply with staff instructions, posted time limits, and local rules. Conditions
              differ by facility, so a general directory cannot replace on-site instructions.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem' }}>
              Leave the area clean and report damaged infrastructure, unsafe conditions, or inaccurate directory
              fields to the managing agency and, when useful, to this directory.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
              Are public boat ramps open year-round?
            </h2>
            <p style={{ fontStyle: 'italic', color: 'var(--navy)', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.7 }}>
              Operating seasons vary by facility. Ice, flooding, low water, storms, maintenance, construction, and local rules can change access.
            </p>
            <p style={{ lineHeight: 1.85, marginBottom: '2.5rem' }}>
              Check the managing agency or operator before traveling. A source-record date is not proof that the facility is currently open.
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
            { q: 'What are public boat ramps?', a: 'Public boat ramps are water access points where boaters can launch vessels. They may be operated by federal, state, county, municipal, or commercial entities for general public use.' },
            { q: 'Are there fees to use public boat ramps?', a: 'Fee policies vary by facility. Some ramps have no recorded launch fee, while others charge for launching, parking, permits, or passes. Check the listing and confirm current rates with the managing agency.' },
            { q: 'What amenities are available at public boat ramps?', a: 'Source records may include ramp surface, lanes, docks, trailer parking, restrooms, or other fields. A recorded field is not a current inspection; confirm availability and condition with the managing agency.' },
            { q: 'Do I need a permit to launch a boat at public ramps?', a: 'Requirements vary by state and facility. Vessel registration, launch permits, parking passes, or local access permits may apply. Check the managing agency before visiting.' },
            { q: 'How can I find boat ramps near me?', a: 'Use the ramp finder to search by city, county, ZIP code, water body, ramp name, or an optional rounded browser location. Each qualifying listing includes source-reference coordinates and the other source fields available for that ramp. FWC-derived coordinates are not provided for navigation.' },
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
            <p className="section-label">Available States</p>
            <h2 className="section-title">Browse by State</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Select your state to see all public boat ramps and launches in that region.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem' }}>
            {activeStates.map((s) => (
              <Link
                key={s.stateSlug}
                href={`/${s.stateSlug}`}
                className="state-link"
              >
                {s.state}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Local business pilot ── */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid rgba(10,22,40,0.06)', padding: '4rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '860px', textAlign: 'center' }}>
          <p className="section-label">For Marine Businesses</p>
          <h2 className="section-title">Reach boaters while they plan a launch</h2>
          <p className="section-sub" style={{ margin: '0 auto 1.5rem' }}>
            A Florida founding-partner pilot is open to boat repair shops, marinas, storage facilities, bait stores,
            guides, charters, rentals, fuel providers, towing services, and waterfront lodging. Paid placements are
            labeled Paid Advertisement and never change ramp records or rankings.
          </p>
          <Link href="/advertise" className="btn btn-gold">View Partner Options</Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--navy)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <p className="section-label" style={{ color: 'var(--gold-light)' }}>Ready to Launch?</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--white)', marginBottom: '1rem' }}>Find a Ramp for Your Next Trip</h2>
          <p style={{ color: '#8a9bb0', marginBottom: '2rem', lineHeight: 1.7 }}>
            Free-to-browse access to {dataRichRamps.length.toLocaleString()} source-attributed, data-rich launch records.
          </p>
          <Link href="/find" className="btn btn-gold">Find Ramps →</Link>
        </div>
      </section>
    </>
  );
}
