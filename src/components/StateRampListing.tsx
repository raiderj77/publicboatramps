'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

export interface RampRow {
  slug: string;
  name: string;
  city: string | null;
  county: string | null;
  totalLanes: number | null;
  rampSurface: string | null;
  accessibilityLevel: string | null;
  isFeeRequired: string | null;
  isRestroomAccessible: string | null;
  stateSlug: string;
}

function isAda(r: RampRow): boolean {
  const al = r.accessibilityLevel ?? '';
  return al.includes('High Level') || al.includes('Moderate Level') ||
    al.includes('Fully') || al.includes('Partially') ||
    r.isRestroomAccessible === 'Yes';
}

const PAGE_SIZE = 24;

export default function StateRampListing({ ramps, stateSlug }: { ramps: RampRow[]; stateSlug: string }) {
  const [query, setQuery]       = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [adaOnly, setAdaOnly]   = useState(false);
  const [page, setPage]         = useState(0);

  useEffect(() => { setPage(0); }, [query, freeOnly, adaOnly]);

  const filtered = useMemo(() => {
    let r = ramps;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(x => x.name.toLowerCase().includes(q) || (x.city?.toLowerCase().includes(q) ?? false));
    }
    if (freeOnly) r = r.filter(x => x.isFeeRequired === 'No');
    if (adaOnly)  r = r.filter(isAda);
    return r;
  }, [ramps, query, freeOnly, adaOnly]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRamps  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
        marginBottom: '1.5rem', alignItems: 'center',
      }}>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or city..."
          style={{
            flex: '1 1 220px', padding: '0.65rem 1rem',
            border: '1.5px solid rgba(10,22,40,0.15)', borderRadius: '6px',
            fontFamily: 'var(--font-body)', fontSize: '0.95rem',
            color: 'var(--navy)', background: 'var(--white)', outline: 'none',
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
          <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--gold)' }} />
          No launch fee recorded
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
          <input type="checkbox" checked={adaOnly} onChange={e => setAdaOnly(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--gold)' }} />
          Accessibility recorded
        </label>
        <span style={{ fontSize: '0.82rem', color: 'var(--gray)', marginLeft: 'auto' }}>
          {filtered.length.toLocaleString()} ramp{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Ramp rows */}
      {pageRamps.length === 0 ? (
        <p style={{ color: 'var(--gray)', padding: '2rem 0', textAlign: 'center' }}>No ramps match your filters.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {pageRamps.map(r => (
            <Link
              key={r.slug}
              href={`/${stateSlug}/${r.slug}`}
              style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                gap: '0.5rem', padding: '0.75rem 1rem',
                background: 'var(--white)', borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(10,22,40,0.07)',
                textDecoration: 'none',
                transition: 'box-shadow 0.15s, transform 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: '0.9rem', color: 'var(--navy)', flex: '1 1 200px',
              }}>
                {r.name}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)', flex: '0 1 180px' }}>
                {[r.city, r.county].filter(Boolean).join(', ')}
              </span>
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', flex: '0 0 auto' }}>
                {r.totalLanes && r.totalLanes > 0 && (
                  <span className="chip chip-navy" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                    {r.totalLanes} {r.totalLanes === 1 ? 'lane' : 'lanes'}
                  </span>
                )}
                {r.rampSurface && r.rampSurface !== 'Unknown' && (
                  <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                    {r.rampSurface}
                  </span>
                )}
                {r.isFeeRequired === 'No' && (
                  <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: 'rgba(42,138,120,0.12)', color: 'var(--seafoam)', borderColor: 'rgba(42,138,120,0.3)' }}>
                    No launch fee recorded
                  </span>
                )}
                {isAda(r) && (
                  <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: 'rgba(26,92,138,0.1)', color: 'var(--ocean)', borderColor: 'rgba(26,92,138,0.25)' }}>
                    Accessibility feature recorded
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '0.75rem', marginTop: '1.5rem',
        }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: '1.5px solid rgba(10,22,40,0.2)',
              background: page === 0 ? '#f0f0f0' : 'var(--white)', cursor: page === 0 ? 'default' : 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: page === 0 ? 'var(--gray)' : 'var(--navy)',
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: '1.5px solid rgba(10,22,40,0.2)',
              background: page >= totalPages - 1 ? '#f0f0f0' : 'var(--white)', cursor: page >= totalPages - 1 ? 'default' : 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: page >= totalPages - 1 ? 'var(--gray)' : 'var(--navy)',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
