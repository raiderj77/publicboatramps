import { NextResponse } from 'next/server';
import { getClaimTokenSecret, verifyClaimToken } from '@/lib/claim-token';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const secret = getClaimTokenSecret();
  if (!secret) return NextResponse.json({ error: 'claim-email-not-configured' }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'malformed' }, { status: 400 }); }
  if (!body || typeof body.token !== 'string') return NextResponse.json({ error: 'malformed' }, { status: 400 });
  const result = verifyClaimToken(body.token, secret);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });
  return NextResponse.json({ ok: true, businessName: result.businessName, status: 'verified-pending-review' });
}
