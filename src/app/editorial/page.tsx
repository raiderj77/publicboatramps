import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Editorial Guides | Public Boat Ramps',
  description: 'In-depth guides to Florida boat ramps, free public launches, ADA-accessible facilities, and waterway access points from the Public Boat Ramps editorial team.',
  alternates: { canonical: 'https://publicboatramps.com/editorial' },
  robots: { index: true, follow: true },
};

export default function EditorialIndexPage() {
  const articles = getAllArticles();

  return (
    <main style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

      <header style={{ marginBottom: '3rem', borderBottom: '2px solid var(--gold)', paddingBottom: '2rem' }}>
        <p className="section-label">Editorial</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
          color: 'var(--navy)',
          lineHeight: 1.2,
          marginBottom: '0.75rem',
        }}>
          Guides and Reference Articles
        </h1>
        <p style={{ color: 'var(--gray)', fontSize: '1.05rem', lineHeight: 1.65, maxWidth: '580px' }}>
          In-depth guides to Florida boat ramps, free public launches, and waterway access,
          sourced from the FWC Florida Boat Ramp Inventory.
        </p>
      </header>

      {articles.length === 0 ? (
        <p style={{ color: 'var(--gray)', fontSize: '1rem' }}>No articles published yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {articles.map(article => {
            const dateDisplay = new Date(article.datePublished + 'T12:00:00Z').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <li key={article.slug} style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-card)',
                padding: '1.75rem 2rem',
                borderLeft: '4px solid var(--gold)',
                transition: 'box-shadow 0.2s',
              }}>
                {article.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {article.tags.map(tag => (
                      <span key={tag} className="chip" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--navy)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  <a href={`/editorial/${article.slug}`} style={{ color: 'var(--navy)', textDecoration: 'none' }}>
                    {article.title}
                  </a>
                </h2>
                <p style={{ color: '#556', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {article.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--gray)' }}>
                    {article.author} &middot; <time dateTime={article.datePublished}>{dateDisplay}</time>
                  </span>
                  <a
                    href={`/editorial/${article.slug}`}
                    style={{
                      color: 'var(--ocean)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Read guide &rarr;
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}

    </main>
  );
}
