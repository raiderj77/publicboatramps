import type { Metadata } from 'next';
import { FWC_INVENTORY_URL, FWC_METADATA_URL, OSM_COPYRIGHT_URL, USGS_BOAT_RAMPS_URL } from '@/lib/data-sources';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Public Boat Ramps Directory, its source records, quality gate, and limitations.',
  alternates: { canonical: 'https://publicboatramps.com/about' },
};

export default function AboutPage() {
  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 5rem', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--navy)' }}>
        About Public Boat Ramps Directory
      </h1>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Our Mission
      </h2>
      <p>
        Public Boat Ramps Directory is dedicated to helping boaters, fishers, and water enthusiasts discover
        public boat-launch records and source details. We believe that people should be able to compare
        opportunity to enjoy our nation's lakes, rivers, and coastal waters, regardless of their financial
        situation. Our mission is to compile a comprehensive, easy-to-use directory of public boat ramps
        across the United States.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        How the Directory Works
      </h2>
      <p>
        Our directory consolidates public boat-ramp source records from federal and state datasets and
        OpenStreetMap. Listings show only fields supplied by the source record, such as location, address,
        amenities, coordinates, and facility descriptions. We organize qualifying records by state to make
        them easier to compare.
      </p>
      <p>
        While we strive to maintain accurate and current information, conditions at boat ramps can change
        seasonally or due to maintenance. We recommend verifying facility hours, amenities, and accessibility
        directly with facility operators or your state's fish and wildlife agency before your visit.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        What We Cover
      </h2>
      <p>
        This directory includes public boat launch facilities maintained by:</p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>State fish and wildlife departments</li>
        <li>The U.S. Army Corps of Engineers</li>
        <li>National Park Service</li>
        <li>Bureau of Land Management</li>
        <li>Local and county parks departments</li>
        <li>Other publicly-funded water access programs</li>
      </ul>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Disclaimer
      </h2>
      <p>
        The information provided in this directory is for informational purposes only and is based on data
        from public sources. While we make every effort to ensure accuracy, we cannot guarantee that all
        information is current, complete, or error-free. Facility hours, amenities, permit requirements, and
        accessibility may change without notice.
      </p>
      <p>
        Before visiting any boat ramp, we strongly recommend:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>Verifying facility hours and seasonal closures</li>
        <li>Confirming that all amenities are currently available</li>
        <li>Checking for any permits or registration requirements</li>
        <li>Reviewing local regulations and restrictions</li>
        <li>Contacting facility operators directly with specific questions</li>
      </ul>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Safety and Responsibility
      </h2>
      <p>
        Using public boat ramps is the user's responsibility. Always follow posted rules and regulations,
        practice safe boating practices, and obey all applicable laws. Ensure your vessel is properly
        registered and that you have the required permits. Be aware of local fishing regulations and
        seasonal restrictions that may apply to the body of water you're visiting.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Data Sources
      </h2>
      <p>
        The current source collection includes the{' '}
        <a href={USGS_BOAT_RAMPS_URL}>U.S. Geological Survey Boat Ramp Locations dataset</a> (CC0 1.0), the{' '}
        <a href={FWC_INVENTORY_URL}>FWC Florida Boat Ramp Inventory</a>, and{' '}
        <a href={OSM_COPYRIGHT_URL}>OpenStreetMap contributors</a> (ODbL). FWC&apos;s item metadata requests
        acknowledgment of the Florida Fish and Wildlife Conservation Commission, Fish and Wildlife Research
        Institute (FWC-FWRI), preservation of the <a href={FWC_METADATA_URL}>original metadata</a> when the data
        is altered, asks that modified information be shared with FWC, and states that the dataset is not for navigation. The original metadata describes the
        dataset as public domain and prohibits recipients from asserting proprietary rights in it. We preserve
        per-record attribution and do not provide coordinate-based directions for FWC-derived records.
      </p>
      <p>
        For directory display, we filter FWC records to facilities marked open for business and exclude records
        marked for restricted public use. We normalize field names, text casing, slugs, source descriptions, and
        amenity labels. These transformations are ours; the underlying source facts remain FWC-FWRI data and may
        change after the displayed snapshot date. Questions about these transformations can be sent to
        contact@publicboatramps.com.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>
        How We Review and Publish Data
      </h2>
      <p>
        Public Boat Ramps Data Team is an organizational byline, not a claim about a fictional individual.
        We import public records, normalize names and facility fields, and apply a quality gate before a
        listing can be indexed. A record must have a name, coordinates, city, and state plus at least four
        supported fields from this list: source description, ramp type, ramp surface, total lanes, dock,
        restroom, water body, parking surface, hours, and fee status. Records that do not meet that standard
        are excluded from search indexing until their source record supplies enough useful detail.
      </p>
      <p>
        Florida inventory records are attributed to FWC-FWRI; USGS records and OpenStreetMap records retain
        their respective source and license notices. We do not independently inspect every ramp, so current
        conditions must be confirmed with the managing agency.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Get in Touch
      </h2>
      <p>
        Have feedback about our directory? Found an error? Want to suggest a boat ramp for inclusion?
        Contact us at contact@publicboatramps.com. We welcome your input to help us improve the directory.
      </p>
    </article>
  );
}
