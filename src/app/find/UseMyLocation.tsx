'use client';

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  defaultRadius?: number;
};

const ALLOWED_RADII = [25, 50, 100, 250];

export default function UseMyLocation({ defaultRadius = 50 }: Props) {
  const router = useRouter();
  const initialRadius = ALLOWED_RADII.includes(defaultRadius) ? defaultRadius : 50;
  const [radius, setRadius] = useState(initialRadius);
  const [status, setStatus] = useState('');

  function findNearby() {
    if (!navigator.geolocation) {
      setStatus('Location search is not supported by this browser.');
      return;
    }

    setStatus('Requesting location permission...');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const params = new URLSearchParams(window.location.search);
        params.set('lat', coords.latitude.toFixed(2));
        params.set('lng', coords.longitude.toFixed(2));
        params.set('radius', String(radius));
        router.push(`/find?${params.toString()}`);
      },
      () => {
        setStatus('Location was not available. Search by city, county, ZIP code, or water body instead.');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1rem',
        border: '1px solid rgba(10,22,40,0.12)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--cream)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontWeight: 700, color: 'var(--navy)' }}>
          Search radius
          <select
            value={radius}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setRadius(Number(event.target.value))}
            style={{
              minHeight: '48px',
              border: '1px solid rgba(10,22,40,0.25)',
              borderRadius: '6px',
              padding: '0.6rem 0.75rem',
              background: 'white',
              font: 'inherit',
            }}
          >
            <option value={25}>25 miles</option>
            <option value={50}>50 miles</option>
            <option value={100}>100 miles</option>
            <option value={250}>250 miles</option>
          </select>
        </label>

        <button
          type="button"
          onClick={findNearby}
          className="btn btn-gold"
          style={{ minHeight: '48px', border: 0, cursor: 'pointer' }}
        >
          Use My Location
        </button>
      </div>

      <p style={{ margin: '0.75rem 0 0', color: '#596474', fontSize: '0.85rem', lineHeight: 1.6 }}>
        Your browser asks for permission. The finder rounds latitude and longitude to two decimal places before
        adding them to the search URL. The rounded values may appear in your browser history and routine request logs.
      </p>
      <p aria-live="polite" style={{ margin: status ? '0.6rem 0 0' : 0, color: '#596474', fontSize: '0.85rem' }}>
        {status}
      </p>
    </div>
  );
}
