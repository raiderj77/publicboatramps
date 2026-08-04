import type { Metadata } from 'next';
import { FWC_INVENTORY_URL, FWC_METADATA_URL, OSM_COPYRIGHT_URL, USGS_BOAT_RAMPS_URL } from '@/lib/data-sources';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Public Boat Ramps Directory',
  alternates: { canonical: 'https://publicboatramps.com/terms' },
};

export default function TermsPage() {
  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 5rem', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--navy)' }}>
        Terms of Service
      </h1>

      <p style={{ marginBottom: '1rem' }}>
        <strong>Last Updated: August 3, 2026</strong>
      </p>

      <p>
        Welcome to Public Boat Ramps Directory ("Site"). These Terms of Service ("Terms") govern your use
        of our website and the information provided therein. By accessing or using this Site, you agree to
        comply with and be bound by these Terms. If you do not agree to these Terms, please do not use this
        Site.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        1. License and Use
      </h2>
      <p>
        The Site and its content are provided on an "as-is" basis for informational purposes only. Rights in
        the Site&apos;s original design, software, branding, and editorial presentation are separate from rights
        in third-party and public-source records. Nothing in these Terms limits permissions granted directly
        by a source license or applicable law.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        2. Disclaimer of Warranties
      </h2>
      <p>
        The information on this Site, including boat ramp locations, amenities, hours of operation, and
        facility conditions, is provided "as is" without warranties of any kind. We do not warrant that the
        information is accurate, complete, or current. Boat ramp conditions, hours, amenities, and
        accessibility may change without notice. We strongly recommend verifying information directly with
        relevant facility operators or your state's fish and wildlife agency before visiting.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        3. Limitation of Liability
      </h2>
      <p>
        To the fullest extent permitted by law, Public Boat Ramps Directory shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages arising from your use of or
        inability to use the Site or its content. This includes but is not limited to damages for lost
        profits, business interruption, or personal injury. Our total liability to you shall not exceed the
        amount you have paid to access our Site (if any).
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        4. User Conduct
      </h2>
      <p>
        You agree not to use this Site to: transmit illegal or harmful content; harass, abuse, or threaten
        others; violate intellectual property rights; engage in phishing or other fraudulent activities;
        introduce viruses or malware; or engage in any other conduct that we determine is inappropriate.
        Violation of these terms may result in termination of your access to the Site.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        5. Third-Party Content and Links
      </h2>
      <p>
        This Site may contain links to third-party websites and services. We are not responsible for the
        content, accuracy, or practices of these external sites. Your use of third-party sites is governed
        by their terms and conditions. Links do not constitute endorsement or sponsorship.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        6. Source Data and Licenses
      </h2>
      <p>
        Source records retain their own terms and attribution. The{' '}
        <a href={USGS_BOAT_RAMPS_URL}>U.S. Geological Survey Boat Ramp Locations dataset</a> is released under
        CC0 1.0. OpenStreetMap-derived records are attributed to{' '}
        <a href={OSM_COPYRIGHT_URL}>OpenStreetMap contributors</a> and are subject to the Open Data Commons Open
        Database License. The <a href={FWC_INVENTORY_URL}>FWC Florida Boat Ramp Inventory</a> is used under the
        conditions stated in its <a href={FWC_METADATA_URL}>official original metadata</a>. That metadata describes
        the dataset as public domain, prohibits recipients from claiming proprietary rights in it, expects acknowledgment of the Florida Fish and
        Wildlife Conservation Commission, Fish and Wildlife Research Institute (FWC-FWRI), preservation of
        original metadata when data is altered, a request to share modified information with FWC, and the instruction that the dataset is not for navigation.
        We filter and normalize FWC fields for directory display; those transformations do not create ownership
        in the underlying FWC data. Review the linked source terms before reusing source records.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        7. Intellectual Property
      </h2>
      <p>
        The Site&apos;s original text, graphics, logos, design, and software may be protected by copyright,
        trademark, and other laws. Third-party names, marks, and source records remain the property of their
        respective owners or are available under their stated licenses. You may not imply that a source agency
        endorses this Site.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        8. Assumption of Risk
      </h2>
      <p>
        Your use of boat ramps and water access points is entirely at your own risk. We do not guarantee the
        safety, condition, or availability of any facility listed on this directory. You are responsible for
        ensuring that you have the proper training, equipment, and permits to safely operate your vessel.
        Always follow posted rules and regulations at boat ramps.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        9. Governing Law
      </h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the United States,
        without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction
        of the courts of the jurisdiction where disputes arise.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        10. Changes to Terms
      </h2>
      <p>
        We reserve the right to modify these Terms at any time. Changes will be posted on this page with an
        updated "Last Updated" date. Continued use of the Site following changes constitutes acceptance of
        the updated Terms.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        11. Business Profiles and Paid Advertisements
      </h2>
      <p>
        Business profiles and paid placements are separate from public ramp source records. Paid placements are
        identified as Paid Advertisement. Payment does not change ramp facts, ramp rankings, or editorial content,
        and a listing does not constitute an endorsement or guarantee of a business, service, price, availability,
        traffic, calls, bookings, or revenue. Advertisers are responsible for the accuracy and legality of their
        claims. Pilot pricing, billing, cancellation, and placement details are confirmed in writing before payment.
        We may reject, pause, correct, or remove a profile or advertisement that is inaccurate, misleading, unsafe,
        unlawful, outside the directory's scope, or inconsistent with these Terms.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        12. Severability
      </h2>
      <p>
        If any provision of these Terms is found to be invalid or unenforceable, that provision shall be
        severed, and the remaining provisions shall continue in full force and effect.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        13. Contact Us
      </h2>
      <p>
        If you have questions about these Terms, please contact us at contact@publicboatramps.com.
      </p>
    </article>
  );
}
