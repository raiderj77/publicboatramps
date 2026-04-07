import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { Playfair_Display, Lora } from 'next/font/google';
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
  title: {
    template: '%s | Public Boat Ramps Directory',
    default: 'Public Boat Ramps Directory',
  },
  description:
    'Find free public boat ramps, launches, and water access points near you. Browse by state and discover available amenities.',
  keywords:
    'boat ramp, public boat launch, free boat ramp, boat ramp near me, public water access, boat launch, fishing access',
  alternates: { canonical: 'https://publicboatramps.com' },
  verification: { google: 'JO8wsuC-N2Dy3caNOM8Umb16JpluD74KupzHJm6Fnls' },
  openGraph: {
    title: 'Public Boat Ramps Directory',
    description: 'Find free public boat ramps, launches, and water access points near you.',
    url: 'https://publicboatramps.com',
    siteName: 'Public Boat Ramps Directory',
    type: 'website',
  },
  robots: 'index, follow, max-snippet:-1',
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
];

const directorySites = [
  { name: 'Find Swim Spots', href: 'https://findswimspots.com' },
  { name: 'Craft Distillery Finder', href: 'https://craftdistilleryfinder.com' },
  { name: 'Drive-In Tonight', href: 'https://driveintonight.com' },
  { name: 'All Skate Parks', href: 'https://allskateparks.com' },
  { name: 'Rockhounding Finder', href: 'https://rockhoundingfinder.com' },
  { name: 'Nearby Escape Rooms', href: 'https://nearbyescaperooms.com' },
  { name: 'All Skating Rinks', href: 'https://allskatingrinks.com' },
  { name: 'Soak USA', href: 'https://soakusa.net' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable}`}>
      <head>
        <meta name="msvalidate.01" content="C4C9B6256BDEDED169E4DE01CA953390" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Consent Mode v2 — must fire before any tracking or ad scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',wait_for_update:500});`,
          }}
        />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7171402107622932"
          strategy="afterInteractive"
          async
        />
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "vsqobt7va0");`,
          }}
        />
      </head>
      <body>
        {/* ── Header ── */}
        <header style={{
          background: 'var(--navy)',
          borderBottom: '3px solid var(--gold)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 20px rgba(10,22,40,0.4)',
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>⚓</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--gold)', letterSpacing: '0.01em' }}>
                Public Boat Ramps
              </span>
            </Link>
            <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <Link href="/" style={{ color: '#cdd8e8', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.03em', transition: 'color 0.2s' }}>Home</Link>
              <Link href="/about" style={{ color: '#cdd8e8', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.03em' }}>About</Link>
              <Link href="/contact" style={{ color: '#cdd8e8', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.03em' }}>Contact</Link>
            </nav>
          </div>
        </header>

        <main style={{ minHeight: 'calc(100vh - 340px)' }}>{children}</main>

        {/* ── Footer ── */}
        <footer style={{ background: 'var(--navy)', borderTop: '3px solid var(--gold)', marginTop: '5rem', padding: '3rem 0 2rem' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>⚓ Public Boat Ramps</p>
                <p style={{ color: '#9ab', fontSize: '0.875rem', lineHeight: 1.7 }}>Free directory of public boat ramps and water access points across the United States.</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Directory Sites</h4>
                <ul style={{ listStyle: 'none' }}>
                  {directorySites.map((s) => (
                    <li key={s.href} style={{ marginBottom: '0.4rem' }}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: '#9ab', fontSize: '0.875rem', textDecoration: 'none' }}>{s.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Tools</h4>
                <ul style={{ listStyle: 'none' }}>
                  {toolSites.map((s) => (
                    <li key={s.href} style={{ marginBottom: '0.4rem' }}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: '#9ab', fontSize: '0.875rem', textDecoration: 'none' }}>{s.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ color: '#677', fontSize: '0.85rem' }}>© 2026 Public Boat Ramps Directory. All rights reserved.</p>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {[['About', '/about'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
                  <Link key={href} href={href} style={{ color: '#677', fontSize: '0.85rem', textDecoration: 'none' }}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
