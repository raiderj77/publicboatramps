import { NextResponse } from 'next/server';
import { getVisitCount, recordVisit } from '@/lib/visit-store';

export const runtime = 'nodejs';
const validKey = (key: unknown): key is string => typeof key === 'string' && /^[a-z0-9:_-]{1,80}$/i.test(key);
const invalid = () => NextResponse.json({ error: 'invalid-key' }, { status: 400 });
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key');
  if (!validKey(key)) return invalid();
  return NextResponse.json({ count: await getVisitCount(key) }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return invalid(); }
  if (!body || !validKey(body.key)) return invalid();
  return NextResponse.json({ count: await recordVisit(body.key) }, { headers: { 'Cache-Control': 'no-store' } });
}
