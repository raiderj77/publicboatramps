import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertise to Boaters | Local Marine Business Partners',
  description:
    'Founding local partner placements for boat repair shops, marinas, bait stores, charters, rentals, storage, fuel, towing, and waterfront lodging.',
  alternates: { canonical: 'https://publicboatramps.com/advertise' },
  robots: { index: true, follow: true },
};

const cardStyle = {
  border: '1px solid rgba(10,22,40,0.12)',
  borderRadius: 'var(--radius)',
  background: 'white',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.75rem',
};

export default function AdvertisePage() {
  const emailHref =
    'mailto:contact@publicboatramps.com?subject=Public%20Boat%20Ramps%20Founding%20Partner&body=Business%20name%3A%0AWebsite%3A%0APhone%3A%0AService%20category%3A%0ACities%20or%20counties%20served%3A%0A';

  return (
    <article style={{ maxWidth: '1040px', margin: '0 auto', padding: '4rem 1.5rem 5rem', lineHeight: 1.75 }}>
      <header style={{ maxWidth: '760px', marginBottom: '2.5rem' }}>
        <p className="section-label">Founding Partner Pilot</p>
        <h1 style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.1rem)', lineHeight: 1.15, marginBottom: '1rem' }}>
          Put your marine business in front of boaters planning a launch
        </h1>
        <p style={{ color: '#556', fontSize: '1.05rem', margin: 0 }}>
          Public Boat Ramps is testing a small, manually reviewed local-service directory. The first pilot focuses
          on Florida because the site has its strongest source coverage there. Every paid placement is clearly
          labeled Paid Advertisement.
        </p>
      </header>

      <section aria-labelledby="partner-options">
        <h2 id="partner-options" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.7rem', marginBottom: '1.25rem' }}>
          Partner options
        </h2>

        <div className="grid-3">
          <div style={cardStyle}>
            <p className="section-label">Basic Profile</p>
            <h3 style={{ margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>$0</h3>
            <p style={{ margin: 0, color: '#556' }}>
              A manually reviewed business name, service category, website, phone number, and service area. Basic
              profiles are not guaranteed placement or prominence.
            </p>
          </div>

          <div style={{ ...cardStyle, borderColor: 'rgba(201,168,76,0.65)' }}>
            <p className="section-label">County Partner</p>
            <h3 style={{ margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>$29 per month</h3>
            <p style={{ margin: 0, color: '#556' }}>
              A labeled sponsored card on matching ramp pages in one county, subject to category relevance and
              manual approval.
            </p>
          </div>

          <div style={cardStyle}>
            <p className="section-label">Regional Partner</p>
            <h3 style={{ margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>$79 per month</h3>
            <p style={{ margin: 0, color: '#556' }}>
              Priority labeled placement across as many as five approved counties for one business and service
              category.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Eligible businesses
          </h2>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Boat and trailer repair</li>
            <li>Marinas and boat storage</li>
            <li>Bait and tackle stores</li>
            <li>Fishing guides and charters</li>
            <li>Boat and paddlecraft rentals</li>
            <li>Marine fuel and towing</li>
            <li>Waterfront lodging and campgrounds</li>
          </ul>
        </div>

        <div>
          <h2 style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Pilot rules
          </h2>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>Business identity, website, phone number, and service area must be confirmed.</li>
            <li>Paid placement never changes ramp facts, rankings, or source records.</li>
            <li>Sponsored links use the appropriate sponsored and nofollow attributes.</li>
            <li>Placement does not guarantee traffic, calls, bookings, or revenue.</li>
            <li>Payment is arranged only after the business and placement are approved.</li>
          </ul>
        </div>
      </section>

      <section
        style={{
          marginTop: '3rem',
          background: 'var(--navy)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          color: 'white',
        }}
      >
        <p className="section-label" style={{ color: 'var(--gold-light)' }}>Apply for a Founding Spot</p>
        <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.7rem', marginBottom: '0.75rem' }}>
          Send your business details for review
        </h2>
        <p style={{ color: '#c5d1df', maxWidth: '720px', marginBottom: '1.25rem' }}>
          Include your business name, website, phone number, service category, and the Florida cities or counties
          you serve. No payment is requested until the placement details are confirmed in writing.
        </p>
        <a href={emailHref} className="btn btn-gold">
          Email Partner Request
        </a>
      </section>
    </article>
  );
}
