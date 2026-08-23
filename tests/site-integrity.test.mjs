import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Creator footer link is removed without changing unrelated network links', () => {
  const layout = read('src/app/layout.tsx');
  assert.doesNotMatch(layout, /creatorrevenuecalculator|Creator Revenue Calculator/i);
  assert.match(layout, /\{ name: 'Fiber Tools', href: 'https:\/\/fibertools\.app' \}/);
  assert.match(layout, /\{ name: 'Flip My Case', href: 'https:\/\/flipmycase\.com' \}/);
  assert.equal(existsSync(new URL('../src/components/CreatorRevenueLink.tsx', import.meta.url)), false);
  assert.equal(existsSync(new URL('../src/lib/creator-link-rel.mjs', import.meta.url)), false);
});

function isIndexableRecord(record) {
  const mandatory = [record.name, record.lat, record.lng, record.city, record.state];
  if (mandatory.some((value) => value === null || value === undefined || value === '')) return false;
  const optional = [
    record.description,
    record.rampType,
    record.rampSurface,
    record.totalLanes,
    record.dockType,
    record.restroomType,
    record.waterBodyName,
    record.parkingSurface,
    record.hours,
    record.isFeeRequired,
  ];
  return optional.filter((value) => {
    if (value === null || value === undefined || value === '') return false;
    if (['Unknown', 'N/A', 'None', 'No Toilet'].includes(value)) return false;
    return !(typeof value === 'number' && value === 0);
  }).length >= 4;
}

test('optional advertising and analytics scripts stay disabled', () => {
  const layout = read('src/app/layout.tsx');
  for (const host of ['googletagmanager.com', 'googlesyndication.com', 'clarity.ms']) {
    assert.doesNotMatch(layout, new RegExp(host.replace('.', '\\.')));
  }
  assert.match(layout, /google-adsense-account/);
  assert.ok(existsSync(new URL('../public/ads.txt', import.meta.url)));
});

