'use client';

import { useEffect, useRef, useState } from 'react';
export default function ProfileVisitCount({ profileKey }: { profileKey: string }) {
  const [count, setCount] = useState<number | null>(null);
  const started = useRef<string | null>(null);
  useEffect(() => {
    if (started.current === profileKey) return;
    started.current = profileKey;
    setCount(null);
    async function load() {
      try {
        const flag = `profile-view:${profileKey}`;
        if (!sessionStorage.getItem(flag)) {
          const response = await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: profileKey }) });
          if (response.ok) sessionStorage.setItem(flag, '1');
        }
        const response = await fetch(`/api/visits?key=${encodeURIComponent(profileKey)}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (started.current === profileKey && typeof data.count === 'number' && Number.isFinite(data.count)) setCount(data.count);
      } catch { /* Storage and counter failures must never break a profile. */ }
    }
    void load();
  }, [profileKey]);
  return typeof count === 'number' ? <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray)' }}>{count} profile views</p> : null;
}
