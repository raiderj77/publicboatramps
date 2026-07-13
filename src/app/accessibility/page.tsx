import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Accessibility statement and contact process for Public Boat Ramps Directory.',
  alternates: { canonical: 'https://publicboatramps.com/accessibility' },
};

const heading = { fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.5rem', color: 'var(--navy)' };

export default function AccessibilityPage() {
  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 5rem', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--navy)' }}>Accessibility</h1>
      <p><strong>Last updated: July 13, 2026</strong></p>

      <p style={{ marginTop: '1rem' }}>
        Public Boat Ramps Directory aims to make its website usable by as many people as possible, including
        people who use keyboards, screen readers, zoom, voice input, or other assistive technology.
      </p>

      <h2 style={heading}>What we support</h2>
      <ul style={{ paddingLeft: '1.5rem' }}>
        <li>Keyboard-accessible navigation and visible focus indicators</li>
        <li>Semantic headings, landmarks, lists, tables, and link text</li>
        <li>Responsive layouts that work with mobile screens and browser zoom</li>
        <li>Text and controls designed for readable color contrast</li>
        <li>Text alternatives or decorative treatment for meaningful and decorative graphics</li>
      </ul>

      <h2 style={heading}>Directory data limitations</h2>
      <p>
        A ramp&apos;s recorded accessibility level describes source-agency data; it is not our independent ADA
        certification. Conditions, docks, paths, restrooms, water levels, and parking can change. Confirm
        the features you need with the managing agency before traveling.
      </p>

      <h2 style={heading}>Report a barrier</h2>
      <p>
        If you cannot access part of the site, email accessibility@publicboatramps.com with the page address,
        what you were trying to do, and the browser or assistive technology you used. We will review the
        report and work to provide the information in an accessible format where practical.
      </p>
    </article>
  );
}
