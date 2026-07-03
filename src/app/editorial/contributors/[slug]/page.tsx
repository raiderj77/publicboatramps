import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArticles } from '@/lib/editorial';

const BASE = 'https://publicboatramps.com';

const CONTRIBUTORS: Record<string, {
  name: string;
  role: string;
  tagline: string;
  bio: string[];
  principles: string[];
  knowsAbout: string[];
}> = {
  'marcus-whitfield': {
    name: 'Marcus Whitfield',
    role: 'Florida Boating Editor',
    tagline: 'Covering public water access, boat ramp infrastructure, and waterway-by-waterway analysis for boaters and anglers across Florida.',
    bio: [
      'Marcus Whitfield covers public boat ramp access and waterway infrastructure across Florida, with a focus on data accuracy and practical information for boaters and anglers.',
      'His editorial work is grounded in primary agency datasets ,  specifically the Florida Fish and Wildlife Conservation Commission\'s Boat Ramp Inventory, which documents facility conditions, surface types, lane counts, accessibility levels, and fee status for public launch sites statewide. Rather than relying on secondhand reporting or promotional materials, Marcus cross-references these datasets to verify ramp status, access conditions, and facility features before publishing.',
      'Over his coverage of Florida waterways, Marcus has developed a systematic approach to organizing ramp information by water body ,  recognizing that most boaters plan trips around specific lakes, rivers, bays, or coastal systems rather than county boundaries. His guides break down access infrastructure by hydrologic unit, drawing on the same water body classifications used by state and federal agencies.',
      'Marcus writes for recreational boaters, anglers, kayakers, and anyone navigating Florida\'s public water access system. His approach prioritizes information that\'s current, verifiable, and directly useful for trip planning: ramp condition, fee status, hours, surface type, trailer parking capacity, and accessibility accommodations. He includes explicit guidance to verify access before launching, given that water levels, maintenance closures, and seasonal restrictions can affect availability at any time.',
    ],
    principles: [
      'Every factual claim in these articles is traceable to a primary source ,  primarily the FWC Florida Boat Ramp Inventory, updated on an ongoing basis by the Florida Fish and Wildlife Conservation Commission. Fee status, lane counts, surface types, and accessibility ratings reflect FWC\'s documented data at the time of publication.',
      'Water body groupings reflect actual hydrologic classifications rather than editorial convenience. When FWC\'s data uses a combined classification (for example, a river-reservoir system named as a single unit), that classification is preserved in the article structure.',
      'Accessibility coverage uses FWC\'s four-tier system as documented in the inventory: High Level of Accessibility, Moderate Level of Accessibility, Low Level of Accessibility, and No Accommodations. These are FWC\'s own designations and do not represent legal determinations or ADA compliance certifications.',
      'All articles include a verification notice directing readers to confirm current access conditions with the managing agency before launching.',
    ],
    knowsAbout: [
      'public boat ramp access',
      'Florida waterways',
      'boat ramp infrastructure',
      'FWC Boat Ramp Inventory',
      'ADA accessibility at boat ramps',
      'Florida fishing and boating access',
    ],
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [{ slug: 'marcus-whitfield' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const contributor = CONTRIBUTORS[slug];
  if (!contributor) return { robots: { index: false, follow: false } };

  return {
    title: `${contributor.name} - ${contributor.role} | Public Boat Ramps`,
    description: contributor.tagline,
    alternates: { canonical: `${BASE}/editorial/contributors/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function ContributorPage({ params }: Props) {
  const { slug } = await params;
  const contributor = CONTRIBUTORS[slug];
  if (!contributor) notFound();

  const articles = getAllArticles().filter(a => a.author.includes(contributor.name));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: contributor.name,
    jobTitle: contributor.role,
    description: contributor.tagline,
    url: `${BASE}/editorial/contributors/${slug}`,
    knowsAbout: contributor.knowsAbout,
    worksFor: {
      '@type': 'Organization',
      name: 'Public Boat Ramps Editorial Team',
      url: BASE,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        <nav style={{ fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'var(--ocean)' }}>Home</a>
          {' › '}
          <a href="/editorial" style={{ color: 'var(--ocean)' }}>Editorial</a>
          {' › '}
          <span>Contributors</span>
          {' › '}
          <span>{contributor.name}</span>
        </nav>

        <header style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--gold)', paddingBottom: '2rem' }}>
          <p className="section-label">Contributor</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
            lineHeight: 1.2,
            color: 'var(--navy)',
            marginBottom: '0.5rem',
          }}>
            {contributor.name}
          </h1>
          <p style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--ocean)',
            marginBottom: '1rem',
            fontFamily: 'var(--font-display)',
          }}>
            {contributor.role}
          </p>
          <p style={{ fontSize: '1.05rem', color: '#556', lineHeight: 1.65, maxWidth: '600px' }}>
            {contributor.tagline}
          </p>
        </header>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            color: 'var(--navy)',
            marginBottom: '1rem',
          }}>
            About
          </h2>
          {contributor.bio.map((para, i) => (
            <p key={i} style={{ color: '#445', fontSize: '0.975rem', lineHeight: 1.75, marginBottom: '1rem' }}>
              {para}
            </p>
          ))}
        </section>

        <section style={{
          marginBottom: '3rem',
          padding: '1.75rem 2rem',
          background: 'var(--cream)',
          borderRadius: 'var(--radius)',
          borderLeft: '4px solid var(--gold)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            color: 'var(--navy)',
            marginBottom: '1rem',
          }}>
            Editorial Methodology
          </h2>
          {contributor.principles.map((para, i) => (
            <p key={i} style={{ color: '#445', fontSize: '0.925rem', lineHeight: 1.75, marginBottom: '0.75rem' }}>
              {para}
            </p>
          ))}
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            color: 'var(--navy)',
            marginBottom: '1.5rem',
          }}>
            Published Articles
          </h2>

          {articles.length === 0 ? (
            <p style={{ color: 'var(--gray)', fontSize: '0.95rem' }}>No articles published yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                    padding: '1.5rem 1.75rem',
                    borderLeft: '4px solid var(--gold)',
                  }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      color: 'var(--navy)',
                      marginBottom: '0.4rem',
                      lineHeight: 1.3,
                    }}>
                      <a href={`/editorial/${article.slug}`} style={{ color: 'var(--navy)', textDecoration: 'none' }}>
                        {article.title}
                      </a>
                    </h3>
                    <p style={{ color: '#556', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      {article.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <time dateTime={article.datePublished} style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        {dateDisplay}
                      </time>
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
        </section>

        <footer style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--gray)' }}>
          <p>
            {contributor.name} writes for the Public Boat Ramps Editorial Team.{' '}
            Editorial inquiries: <a href="/contact" style={{ color: 'var(--ocean)' }}>contact us</a>.
          </p>
        </footer>

      </main>
    </>
  );
}
