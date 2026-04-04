import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

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
    description:
      'Find free public boat ramps, launches, and water access points near you.',
    url: 'https://publicboatramps.com',
    siteName: 'Public Boat Ramps Directory',
    images: [
      {
        url: 'https://publicboatramps.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Public Boat Ramps Directory',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public Boat Ramps Directory',
    description:
      'Find free public boat ramps, launches, and water access points near you.',
    images: ['https://publicboatramps.com/og-image.jpg'],
  },
  robots: 'index, follow, max-snippet:-1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="msvalidate.01" content="C4C9B6256BDEDED169E4DE01CA953390" />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7171402107622932"
          strategy="afterInteractive"
          async
        />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html {
            scroll-behavior: smooth;
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
          }
          a {
            color: #0066cc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          header {
            background: #003d99;
            color: white;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          header h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
          }
          nav {
            margin-top: 1rem;
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
          }
          nav a {
            color: #cce5ff;
            font-size: 0.95rem;
          }
          nav a:hover {
            color: white;
            text-decoration: underline;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          main {
            min-height: 60vh;
            padding: 2rem 0;
          }
          footer {
            background: #f5f5f5;
            padding: 2rem 0;
            border-top: 1px solid #ddd;
            margin-top: 3rem;
          }
          footer h3 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
            color: #003d99;
          }
          footer ul {
            list-style: none;
            margin-bottom: 1.5rem;
          }
          footer li {
            margin-bottom: 0.5rem;
          }
          footer a {
            color: #0066cc;
          }
          footer a:hover {
            text-decoration: underline;
          }
          .footer-section {
            margin-bottom: 2rem;
          }
          .footer-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }
          @media (max-width: 768px) {
            .footer-cols {
              grid-template-columns: 1fr;
            }
            nav {
              gap: 1rem;
            }
          }
        `}</style>
      </head>
      <body>
        <header>
          <div className="container">
            <h1>Public Boat Ramps Directory</h1>
            <nav>
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer>
          <div className="container">
            <div className="footer-cols">
              <div className="footer-section">
                <h3>Tools</h3>
                <ul>
                  <li>
                    <a
                      href="https://fibertools.app"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Fiber Tools
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://mindchecktools.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Mind Check Tools
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://flipmycase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Flip My Case
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://creatorrevenuecalculator.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Creator Revenue Calculator
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://contractextract.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contract Extract
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://medicalbillreader.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Medical Bill Reader
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://taxbreaktools.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tax Break Tools
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://524tracker.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      524 Tracker
                    </a>
                  </li>
                </ul>
              </div>
              <div className="footer-section">
                <h3>Directory Sites</h3>
                <ul>
                  <li>
                    <a
                      href="https://findswimspots.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Find Swim Spots
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://craftdistilleryfinder.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Craft Distillery Finder
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://driveintonight.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Drive Into Night
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://allskateparks.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      All Skate Parks
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://rockhoundingfinder.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Rockhounding Finder
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://nearbyescaperooms.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Nearby Escape Rooms
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://allskatingrinks.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      All Skating Rinks
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://soakusa.net"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Soak USA
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              &copy; 2026 Public Boat Ramps Directory. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
