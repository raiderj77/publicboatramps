import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle, getAllSlugs } from '@/lib/editorial';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { robots: { index: false, follow: false } };

  return {
    title: article.title,
    description: article.description,
    keywords: [article.primaryKeyword, ...article.tags].join(', '),
    alternates: { canonical: `https://publicboatramps.com/editorial/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://publicboatramps.com/editorial/${slug}`,
      type: 'article',
      publishedTime: article.datePublished,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: 'https://publicboatramps.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Public Boat Ramps Editorial Team',
      url: 'https://publicboatramps.com',
    },
    datePublished: article.datePublished,
    dateModified: article.datePublished,
    mainEntityOfPage: `https://publicboatramps.com/editorial/${slug}`,
    keywords: article.tags.join(', '),
  };

  const dateDisplay = new Date(article.datePublished + 'T12:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        <nav style={{ fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'var(--ocean)' }}>Home</a>
          {' › '}
          <a href="/editorial" style={{ color: 'var(--ocean)' }}>Editorial</a>
          {' › '}
          <span>{article.title}</span>
        </nav>

        <header style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--gold)', paddingBottom: '2rem' }}>
          {article.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {article.tags.map(tag => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          )}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
            lineHeight: 1.2,
            color: 'var(--navy)',
            marginBottom: '1.25rem',
          }}>
            {article.title}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#556', lineHeight: 1.65, marginBottom: '1.25rem' }}>
            {article.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', fontSize: '0.875rem', color: 'var(--gray)' }}>
            <span>By {article.author}</span>
            <span>
              Published{' '}
              <time dateTime={article.datePublished}>{dateDisplay}</time>
            </span>
          </div>
        </header>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        <aside style={{
          marginTop: '3.5rem',
          padding: '1.75rem 2rem',
          background: 'var(--gold-pale)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(201,168,76,0.35)',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: 'var(--navy)',
            fontSize: '1.1rem',
            marginBottom: '0.5rem',
          }}>
            Find a ramp near you
          </p>
          <p style={{ color: '#445', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            Browse all 1,585 free Florida boat ramps in the full directory, searchable by county and water body.
          </p>
          <a href="/florida" className="btn btn-gold" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}>
            Browse Florida Ramps
          </a>
        </aside>

      </article>
    </>
  );
}
