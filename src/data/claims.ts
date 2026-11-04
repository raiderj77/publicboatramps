import type { PartnerCategory } from './partners';

export const CLAIM_CATEGORIES = [
  'Bait and tackle', 'Boat rental', 'Boat repair', 'Fishing guide or charter',
  'Marina and storage', 'Marine fuel', 'Marine towing', 'Waterfront lodging or campground',
] as const satisfies readonly PartnerCategory[];
export type Claim = { partnerId: string; businessName: string; claimedOn: string; status: 'verified' };
// Verified claims are added only after the email token flow succeeds AND manual
// review approves; claimant emails are never stored in this file.
export const claims: Claim[] = [];
export const getClaimByPartnerId = (id: string) => claims.find(c => c.partnerId === id);
export const isPartnerClaimed = (id: string) => Boolean(getClaimByPartnerId(id));
