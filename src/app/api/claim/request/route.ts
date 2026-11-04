import { NextResponse } from 'next/server';
import { CLAIM_CATEGORIES } from '@/data/claims';
import { createClaimToken, getClaimTokenSecret } from '@/lib/claim-token';
import { sendClaimVerificationEmail } from '@/lib/claim-mailer';

export const runtime = 'nodejs';
const invalid = (field: string) => NextResponse.json({ error: 'invalid-input', field }, { status: 400 });
export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return invalid('body'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return invalid('body');
  const { businessName, email, website, category, serviceArea } = body;
  const validLength = (value: unknown, min: number, max: number) => typeof value === 'string' && value.trim().length >= min && value.length <= max;
  if (!validLength(businessName, 2, 120)) return invalid('businessName');
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid('email');
  if (!CLAIM_CATEGORIES.includes(category)) return invalid('category');
  if (!validLength(serviceArea, 2, 200)) return invalid('serviceArea');
  if (website !== undefined && website !== '') {
    try { if (typeof website !== 'string' || new URL(website).protocol !== 'https:') return invalid('website'); }
    catch { return invalid('website'); }
  }
  const secret = getClaimTokenSecret();
  if (!secret) return NextResponse.json({ error: 'claim-email-not-configured' }, { status: 503 });
  const token = createClaimToken({ email, businessName: businessName.trim() }, secret);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
  const result = await sendClaimVerificationEmail({ to: email, businessName: businessName.trim(), verifyUrl: `${origin}/claim/verify?token=${token}` });
  if (!result.sent) return NextResponse.json({ error: result.reason === 'not-configured' ? 'claim-email-not-configured' : 'claim-email-failed' }, { status: result.reason === 'not-configured' ? 503 : 502 });
  return NextResponse.json({ ok: true });
}
