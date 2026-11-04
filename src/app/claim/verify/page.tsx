import type { Metadata } from 'next';
import { Suspense } from 'react';
import ClaimVerify from '@/components/ClaimVerify';

export const metadata: Metadata = { title: 'Verify Your Business Claim', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function VerifyPage() {
  return <div className="container" style={{ padding: '4rem 1.5rem' }}><h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Verify your business claim</h1><Suspense fallback={<p>Verifying your email...</p>}><ClaimVerify /></Suspense></div>;
}
