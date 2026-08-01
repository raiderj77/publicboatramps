import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Public Boat Ramps Directory handles visitor and contact information.',
  alternates: { canonical: 'https://publicboatramps.com/privacy' },
};

const heading = { fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.5rem', color: 'var(--navy)' };

export default function PrivacyPage() {
  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 5rem', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--navy)' }}>Privacy Policy</h1>
      <p><strong>Last updated: July 30, 2026</strong></p>

      <p style={{ marginTop: '1rem' }}>
        Public Boat Ramps Directory is a public reference website. You do not need an account to browse it,
        and we do not ask for payment information. The optional nearby-ramp finder requests browser location only
        after you press the location button and approve the browser prompt.
      </p>

      <h2 style={heading}>Information you provide</h2>
      <p>
        If you email us, we receive the address, message, and other information you choose to include. Do not
        send sensitive personal information. We use correspondence to answer the request, review a listing
        correction, prevent abuse, and keep reasonable business records.
      </p>

      <h2 style={heading}>Hosting and technical records</h2>
      <p>
        The site is hosted by Vercel. Like most hosting providers, Vercel may process routine request data such
        as IP address, browser information, requested URL, timestamps, and diagnostic or security logs to
        deliver and protect the site. Retention and processing of those records are governed by Vercel&apos;s
        systems and policies. We do not promise zero logging or immediate deletion of infrastructure records.
      </p>

      <h2 style={heading}>Cookies, analytics, and advertising</h2>
      <p>
        Public Boat Ramps Directory does not currently load Google Analytics, Microsoft Clarity, Google
        AdSense advertising scripts, or another optional analytics or advertising tracker. We do not
        intentionally set advertising or analytics cookies. The site&apos;s AdSense account identifier and
        ads.txt file may remain published for ownership verification, but that does not mean ads are being
        served or that advertising cookies are active.
      </p>
      <p style={{ marginTop: '0.75rem' }}>
        If optional analytics or advertising is added later, this policy and any required consent controls
        will be updated before those tools are enabled.
      </p>

      <h2 style={heading}>Optional location search</h2>
      <p>
        The nearby-ramp finder uses the browser Geolocation API only after permission is granted. Before opening
        search results, the browser rounds latitude and longitude to two decimal places and adds the rounded values
        to the search URL. Search terms, rounded coordinates, and the selected radius may therefore appear in browser
        history, copied links, and routine Vercel request logs. We do not create a separate location-history profile
        or store finder coordinates in an application database.
      </p>

      <h2 style={heading}>External links and directions</h2>
      <p>
        Ramp pages include links to agency websites, OpenStreetMap attribution, and Google Maps directions.
        Those services receive information under their own policies only after you follow an external link;
        this site does not embed a Google map or transmit your ramp selection to Google automatically.
      </p>

      <h2 style={heading}>How information is used and shared</h2>
      <p>
        We use information to operate and secure the site, answer messages, correct directory records, and
        meet legal obligations. We do not sell personal information or share it for targeted advertising. We
        may disclose information to service providers that operate the site, when required by law, or when
        reasonably necessary to protect users, the site, or others.
      </p>

      <h2 style={heading}>Retention and your choices</h2>
      <p>
        Email and business records are kept only as long as reasonably needed for the purposes described
        above, subject to legal, security, and backup requirements. You may request access, correction, or
        deletion of information you submitted by emailing privacy@publicboatramps.com. Applicable law may
        provide additional rights, and some records may be retained where legally permitted or required.
      </p>

      <h2 style={heading}>Security and children</h2>
      <p>
        We use reasonable technical safeguards, but no internet service can guarantee absolute security. The
        site is a general-audience directory and is not directed to children under 13. We do not knowingly
        collect personal information from children.
      </p>

      <h2 style={heading}>Policy changes and contact</h2>
      <p>
        We may update this policy when the site or its service providers change. The date above will show the
        latest revision. Questions and privacy requests can be sent to privacy@publicboatramps.com.
      </p>
    </article>
  );
}
