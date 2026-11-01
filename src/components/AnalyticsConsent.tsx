'use client';

import { useEffect, useState } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const STORAGE_KEY = 'publicboatramps:analytics-consent';
const SCRIPT_ID = 'google-analytics-script';

type ConsentChoice = 'granted' | 'denied';
type GtagArguments = [command: string, action: string | Date, params?: Record<string, unknown>];
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: GtagArguments) => void;
};

function analyticsWindow(): AnalyticsWindow {
  return window as AnalyticsWindow;
}

function initializeConsentMode() {
  const currentWindow = analyticsWindow();
  currentWindow.dataLayer = currentWindow.dataLayer || [];
  currentWindow.gtag =
    currentWindow.gtag ||
    ((...args: GtagArguments) => {
      currentWindow.dataLayer?.push(args);
    });

  currentWindow.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  });
}

function updateAnalyticsConsent(choice: ConsentChoice) {
  analyticsWindow().gtag?.('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: choice,
  });
}

function readSavedChoice(): ConsentChoice | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    return null;
  }
}

function hasPrivacySignal() {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true ||
    navigator.doNotTrack === '1';
}

function loadGoogleAnalytics() {
  const measurementId = GA_MEASUREMENT_ID?.trim();
  if (!measurementId) return;
  if (hasPrivacySignal()) return;
  const currentWindow = analyticsWindow();
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  currentWindow.gtag?.('js', new Date());
  currentWindow.gtag?.('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

function clearAnalyticsCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (name === '_ga' || name?.startsWith('_ga_')) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.publicboatramps.com; SameSite=Lax`;
    }
  });
}

export default function AnalyticsConsent() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID?.trim()) return;
    initializeConsentMode();
    const initialChoice = hasPrivacySignal() ? 'denied' : readSavedChoice();
    setChoice(initialChoice);
    if (initialChoice === 'granted') {
      updateAnalyticsConsent('granted');
      loadGoogleAnalytics();
    } else if (initialChoice === 'denied') {
      updateAnalyticsConsent('denied');
      clearAnalyticsCookies();
    } else {
      setShowChoices(true);
    }
  }, []);

  const saveChoice = (requestedChoice: ConsentChoice) => {
    const nextChoice = hasPrivacySignal() ? 'denied' : requestedChoice;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextChoice);
    } catch {
      // Consent remains effective for this page if storage is unavailable.
    }
    setChoice(nextChoice);
    setShowChoices(false);
    updateAnalyticsConsent(nextChoice);
    if (nextChoice === 'granted') {
      loadGoogleAnalytics();
    } else {
      clearAnalyticsCookies();
      if (choice === 'granted') window.location.reload();
    }
  };

  if (!GA_MEASUREMENT_ID?.trim()) return null;

  const buttonStyle = {
    minHeight: '44px', padding: '0.6rem 1rem', borderRadius: '999px',
    border: '1px solid var(--gold)', background: 'var(--navy)',
    color: 'var(--gold)', cursor: 'pointer', fontWeight: 600,
  };

  return (
    <>
      <button
        type="button"
        style={{ ...buttonStyle, position: 'fixed', bottom: '12px', left: '12px', zIndex: 1001 }}
        onClick={() => setShowChoices(true)}
        aria-label={`Privacy choices. Analytics is currently ${choice || 'not selected'}.`}
      >
        Privacy choices
      </button>
      {showChoices && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="analytics-choice-heading"
          style={{
            position: 'fixed', bottom: '72px', left: '12px', right: '12px',
            zIndex: 1002, maxWidth: '720px', margin: '0 auto', padding: '1.5rem',
            maxHeight: 'calc(100dvh - 96px)', overflowY: 'auto',
            background: 'var(--navy)', color: '#e4ebf4', border: '1px solid var(--gold)',
            borderRadius: '12px', boxShadow: '0 8px 32px rgba(10,22,40,0.4)',
          }}
        >
          <h2 id="analytics-choice-heading" style={{ color: 'var(--gold)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Your analytics choice
          </h2>
          <p style={{ lineHeight: 1.7 }}>
            We use Google Analytics only if you accept. It helps us count page views and see
            which pages are useful. Advertising and personalization stay off.
            Declining does not limit the site.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
            <button type="button" style={{ ...buttonStyle, background: 'var(--gold)', color: 'var(--navy)' }} onClick={() => saveChoice('granted')}>
              Accept analytics
            </button>
            <button type="button" style={buttonStyle} onClick={() => saveChoice('denied')}>
              Decline analytics
            </button>
            <a href="/privacy" style={{ color: 'var(--gold)', padding: '0.6rem', textDecoration: 'underline' }}>
              Privacy details
            </a>
          </div>
        </section>
      )}
    </>
  );
}
