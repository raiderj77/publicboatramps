import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial | Public Boat Ramps',
  description: 'In-depth guides, safety tips, and expert content about public boat ramps, launches, and water access across the USA.',
  robots: { index: true, follow: true },
};

export default function EditorialPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Editorial Content</h1>
      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#666' }}>
        In-depth guides, safety information, and expert content about public boat ramps
        and water access points are coming soon. Our editorial team is developing comprehensive
        resources to help boaters, anglers, and kayakers plan safe, enjoyable outings.
      </p>
      <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#888', marginTop: '1.5rem' }}>
        In the meantime, explore our{' '}
        <a href="/" style={{ color: 'var(--gold, #b8860b)', textDecoration: 'underline' }}>
          boat ramp directory
        </a>{' '}
        to find public launches near you.
      </p>
    </main>
  );
}
