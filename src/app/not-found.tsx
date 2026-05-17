import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h1>
      <p style={{ color: '#555', marginBottom: '2rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" style={{ color: '#0066cc', textDecoration: 'underline' }}>
        Return to homepage
      </Link>
    </div>
  );
}
