import retiredRampData from '@/data/retired-ramps.json';

export type RetiredRampReason = 'removed-from-source' | 'below-directory-threshold';

export interface RetiredRamp {
  stateSlug: string;
  slug: string;
  name: string;
  reason: RetiredRampReason;
  retiredOn: string;
}

export const retiredRamps = retiredRampData as RetiredRamp[];

export function getRetiredRamp(stateSlug: string, slug: string): RetiredRamp | undefined {
  return retiredRamps.find((ramp) => ramp.stateSlug === stateSlug && ramp.slug === slug);
}
