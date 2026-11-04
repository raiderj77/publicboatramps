import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StateRampListing from '@/components/StateRampListing';
import { cityHubs, getCityHub } from '@/lib/hubs';

export const revalidate = 86400;
type Props = { params: Promise<{ state: string; slug: string }> };
export function generateStaticParams() { return cityHubs.map(h => ({ state: h.stateSlug, slug: h.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, slug } = await params;
  const hub = getCityHub(state, slug);
  if (!hub) notFound();
  const label = hub.name;
  return { title: `Boat Ramps in ${label}, ${hub.state}`, description: `${hub.rampCount} public boat-ramp source records in ${label}, ${hub.state}. ${hub.freeCount} have no launch fee recorded.`, alternates: { canonical: `https://publicboatramps.com/${state}/city/${slug}` } };
}
function LinkList({ title, links }: { title: string; links: { href: string; name: string }[] }) {
  if (!links.length) return null;
  return <section style={{ marginTop: '2.5rem' }}><h2 className="section-title">{title}</h2><ul>{links.map(l => <li key={l.href}><Link href={l.href}>{l.name}</Link></li>)}</ul></section>;
}
export default async function CityPage({ params }: Props) {
  const { state, slug } = await params;
  const hub = getCityHub(state, slug);
  if (!hub) notFound();
  const label = hub.name;
  const cityCount = new Set(hub.ramps.map(r => r.city).filter(Boolean)).size;
  return <>
    <section style={{ background: 'var(--navy)', color: 'var(--white)', padding: '4rem 1.5rem' }}>
      <div className="container">
        <nav aria-label="Breadcrumb"><Link href="/" style={{ color: 'var(--gold)' }}>Home</Link> / <Link href={`/${state}`} style={{ color: 'var(--gold)' }}>{hub.state}</Link> / {label}</nav>
        <p className="section-label" style={{ color: 'var(--gold)' }}>Public Boat Ramps</p>
        <h1 style={{ fontFamily: 'var(--font-display)' }}>Boat Ramps in {label}, {hub.state}</h1>
        <p>{hub.rampCount} public boat-ramp source records cover {label}. {hub.freeCount} have no launch fee recorded. {hub.waterBodies.length > 0 && <>Water bodies include {hub.waterBodies.slice(0, 3).map(w => w.name).join(', ')}.</>}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
          {[[hub.rampCount, 'Ramp records'], [hub.freeCount, 'No launch fee recorded'], [cityCount, 'Cities covered']].map(([count, text]) => <div key={text}><strong style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)' }}>{count}</strong><div>{text}</div></div>)}
        </div>
      </div>
    </section>
    <section style={{ padding: '3.5rem 1.5rem', background: 'var(--cream)' }}><div className="container">
      <p className="section-label">Full Directory</p><h2 className="section-title">Ramp records in {label}</h2>
      <StateRampListing ramps={hub.ramps} stateSlug={state} />
      {hub.county && <p><Link href={`/${state}/county/${hub.county.countySlug}`}>Browse {hub.county.name} County</Link></p>}
      <LinkList title="Other cities in this county" links={hub.otherCities.map(c => ({ href: `/${state}/city/${c.citySlug}`, name: `${c.name} (${c.count})` }))} />
      <LinkList title={`Water bodies serving ${label}`} links={hub.waterBodies.map(w => ({ href: `/${state}/water-body/${w.slug}`, name: `${w.name} (${w.count})` }))} />
      <p style={{ marginTop: '2rem' }}><Link href={`/${state}`}>All {hub.state} boat ramps</Link></p>
    </div></section>
  </>;
}