test('structured data only advertises implemented features', () => {
  const home = read('src/app/page.tsx');
  const finder = read('src/app/find/page.tsx');
  const detail = read('src/app/[state]/[slug]/page.tsx');
  assert.doesNotMatch(home, /SearchAction|\/search\?q=/);
  assert.doesNotMatch(finder, /SearchAction/);
  assert.match(home, /action=\"\/find\"/);
  assert.match(finder, /name=\"q\"/);
  assert.doesNotMatch(detail, /FAQPage|getCountyFaq/);
  assert.match(detail, /'@type': 'Place'/);
  assert.doesNotMatch(detail, /'@type': 'Park'/);
  assert.doesNotMatch(detail, /amenityFeature/);
  assert.match(detail, /if \(source\.allowsCoordinateDirections\)/);
});

test('JSON-LD serialization cannot terminate its script element', () => {
  const serializerSource = read('src/lib/json-ld.ts');
  const executableSource = serializerSource.replace(
    'export function serializeJsonLd(value: unknown): string',
    'function serializeJsonLd(value)',
  );
  const serializeJsonLd = new Function(`${executableSource}\nreturn serializeJsonLd;`)();
  const serialized = serializeJsonLd({ value: '</script><script>alert(1)</script>\u2028\u2029' });

  assert.doesNotMatch(serialized, /<\/script/i);
  assert.match(serialized, /\\u003c\/script>/i);
  assert.match(serialized, /\\u2028/);
  assert.match(serialized, /\\u2029/);

  for (const path of [
    'src/app/page.tsx',
    'src/app/[state]/page.tsx',
    'src/app/[state]/[slug]/page.tsx',
    'src/app/[state]/water-body/[slug]/page.tsx',
    'src/app/editorial/[slug]/page.tsx',
  ]) {
    const source = read(path);
    assert.match(source, /serializeJsonLd/);
    assert.doesNotMatch(source, /dangerouslySetInnerHTML=\{\{ __html: JSON\.stringify/);
  }
});

test('unverified free-access and contributor claims are absent', () => {
  const files = [
    'src/app/page.tsx',
    'src/app/[state]/[slug]/page.tsx',
    'src/app/editorial/[slug]/page.tsx',
    'src/content/editorial/free-boat-ramps-florida.md',
  ].map(read).join('\n');
  assert.doesNotMatch(files, /Free access to local waterways/);
  assert.doesNotMatch(files, /Marcus Whitfield/);
  assert.match(files, /Public Boat Ramps Data Team/);
});

test('source records are not presented as live verification, free access, or ADA certification', () => {
  const files = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/app/opengraph-image.tsx',
    'src/app/[state]/page.tsx',
    'src/app/[state]/[slug]/page.tsx',
    'src/app/[state]/water-body/[slug]/page.tsx',
    'src/components/StateRampListing.tsx',
  ].map(read).join('\n');

  assert.doesNotMatch(files, /Verified Listings|Compare verified|verified public boat|>Free<|ADA Accessible|Last verified/i);
  assert.doesNotMatch(files, />\s*ADA\s*</);
  assert.match(files, /Data-Rich Records/);
  assert.match(files, /No launch fee recorded/);
  assert.match(files, /Source record date/);
  assert.doesNotMatch(files, /isAccessibleForFree|priceRange/);
});

test('source licenses and navigation restrictions are enforced', () => {
  const sources = read('src/lib/data-sources.ts');
  const detail = read('src/app/[state]/[slug]/page.tsx');
  const finder = read('src/app/find/page.tsx');
  const layout = read('src/app/layout.tsx');
  const state = read('src/app/[state]/page.tsx');
  const waterBody = read('src/app/[state]/water-body/[slug]/page.tsx');
  const terms = read('src/app/terms/page.tsx');
  const liveCopy = [sources, detail, finder, layout, state, waterBody, terms, read('src/app/about/page.tsx')].join('\n');

  assert.match(sources, /dataSource === 'FWC_FL'[\s\S]*allowsCoordinateDirections: false/);
  assert.match(sources, /dataSource === 'USGS'[\s\S]*CC0 1\.0[\s\S]*allowsCoordinateDirections: true/);
  assert.match(sources, /OpenStreetMap contributors[\s\S]*ODbL/);
  assert.match(sources, /kind: 'unknown'[\s\S]*allowsCoordinateDirections: false/);
  assert.match(state, /!l\.dataSource \|\| l\.dataSource === 'OSM'/);
  assert.match(waterBody, /!r\.dataSource \|\| r\.dataSource === 'OSM'/);
  assert.match(detail, /source\.allowsCoordinateDirections \?/);
  assert.match(finder, /source\.allowsCoordinateDirections \?/);
  assert.match(detail, /Open Official FWC Finder/);
  assert.match(finder, /Official FWC Finder/);
  assert.match(terms, /public domain/);
  assert.match(terms, /proprietary rights/);
  assert.match(terms, /FWC-FWRI/);
  assert.match(terms, /not for navigation/);
  assert.match(layout, /public-domain source data; no proprietary claim; FWC-FWRI acknowledgment; not for navigation/);
  assert.doesNotMatch(liveCopy, /All content on this Site/);
});

test('homepage avoids unsupported nationwide crowd and availability claims', () => {
  const home = read('src/app/page.tsx');
  assert.doesNotMatch(home, /busiest times at public boat ramps|fills before 8am|between 6am and 10am|back up a ramp for over an hour|close October through April/i);
  assert.match(home, /does not publish live crowd levels, wait times, water depths, or parking availability/i);
});

test('privacy copy matches the deployed tracking configuration', () => {
  const privacy = read('src/app/privacy/page.tsx');
  assert.match(privacy, /does not currently load Google Analytics/);
  assert.match(privacy, /Vercel may process routine request data/);
  assert.match(privacy, /do not sell personal information/);
  assert.match(privacy, /do not promise zero logging or immediate deletion/);
  assert.match(privacy, /rounds latitude and longitude to two decimal places/);
  assert.match(privacy, /routine Vercel request logs/);
});

test('security policy blocks frames and unsafe eval', () => {
  const config = read('next.config.ts');
  assert.match(config, /X-Frame-Options'[\s\S]*DENY/);
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /object-src 'none'/);
  assert.doesNotMatch(config, /unsafe-eval|googleads|googlesyndication/);
  assert.match(config, /geolocation=\(self\)/);
});

test('public trust and discovery files are present', () => {
  for (const path of [
    'src/app/accessibility/page.tsx',
    'src/app/about/page.tsx',
    'src/app/contact/page.tsx',
    'src/app/find/page.tsx',
    'src/app/advertise/page.tsx',
    'src/data/partners.ts',
    'src/app/privacy/page.tsx',
    'src/app/terms/page.tsx',
    'public/ads.txt',
    'public/robots.txt',
    'public/llms.txt',
  ]) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `${path} must exist`);
  }

  const sitemap = read('src/app/sitemap-static.xml/route.ts');
  assert.match(sitemap, /\/accessibility/);
  assert.match(sitemap, /\/find/);
  assert.match(sitemap, /\/advertise/);
  assert.doesNotMatch(sitemap, /marcus-whitfield/);
  assert.doesNotMatch(sitemap, /\/editorial/);

  const llms = `${read('public/llms.txt')}\n${read('public/llms-full.txt')}`;
  assert.match(llms, /2,335/);
  assert.match(llms, /2,315/);
  assert.match(llms, /Georgia: 13|13 in Georgia/);
  assert.match(llms, /Alabama: 7|7 in Alabama/);
  assert.doesNotMatch(llms, /Coverage: All 50|102\+ public boat ramp/);
  assert.doesNotMatch(llms, /Editorial guides/);
  assert.match(llms, /FWC-FWRI/);
  assert.match(llms, /not for navigation/);
  assert.doesNotMatch(read('public/robots.txt'), /Crawl-delay/);
});

test('finder protects result indexation and limits location precision', () => {
  const finder = read('src/app/find/page.tsx');
  const locationButton = read('src/app/find/UseMyLocation.tsx');
  assert.match(finder, /if \(!value\.trim\(\)\) return null/);
  assert.match(finder, /robots: hasSearch \? \{ index: false, follow: true \}/);
  assert.match(finder, /results\.slice\(0, 100\)/);
  assert.match(finder, /ALLOWED_RADII/);
  assert.match(finder, /ALLOWED_FEE_FILTERS/);
  assert.match(finder, /ALLOWED_ACCESSIBILITY_FILTERS/);
  assert.match(locationButton, /toFixed\(2\)/);
  assert.match(locationButton, /ALLOWED_RADII/);
  assert.match(locationButton, /getCurrentPosition/);
});

test('unsupported generated state guides and legacy editorials stay unpublished', () => {
  const statePage = read('src/app/[state]/page.tsx');
  const editorial = read('src/lib/editorial.ts');
  const editorialIndex = read('src/app/editorial/page.tsx');
  const nextConfig = read('next.config.ts');
  assert.doesNotMatch(statePage, /state_guides\.json|FAQPage|faqHtml|guideHtml|from 'marked'/);
  assert.match(statePage, /no launch fee recorded in source data/);
  assert.match(statePage, /Accessibility feature recorded/);
  assert.match(statePage, /Selected Ramp Records in/);
  assert.match(statePage, /Ramp Records/);
  assert.doesNotMatch(statePage, />ADA</);
  assert.doesNotMatch(statePage, /Most Equipped|Data-Rich Ramps With No Launch Fee Recorded/);
  for (const slug of [
    'ada-accessible-boat-ramps-florida',
    'free-boat-ramps-florida',
    'saltwater-boat-ramps-florida-by-region',
  ]) {
    assert.match(editorial, new RegExp(slug));
  }
  assert.match(editorial, /ARCHIVED_SLUGS\.has\(slug\)/);
  assert.match(editorialIndex, /robots: \{ index: false, follow: true \}/);
  assert.match(editorialIndex, /Editorial Archive/);
  assert.doesNotMatch(nextConfig, /source: '\/editorial\/free-boat-ramps-florida'/);
});

test('paid placements are explicit and contain no invented businesses', () => {
  const services = read('src/components/NearbyServices.tsx');
  const advertise = read('src/app/advertise/page.tsx');
  const partners = read('src/data/partners.ts');
  assert.match(services, /Paid Advertisement/);
  assert.match(services, /Reviewed Business Profile/);
  assert.match(services, /partner\.tier !== 'basic'/);
  assert.match(services, /sponsored nofollow noopener noreferrer/);
  assert.match(services, /isSafeHttpsUrl/);
  assert.match(services, /isIsoDate/);
  assert.match(services, /typeof partner\.statewide === 'boolean'/);
  assert.match(services, /hasValidScope\(partner\)/);
  assert.match(services, /hasValidApproval\(partner\)/);
  assert.match(services, /if \(partner\.statewide\) return false/);
  assert.match(services, /partner\.tier === 'county'[\s\S]*countyCount === 1/);
  assert.match(services, /partner\.tier === 'regional'[\s\S]*countyCount >= 2[\s\S]*countyCount <= 5/);
  assert.match(services, /billingStatus === 'active'/);
  assert.match(services, /paymentConfirmedOn/);
  assert.match(services, /partner\.endsOn >= partner\.startsOn/);
  assert.match(services, /filter\(isValidPartner\)/);
  assert.match(services, /slice\(0, 6\)/);
  assert.match(advertise, /does not guarantee traffic, calls, bookings, or revenue/i);
  assert.match(partners, /statewide: boolean/);
  assert.match(partners, /partners: Partner\[\] = \[\]/);
  assert.doesNotMatch(partners, /example\.com|placeholder|sample business/i);
});

test('navigation and state filters remain usable on mobile and by keyboard', () => {
  const layout = read('src/app/layout.tsx');
  const css = read('src/app/globals.css');
  const listing = read('src/components/StateRampListing.tsx');

  assert.match(layout, /<details className="mobile-nav">/);
  assert.match(layout, /aria-label="Mobile navigation"/);
  assert.match(css, /\.mobile-nav > summary[\s\S]*min-height: 44px/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.mobile-nav \{ display: block; \}/);
  assert.doesNotMatch(css, /nav-dropdown:focus-within/);
  assert.match(listing, /<label htmlFor="state-ramp-filter"/);
  assert.match(listing, /id="state-ramp-filter"/);
  assert.match(listing, /className="state-ramp-filter"/);
  assert.match(css, /\.state-ramp-filter:focus-visible[\s\S]*outline:/);
});

test('FWC snapshot is current, qualified, and reproducible', () => {
  const locations = JSON.parse(read('src/data/locations.json'));
  const fwc = locations.filter((location) => location.dataSource === 'FWC_FL');
  const importer = read('scripts/import-fl-fwc.mjs');
  const driftWorkflow = read('.github/workflows/fwc-source-drift.yml');

  assert.equal(fwc.length, 2415);
  assert.equal(fwc.filter((location) => location.isFeeRequired === 'No').length, 1627);
  assert.ok(fwc.every((location) => location.sourceSnapshotDate === '2026-08-03'));
  assert.ok(fwc.every((location) => location.sourceOriginalMetadataUrl && location.sourceProcessingNote));
  assert.ok(fwc.every((location) => !location.lastEditedDate || /^\d{4}-\d{2}-\d{2}T/.test(location.lastEditedDate)));

  const generatedCopy = fwc
    .map((location) => `${location.description ?? ''} ${(location.amenities ?? []).join(' ')}`)
    .join('\n');
  assert.doesNotMatch(generatedCopy, /free of charge|free launch|ADA accessible/i);
  assert.doesNotMatch(generatedCopy, /the facility features/i);
  assert.doesNotMatch(generatedCopy, /\$3\.18000007/);

  const routes = fwc.map((location) => `${location.stateSlug}/${location.slug}`);
  assert.equal(new Set(routes).size, routes.length);
  assert.equal(fwc.filter((location) => location.state === 'Florida').length, 2392);
  assert.equal(fwc.filter((location) => location.state === 'Alabama').length, 9);
  assert.equal(fwc.filter((location) => location.state === 'Georgia').length, 14);
  assert.equal(fwc.filter((location) => location.state === 'New York').length, 0);

  const indexableByState = Object.groupBy(locations.filter(isIndexableRecord), (location) => location.state);
  assert.equal(indexableByState.Florida.length, 2315);
  assert.equal(indexableByState.Alabama.length, 7);
  assert.equal(indexableByState.Georgia.length, 13);

  assert.match(importer, /fetchLiveGeoJson/);
  assert.match(importer, /fwcSourceKey/);
  assert.match(importer, /stateByCode/);
  assert.match(importer, /coordinatesMatchStateCode/);
  assert.match(importer, /inferDirectoryState\(p, priorRecord\?\.state\)/);
  assert.match(importer, /No launch fee recorded/);
  assert.match(importer, /Accessibility feature recorded/);
  assert.match(importer, /MIN_SOURCE_FEATURES/);
  assert.match(importer, /minimumEligible/);
  assert.match(importer, /FWC_SNAPSHOT_DATE=YYYY-MM-DD is required/);
  assert.match(importer, /FWC_SNAPSHOT_DATE must use YYYY-MM-DD format/);
  assert.match(importer, /temporaryLocationsPath/);
  assert.match(importer, /renameSync\(temporaryLocationsPath, locationsPath\)/);
  assert.match(importer, /unhandledRetirements/);
  assert.match(driftWorkflow, /schedule:/);
  assert.match(driftWorkflow, /npm run check:fwc/);
});

test('previously published source URLs receive explicit lifecycle treatment', () => {
  const retired = JSON.parse(read('src/data/retired-ramps.json'));
  const redirects = JSON.parse(read('src/data/route-redirects.json'));
  const locations = JSON.parse(read('src/data/locations.json'));
  const detail = read('src/app/[state]/[slug]/page.tsx');
  const config = read('next.config.ts');
  const routes = retired.map((record) => `${record.stateSlug}/${record.slug}`);
  const indexableRoutes = new Set(
    locations
      .filter(isIndexableRecord)
      .map((record) => `/${record.stateSlug}/${record.slug}`),
  );

  assert.equal(retired.length, 17);
  assert.equal(new Set(routes).size, routes.length);
  assert.equal(retired.filter((record) => record.reason === 'removed-from-source').length, 14);
  assert.equal(retired.filter((record) => record.reason === 'below-directory-threshold').length, 3);
  assert.ok(retired.every((record) => record.retiredOn === '2026-08-03'));
  assert.ok(retired.every((record) => !indexableRoutes.has(`/${record.stateSlug}/${record.slug}`)));
  assert.equal(redirects.length, 7);
  assert.equal(new Set(redirects.map((redirect) => redirect.source)).size, redirects.length);
  assert.ok(redirects.every((redirect) => !indexableRoutes.has(redirect.source)));
  assert.ok(redirects.every((redirect) => indexableRoutes.has(redirect.destination)));
  assert.match(config, /routeRedirects\.map/);
  assert.match(detail, /getRetiredRamp\(state, slug\)/);
  assert.match(detail, /robots: \{ index: false, follow: true \}/);
  assert.match(detail, /not a closure notice/i);
});

test('calendar-only source dates render without timezone drift', () => {
  const rampPage = read('src/app/[state]/[slug]/page.tsx');
  const sourceAttribution = read('src/components/DataSourceAttribution.tsx');

  assert.match(rampPage, /const isCalendarDate = \/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\//);
  assert.match(rampPage, /isCalendarDate \? `\$\{rawDate\}T00:00:00Z` : rawDate/);
  assert.match(rampPage, /isCalendarDate \? \{ timeZone: 'UTC' \} : \{\}/);
  assert.match(sourceAttribution, /function formatSourceDate/);
  assert.match(sourceAttribution, /timeZone: 'UTC'/);
  assert.doesNotMatch(sourceAttribution, /Latest source-record date in this group: \{latestSourceDate\}/);
});

test('local runtime artifacts stay out of version control', () => {
  assert.match(read('.gitignore'), /^\.codex-runtime\/$/m);
  assert.match(read('.gitignore'), /^src\/data\/locations\.json\.tmp-\*$/m);
});

test('the public footer does not cross-link to MindCheck Tools', () => {
  const layout = read('src/app/layout.tsx');
  assert.doesNotMatch(layout, /mindchecktools\.com|Mind Check Tools/i);
});
