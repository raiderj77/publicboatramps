import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
export function createClaimToken({ email, businessName }: { email: string; businessName: string }, secret: string): string {
  const iat = Date.now();
  const payload = JSON.stringify({ email, businessName, iat, exp: iat + TOKEN_TTL_MS, nonce: randomUUID() });
  return `${Buffer.from(payload).toString('base64url')}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
type Result = { ok: true; email: string; businessName: string } | { ok: false; reason: 'malformed' | 'bad-signature' | 'expired' };
export function verifyClaimToken(token: string, secret: string, now = Date.now()): Result {
  try {
    const parts = token.split('.');
    if (parts.length !== 2 || parts.some(p => !/^[A-Za-z0-9_-]+$/.test(p))) return { ok: false, reason: 'malformed' };
    const payload = Buffer.from(parts[0], 'base64url').toString('utf8');
    const signature = Buffer.from(parts[1], 'base64url');
    const expected = createHmac('sha256', secret).update(payload).digest();
    if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return { ok: false, reason: 'bad-signature' };
    const data = JSON.parse(payload);
    if (!data || typeof data.email !== 'string' || typeof data.businessName !== 'string' || typeof data.iat !== 'number' || !Number.isFinite(data.iat) || typeof data.exp !== 'number' || !Number.isFinite(data.exp) || typeof data.nonce !== 'string' || data.exp <= data.iat) return { ok: false, reason: 'malformed' };
    if (data.exp <= now) return { ok: false, reason: 'expired' };
    return { ok: true, email: data.email, businessName: data.businessName };
  } catch { return { ok: false, reason: 'malformed' }; }
}
export function getClaimTokenSecret(): string | null {
  const secret = process.env.CLAIM_TOKEN_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}
