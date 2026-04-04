import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Public Boat Ramps Directory',
};

export default function PrivacyPage() {
  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#003d99' }}>
        Privacy Policy
      </h1>

      <p style={{ marginBottom: '1rem' }}>
        <strong>Last Updated: April 4, 2026</strong>
      </p>

      <p>
        Public Boat Ramps Directory ("we," "us," "our," or "Company") operates the publicboatramps.com
        website (the "Site"). This page informs you of our policies regarding the collection, use, and
        disclosure of personal data when you use our Site and the choices you have associated with that
        data.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        1. Data Collection
      </h2>
      <p>
        We collect minimal personal information directly from you. The information we collect may include:
        IP addresses and browsing behavior through cookies and analytics tools; information about your
        device (browser type, operating system, screen resolution); and any information you voluntarily
        provide when contacting us via email.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        2. Cookies and Tracking
      </h2>
      <p>
        We use cookies and similar tracking technologies to improve your experience on our Site. Cookies
        help us understand how you use the Site so we can enhance functionality and performance. You can
        control cookie settings through your browser, though some features may not function properly if you
        disable cookies.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        3. Google AdSense
      </h2>
      <p>
        Our Site uses Google AdSense to display advertising. Google uses cookies to serve ads based on your
        prior visits to this Site and other websites. You can opt out of Google's use of cookies for
        personalized advertising by visiting Google's Ads Settings
        (https://www.google.com/settings/ads). Additionally, you can opt out of a third-party vendor's use
        of cookies by visiting the Network Advertising Initiative opt-out page
        (https://www.networkadvertising.org/choices/).
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        4. Analytics
      </h2>
      <p>
        We may use analytics services to track and analyze visitor behavior on our Site. This helps us
        understand how people use our directory and improve the user experience. Information collected
        includes page views, click behavior, and other engagement metrics. This data is aggregated and does
        not identify individuals.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        5. Data Retention
      </h2>
      <p>
        We retain personal data only for as long as necessary to provide our services and fulfill the
        purposes outlined in this Privacy Policy. You may request deletion of your data by contacting us at
        privacy@publicboatramps.com.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        6. GDPR Compliance
      </h2>
      <p>
        For users in the European Union, the General Data Protection Regulation (GDPR) provides you with
        certain rights regarding your personal data. These include the right to access, rectify, erase, or
        restrict processing of your data. You also have the right to data portability and the right to
        object to processing. To exercise any of these rights, please contact us at privacy@publicboatramps.com.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        7. CCPA Compliance
      </h2>
      <p>
        For California residents, the California Consumer Privacy Act (CCPA) provides you the right to know
        what personal information is collected, the right to delete personal information received from you,
        and the right to opt-out of the sale or sharing of your personal information. While we do not sell
        personal information, we do use third-party services that may use data for advertising purposes. To
        exercise CCPA rights, please contact us at privacy@publicboatramps.com.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        8. Third-Party Links
      </h2>
      <p>
        Our Site may contain links to third-party websites. We are not responsible for the privacy practices
        of these external sites. We encourage you to review the privacy policies of any third-party sites
        before providing personal information.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        9. Security
      </h2>
      <p>
        We implement reasonable security measures to protect your data. However, no method of transmission
        over the internet is 100% secure. We cannot guarantee absolute security of your information.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        10. Changes to This Policy
      </h2>
      <p>
        We may update this Privacy Policy periodically. Changes will be posted on this page with an updated
        "Last Updated" date. Continued use of the Site following changes constitutes acceptance of the
        updated Policy.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        11. Contact Us
      </h2>
      <p>
        If you have questions about this Privacy Policy or our privacy practices, please contact us at:
        <br />
        Email: privacy@publicboatramps.com
      </p>
    </article>
  );
}
