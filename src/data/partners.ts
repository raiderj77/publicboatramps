export type PartnerCategory =
  | 'Bait and tackle'
  | 'Boat rental'
  | 'Boat repair'
  | 'Fishing guide or charter'
  | 'Marina and storage'
  | 'Marine fuel'
  | 'Marine towing'
  | 'Waterfront lodging or campground';

export type PartnerTier = 'basic' | 'county' | 'regional';

export type Partner = {
  id: string;
  name: string;
  category: PartnerCategory;
  description: string;
  state: string;
  statewide: boolean;
  counties?: string[];
  cities?: string[];
  website: string;
  phone?: string;
  tier: PartnerTier;
  startsOn: string;
  endsOn?: string;
};

/**
 * Paid and free business profiles are added only after manual review.
 * Do not add invented, scraped, or unconfirmed businesses.
 */
export const partners: Partner[] = [];
