import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { Playfair_Display, Lora } from 'next/font/google';
import { activeStates, popularWaterBodies } from '@/lib/nav-data';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://publicboatramps.com'),
  title: {
    template: '%s | Public Boat Ramps Directory',
    default: 'Public Boat Ramps Directory',
  },
  description:
    'Find public boat ramps, launches, and water access points near you. Browse verified facility details, fees, amenities, and sources.',
  keywords:
    'boat ramp, public boat launch, free boat ramp, boat ramp near me, public water access, boat launch, fishing access',
  alternates: { canonical: 'https://publicboatramps.com' },
  verification: { google: 'JO8wsuC-N2Dy3caNOM8Umb16JpluD74KupzHJm6Fnls' },
  openGraph: {
    title: 'Public Boat Ramps Directory',
    description: 'Find public boat ramps, launches, and water access points near you.',
    url: 'https://publicboatramps.com',
    siteName: 'Public Boat Ramps Directory',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Public Boat Ramps Directory' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public Boat Ramps Directory',
    description: 'Find public boat ramps, launches, and water access points near you.',
    images: ['/opengraph-image'],
  },
  robots: 'index, follow, max-snippet:-1',
  other: {
    'impact-site-verification': '37bd3b31-3c1f-4d10-9433-86dec1bc1797',
    'google-adsense-account': 'ca-pub-7171402107622932',
  },
};

const toolSites = [
  { name: 'Fiber Tools', href: 'https://fibertools.app' },
  { name: 'Mind Check Tools', href: 'https://mindchecktools.com' },
  { name: 'Flip My Case', href: 'https://flipmycase.com' },
  { name: 'Creator Revenue Calculator', href: 'https://creatorrevenuecalculator.com' },
  { name: 'Contract Extract', href: 'https://contractextract.com' },
  { name: 'Medical Bill Reader', href: 'https://medicalbillreader.com' },
  { name: 'Tax Break Tools', href: 'https://taxbreaktools.com' },
  { name: '524 Tracker', href: 'https://524tracker.com' },
  { name: 'AI Business Alternative', href: 'https://aibusinessalternative.com' },
];

const directorySites = [
  { name: 'Soak USA', href: 'https://soakusa.net' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable}`}>
      <head>
        <meta name="msvalidate.01" content="C4C9B6256BDEDED169E4DE01CA953390" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        {/* ── Header ── */}
        <header style={{
          background: 'var(--navy)',
          borderBottom: '3px solid var(--gold)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 20px rgba(10,22,40,0.4)',
        }}>
          <div className="container site-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>⚓</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--gold)', letterSpacing: '0.01em' }}>
                Public Boat Ramps
              </span>
            </Link>
            <nav aria-label="Primary navigation" className="site-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: '#cdd8e8', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.03em', transition: 'color 0.2s' }}>Home</Link>
              <Link href="/editorial" style={{ color: '#cdd8e8', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.03em' }}>Editorial</Link>
              <div className="nav-dropdown">
                <button type="button" className="nav-dropdown-summary" aria-expanded="false" aria-haspopup="true" data-nav-toggle>
                  States <span className="nav-caret" aria-hidden="true">&#9660;</span>
                </button>
                <div className="nav-dropdown-panel" role="menu">
                  {activeStates.map(s => (
                    <a key={s.stateSlug} href={`/${s.stateSlug}`} role="menuitem">{s.state}</a>
                  ))}
                </div>
              </div>
              <div className="nav-dropdown">
                <button type="button" className="nav-dropdown-summary" aria-expanded="false" aria-haspopup="true" data-nav-toggle>
                  Popular Water Bodies <span className="nav-caret" aria-hidden="true">&#9660;</span>
                </button>
                <div className="nav-dropdown-panel" role="menu">
                  {popularWaterBodies.map(w => (
                    <a key={`${w.stateSlug}::${w.waterBodySlug}`} href={`/${w.stateSlug}/water-body/${w.waterBodySlug}`} role="menuitem">
                      {w.waterBodyName}<span className="nav-state-abbr">({w.stateAbbr})</span>
                    </a>
                  ))}
                </div>
              </div>
              <Link href="/about" style={{ color: '#cdd8e8', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.03em' }}>About</Link>
              <Link href="/contact" style={{ color: '#cdd8e8', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.03em' }}>Contact</Link>
            </nav>
          </div>
        </header>

        <main id="main-content" style={{ minHeight: 'calc(100vh - 340px)' }}>{children}</main>

        {/* ── Footer ── */}
        <footer style={{ background: 'var(--navy)', borderTop: '3px solid var(--gold)', marginTop: '5rem', padding: '3rem 0 2rem' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>⚓ Public Boat Ramps</p>
                <p style={{ color: '#b8c5d6', fontSize: '0.875rem', lineHeight: 1.7 }}>Free-to-use directory of public boat ramps and water access points across the United States.</p>
              </div>
              <div>
                <h2 style={{ color: 'var(--gold-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Directory Sites</h2>
                <ul style={{ listStyle: 'none' }}>
                  {directorySites.map((s) => (
                    <li key={s.href} style={{ marginBottom: '0.4rem' }}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: '#b8c5d6', fontSize: '0.875rem', textDecoration: 'none' }}>{s.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 style={{ color: 'var(--gold-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>More from our network</h2>
                <ul style={{ listStyle: 'none' }}>
                  {toolSites.map((s) => (
                    <li key={s.href} style={{ marginBottom: '0.4rem' }}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: '#b8c5d6', fontSize: '0.875rem', textDecoration: 'none' }}>{s.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ color: '#b8c5d6', fontSize: '0.85rem' }}>© 2026 Public Boat Ramps Directory. All rights reserved.</p>
                <p style={{ color: '#b8c5d6', fontSize: '0.75rem' }}>
                  Location data sourced from{' '}
                  <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: '#d2dbe7', textDecoration: 'underline' }}>
                    OpenStreetMap contributors
                  </a>
                  {' '}(ODbL) and the{' '}
                  <a href="https://myfwc.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#d2dbe7', textDecoration: 'underline' }}>
                    Florida Fish and Wildlife Conservation Commission
                  </a>
                  {' '}(public domain). Per-record attribution shown on each ramp page.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                {[['About', '/about'], ['Accessibility', '/accessibility'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
                  <Link key={href} href={href} style={{ color: '#b8c5d6', fontSize: '0.85rem', textDecoration: 'none' }}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
        <Script id="nav-dropdown-toggle" strategy="afterInteractive">{`
          document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-nav-toggle]');
            const dropdown = btn ? btn.closest('.nav-dropdown') : null;
            document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(d => {
              if (d !== dropdown) {
                d.removeAttribute('data-open');
                d.querySelector('[data-nav-toggle]')?.setAttribute('aria-expanded', 'false');
              }
            });
            if (btn && dropdown) {
              const isOpen = dropdown.getAttribute('data-open') === 'true';
              if (isOpen) {
                dropdown.removeAttribute('data-open');
                btn.setAttribute('aria-expanded', 'false');
              } else {
                dropdown.setAttribute('data-open', 'true');
                btn.setAttribute('aria-expanded', 'true');
              }
            }
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(d => {
                d.removeAttribute('data-open');
                d.querySelector('[data-nav-toggle]')?.setAttribute('aria-expanded', 'false');
              });
            }
          });
        `}</Script>
      </body>
    </html>
  );
}
