type Delivery = { sent: true } | { sent: false; reason: 'not-configured' | 'provider-error' };
export async function sendClaimVerificationEmail({ to, businessName, verifyUrl }: { to: string; businessName: string; verifyUrl: string }): Promise<Delivery> {
  const url = process.env.CLAIM_EMAIL_WEBHOOK_URL;
  if (!url) return { sent: false, reason: 'not-configured' };
  try {
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.CLAIM_EMAIL_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.CLAIM_EMAIL_WEBHOOK_TOKEN}` } : {}) },
      body: JSON.stringify({ to, businessName, verifyUrl, subject: 'Verify your Public Boat Ramps business claim' }),
    });
    return response.ok ? { sent: true } : { sent: false, reason: 'provider-error' };
  } catch { return { sent: false, reason: 'provider-error' }; }
}
