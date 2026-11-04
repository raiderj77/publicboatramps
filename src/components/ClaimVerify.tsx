'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClaimManualFallback from './ClaimManualFallback';

export default function ClaimVerify() {
  const token = useSearchParams().get('token');
  const started = useRef<string | null>(null);
  const [result, setResult] = useState({ status: 'verifying', businessName: '' });
  useEffect(() => {
    if (!token) { setResult({ status: 'invalid', businessName: '' }); return; }
    if (started.current === token) return;
    started.current = token;
    setResult({ status: 'verifying', businessName: '' });
    async function verify() {
      try {
        const response = await fetch('/api/claim/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (started.current !== token) return;
        setResult({ status: response.ok && data.ok ? 'verified' : data.error === 'expired' ? 'expired' : data.error === 'claim-email-not-configured' ? 'not-configured' : 'invalid', businessName: response.ok ? data.businessName : '' });
      } catch { if (started.current === token) setResult({ status: 'invalid', businessName: '' }); }
    }
    void verify();
  }, [token]);
  return <div role="status">
    {result.status === 'verifying' && <p>Verifying your email...</p>}
    {result.status === 'verified' && <><h2>{result.businessName}</h2><p>Your email is verified; your free profile is in the manual review queue; nothing is public yet.</p></>}
    {result.status === 'not-configured' && <ClaimManualFallback />}
    {(result.status === 'expired' || result.status === 'invalid') && <p>{result.status === 'expired' ? 'This verification link has expired.' : 'This verification link is invalid or could not be checked.'} <Link href="/claim">Send a new claim</Link>.</p>}
  </div>;
}
