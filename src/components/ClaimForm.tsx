'use client';

import { useState, type FormEvent, type CSSProperties } from 'react';
import { CLAIM_CATEGORIES } from '@/data/claims';
import ClaimManualFallback from './ClaimManualFallback';

const fieldStyle: CSSProperties = { display: 'block', width: '100%', padding: '0.75rem', margin: '0.4rem 0 1.25rem', border: '1px solid #8893a2', borderRadius: 'var(--radius)', font: 'inherit' };
export default function ClaimForm() {
  const [fields, setFields] = useState({ businessName: '', email: '', website: '', category: '', serviceArea: '' });
  const [status, setStatus] = useState('idle');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const response = await fetch('/api/claim/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      const data = await response.json();
      setStatus(response.ok && data.ok ? 'success' : data.error === 'claim-email-not-configured' ? 'not-configured' : 'error');
    } catch { setStatus('error'); }
  }
  if (status === 'success') return <div role="status"><h2>Check your email</h2><p>A verification link is on its way. It expires in 48 hours. Your address is only used for verification and is never shown on the site.</p></div>;
  return <form onSubmit={submit} style={{ maxWidth: '640px' }}>
    {([['businessName', 'Business name', 'text', 120], ['email', 'Contact email', 'email', 254], ['website', 'Website (optional)', 'url', undefined], ['serviceArea', 'Service area', 'text', 200]] as const).map(([key, label, type, maxLength]) => <label key={key} htmlFor={`claim-${key}`}>{label}<input id={`claim-${key}`} name={key} type={type} value={fields[key]} onChange={e => setFields({ ...fields, [key]: e.target.value })} required={key !== 'website'} minLength={key === 'businessName' || key === 'serviceArea' ? 2 : undefined} maxLength={maxLength} pattern={key === 'website' ? 'https://.*' : undefined} style={fieldStyle} /></label>)}
    <label htmlFor="claim-category">Service category<select id="claim-category" name="category" required value={fields.category} onChange={e => setFields({ ...fields, category: e.target.value })} style={fieldStyle}><option value="">Select a category</option>{CLAIM_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
    <button className="btn btn-gold" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send claim'}</button>
    <div aria-live="polite">{status === 'not-configured' && <ClaimManualFallback {...fields} />}{status === 'error' && <p>We could not send your claim. Please check your details and try again.</p>}</div>
  </form>;
}
