export const CREATOR_REVENUE_URL = 'https://creatorrevenuecalculator.com';

export function creatorRevenueRel(pathname) {
  return pathname === '/'
    ? 'noopener noreferrer'
    : 'nofollow noopener noreferrer';
}
