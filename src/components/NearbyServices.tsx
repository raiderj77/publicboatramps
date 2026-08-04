import Link from 'next/link';
import { partners, type Partner } from '@/data/partners';

type Props = {
  state: string;
  county?: string | null;
  city?: string | null;
};

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function normalizeCounty(value: string | null | undefined): string {
  return normalize(value).replace(/\s+county$/, '');
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TIERS = new Set<Partner['tier']>(['basic', 'county', 'regional']);

function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isSafeHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function hasValidScope(partner: Partner): boolean {
  if (partner.statewide) return false;
  const countyCount = new Set(partner.counties?.map(normalizeCounty).filter(Boolean) ?? []).size;
  const cityCount = new Set(partner.cities?.map(normalize).filter(Boolean) ?? []).size;

  if (partner.tier === 'county') return countyCount === 1 && cityCount === 0;
  if (partner.tier === 'regional') return countyCount >= 2 && countyCount <= 5 && cityCount === 0;
  return countyCount + cityCount >= 1 && countyCount + cityCount <= 5;
}

function hasValidApproval(partner: Partner): boolean {
  if (partner.approvalStatus !== 'approved' || !isIsoDate(partner.approvedOn)) return false;
  if (partner.tier === 'basic') return partner.billingStatus === 'not-required' && !partner.paymentConfirmedOn;
  return partner.billingStatus === 'active' && Boolean(partner.paymentConfirmedOn && isIsoDate(partner.paymentConfirmedOn));
}

function isValidPartner(partner: Partner): boolean {
  return Boolean(
    partner.id.trim() &&
      partner.name.trim() &&
      partner.description.trim() &&
      partner.state.trim() &&
      typeof partner.statewide === 'boolean' &&
      hasValidScope(partner) &&
      hasValidApproval(partner) &&
      isIsoDate(partner.startsOn) &&
      partner.approvedOn <= partner.startsOn &&
      (!partner.paymentConfirmedOn || partner.paymentConfirmedOn <= partner.startsOn) &&
      (!partner.endsOn || (isIsoDate(partner.endsOn) && partner.endsOn >= partner.startsOn)) &&
      VALID_TIERS.has(partner.tier) &&
      isSafeHttpsUrl(partner.website),
  );
}

function isActive(partner: Partner, today: string): boolean {
  if (partner.startsOn > today) return false;
  if (partner.endsOn && partner.endsOn < today) return false;
  return true;
}

function matchesArea(partner: Partner, state: string, county: string, city: string): boolean {
  if (normalize(partner.state) !== state) return false;

  if (partner.statewide) return true;

  const counties = partner.counties?.map(normalizeCounty) ?? [];
  const cities = partner.cities?.map(normalize) ?? [];
  if (counties.length === 0 && cities.length === 0) return false;

  return Boolean((county && counties.includes(county)) || (city && cities.includes(city)));
}

const tierRank: Record<Partner['tier'], number> = {
  regional: 3,
  county: 2,
  basic: 1,
};

export default function NearbyServices({ state, county, city }: Props) {
  const normalizedState = normalize(state);
  const normalizedCounty = normalizeCounty(county);
  const normalizedCity = normalize(city);
  const today = new Date().toISOString().slice(0, 10);

  const matches = partners
    .filter(isValidPartner)
    .filter((partner) => isActive(partner, today))
    .filter((partner) => matchesArea(partner, normalizedState, normalizedCounty, normalizedCity))
    .sort((a, b) => tierRank[b.tier] - tierRank[a.tier] || a.name.localeCompare(b.name))
    .slice(0, 6);

  const areaLabel = city || county || state;

  if (matches.length === 0 && normalizedState !== 'florida') return null;

  return (
    <section
      aria-labelledby="nearby-services-title"
      style={{
        background: 'var(--cream)',
        borderTop: '1px solid rgba(10,22,40,0.08)',
        padding: '3.5rem 1.5rem',
      }}
    >
      <div className="container" style={{ maxWidth: '960px' }}>
        {matches.length > 0 ? (
          <>
            <p className="section-label">Nearby Marine Services</p>
            <h2 id="nearby-services-title" className="section-title">
              Marine services near {areaLabel}
            </h2>
            <p className="section-sub" style={{ marginBottom: '1.5rem' }}>
              Paid placements are labeled below. Reviewed basic profiles are not paid placements. Neither option affects ramp records, rankings, or source data.
            </p>

            <div className="grid-3">
              {matches.map((partner) => {
                const isPaid = partner.tier !== 'basic';

                return (
                  <article
                    key={partner.id}
                    className="card"
                    style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
                  >
                    <p style={{ margin: 0, color: '#596474', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {isPaid ? 'Paid Advertisement' : 'Reviewed Business Profile'} · {partner.category}
                    </p>
                    <h3 style={{ margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                      {partner.name}
                    </h3>
                    <p style={{ margin: 0, color: '#556', lineHeight: 1.65, flex: 1 }}>{partner.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                      <a
                        href={partner.website}
                        target="_blank"
                        rel={isPaid ? 'sponsored nofollow noopener noreferrer' : 'noopener noreferrer'}
                        className="btn btn-gold"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                      >
                        Visit Business
                      </a>
                      {partner.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          style={{ color: 'var(--navy)', fontWeight: 700 }}
                        >
                          {partner.phone}
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <p style={{ margin: '1.25rem 0 0', color: '#596474', fontSize: '0.85rem' }}>
              <Link href="/advertise" style={{ color: 'var(--navy)', fontWeight: 700 }}>
                Learn about a local partner placement.
              </Link>
            </p>
          </>
        ) : (
          <div
            style={{
              border: '1px solid rgba(201,168,76,0.45)',
              borderRadius: 'var(--radius)',
              background: 'white',
              padding: '1.5rem',
            }}
          >
            <p className="section-label">For Local Marine Businesses</p>
            <h2 id="nearby-services-title" style={{ margin: '0 0 0.6rem', color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
              Reach boaters near {areaLabel}
            </h2>
            <p style={{ margin: '0 0 1rem', color: '#556', lineHeight: 1.7, maxWidth: '760px' }}>
              Founding partner placements are open to boat repair shops, marinas, storage facilities, bait stores,
              guides, charters, rentals, fuel providers, towing services, and waterfront lodging. Paid placements
              are labeled Paid Advertisement and never change the public ramp data.
            </p>
            <Link href="/advertise" className="btn btn-gold">
              View Partner Options
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
