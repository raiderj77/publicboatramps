import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Public Boat Ramps Directory and our mission to help people find free water access.',
};

export default function AboutPage() {
  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#003d99' }}>
        About Public Boat Ramps Directory
      </h1>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        Our Mission
      </h2>
      <p>
        Public Boat Ramps Directory is dedicated to helping boaters, fishers, and water enthusiasts discover
        free and affordable public access to America's waterways. We believe that everyone should have the
        opportunity to enjoy our nation's lakes, rivers, and coastal waters, regardless of their financial
        situation. Our mission is to compile a comprehensive, easy-to-use directory of public boat ramps
        across the United States.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#003d99' }}>
        How the Directory Works
      </h2>
      <p>
        Our directory consolidates information about public boat ramps from federal, state, and local
        government agencies. Each listing includes essential details such as location, address, amenities,
        GPS coordinates, and facility descriptions. We organize information by state to make it easy for you
        to find ramps near your destination.
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
        Information in this directory is compiled from publicly available sources, including state fish and
        wildlife agency websites, federal agency databases, and local government resources. We update our
        listings regularly, but recommend verifying critical details directly with facility operators.
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
