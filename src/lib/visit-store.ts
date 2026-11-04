// Development counts live in memory and reset on process restart.
const visits = new Map<string, number>();
function headers(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...(process.env.VISIT_COUNTER_API_KEY ? { Authorization: `Bearer ${process.env.VISIT_COUNTER_API_KEY}` } : {}) };
}
async function externalCount(key: string, increment: boolean): Promise<number | null> {
  try {
    const base = process.env.VISIT_COUNTER_API_URL!.replace(/\/$/, '');
    const response = await fetch(increment ? `${base}/increment` : `${base}/count?key=${encodeURIComponent(key)}`, increment ? { method: 'POST', headers: headers(), body: JSON.stringify({ key }), cache: 'no-store' } : { headers: headers(), cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    const count = typeof data === 'number' ? data : data?.count;
    return typeof count === 'number' && Number.isFinite(count) && count >= 0 ? count : null;
  } catch { return null; }
}
export async function getVisitCount(key: string): Promise<number | null> {
  if (process.env.VISIT_COUNTER_API_URL) return externalCount(key, false);
  return process.env.NODE_ENV === 'development' ? visits.get(key) ?? 0 : null;
}
export async function recordVisit(key: string): Promise<number | null> {
  if (process.env.VISIT_COUNTER_API_URL) return externalCount(key, true);
  if (process.env.NODE_ENV !== 'development') return null;
  const count = (visits.get(key) ?? 0) + 1;
  visits.set(key, count);
  return count;
}
