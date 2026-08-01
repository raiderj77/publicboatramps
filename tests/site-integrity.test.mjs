import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

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

  const llms = `${read('public/llms.txt')}\n${read('public/llms-full.txt')}`;
  assert.match(llms, /2,334/);
  assert.doesNotMatch(llms, /Coverage: All 50|102\+ public boat ramp/);
  assert.doesNotMatch(read('public/robots.txt'), /Crawl-delay/);
});

test('finder protects result indexation and limits location precision', () => {
  const finder = read('src/app/find/page.tsx');
  const locationButton = read('src/app/find/UseMyLocation.tsx');
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
  assert.match(services, /partner\.endsOn >= partner\.startsOn/);
  assert.match(services, /filter\(isValidPartner\)/);
  assert.match(services, /if \(partner\.statewide\) return true/);
  assert.match(services, /slice\(0, 6\)/);
  assert.match(advertise, /does not guarantee traffic, calls, bookings, or revenue/i);
  assert.match(partners, /statewide: boolean/);
  assert.match(partners, /partners: Partner\[\] = \[\]/);
  assert.doesNotMatch(partners, /example\.com|placeholder|sample business/i);
});
