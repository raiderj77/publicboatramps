import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Public Boat Ramps Directory with questions or suggestions.',
};

export default function ContactPage() {
  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#003d99' }}>
        Contact Us
      </h1>

      <p>
        We'd love to hear from you! Whether you have questions about the directory, found an inaccuracy,
        or want to suggest a new boat ramp listing, please reach out to us.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Get in Touch
      </h2>
      <p>
        Email us at: <strong>contact@publicboatramps.com</strong>
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        What We'd Love to Hear About
      </h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>Corrections or updates to existing listings</li>
        <li>New public boat ramps for inclusion in our directory</li>
        <li>Questions or feedback about the directory</li>
        <li>Suggestions for improvement</li>
        <li>Reports of closed or inaccessible facilities</li>
        <li>Information about amenities or changes at known ramps</li>
      </ul>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Submitting a New Boat Ramp
      </h2>
      <p>
        If you'd like to suggest a public boat ramp for inclusion in our directory, please email us with the
        following information:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>Name of the boat ramp</li>
        <li>Location (city and state)</li>
        <li>Street address or access point</li>
        <li>GPS coordinates (if available)</li>
        <li>Available amenities</li>
        <li>Description of the facility</li>
        <li>Source of the information</li>
      </ul>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Response Time
      </h2>
      <p>
        We typically respond to inquiries within 3-5 business days. During peak periods, responses may take
        longer. Thank you for your patience.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Privacy
      </h2>
      <p>
        Any information you provide via email will be handled according to our Privacy Policy. Please review
        our Privacy Policy for details about how we protect your data.
      </p>

      <div
        style={{
          background: '#f0f4f8',
          padding: '1.5rem',
          borderRadius: '6px',
          marginTop: '2rem',
        }}
      >
        <p style={{ margin: '0' }}>
          <strong>Email:</strong> contact@publicboatramps.com
        </p>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.95rem' }}>
          For privacy concerns, please contact: privacy@publicboatramps.com
        </p>
      </div>
    </article>
  );
}
