import type { Metadata } from 'next';
import Link from 'next/link';
import ClaimForm from '@/components/ClaimForm';

export const metadata: Metadata = { title: 'Claim Your Free Business Profile | Public Boat Ramps', alternates: { canonical: 'https://publicboatramps.com/claim' } };
export default function ClaimPage() {
  return <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '960px' }}>
    <p className="section-label">For Local Marine Businesses</p>
    <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Claim your free business profile</h1>
    <p>A claimed profile is the free <Link href="/advertise">Basic profile</Link>, confirmed as run by your business.</p>
    <ol><li>Send your claim using the form below.</li><li>Click the email verification link within 48 hours.</li><li>After manual review approves your claim, your profile shows a Claimed badge.</li></ol>
    <p>No password is needed. Your email is never displayed publicly. Claiming never changes ramp data or rankings. Paid County and Regional tiers are unchanged.</p>
    <section style={{ marginTop: '2rem' }}><h2 className="section-title">Send your claim</h2><ClaimForm /></section>
  </div>;
}
