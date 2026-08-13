'use client';

import { usePathname } from 'next/navigation';
import type { AnchorHTMLAttributes } from 'react';
import { CREATOR_REVENUE_URL, creatorRevenueRel } from '@/lib/creator-link-rel.mjs';

type CreatorRevenueLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'rel'>;

export default function CreatorRevenueLink(props: CreatorRevenueLinkProps) {
  const pathname = usePathname();

  return (
    <a
      {...props}
      href={CREATOR_REVENUE_URL}
      rel={creatorRevenueRel(pathname)}
    />
  );
}
