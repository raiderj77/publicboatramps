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
  const detail = read('src/app/[state]/[slug]/page.tsx');
  assert.doesNotMatch(home, /SearchAction|\/search\?q=/);
  assert.doesNotMatch(detail, /FAQPage|getCountyFaq/);
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

test('privacy copy matches the deployed tracking configuration', () => {
  const privacy = read('src/app/privacy/page.tsx');
  assert.match(privacy, /does not currently load Google Analytics/);
  assert.match(privacy, /Vercel may process routine request data/);
  assert.match(privacy, /do not sell personal information/);
  assert.match(privacy, /do not promise zero logging or immediate deletion/);
});

test('security policy blocks frames and unsafe eval', () => {
  const config = read('next.config.ts');
  assert.match(config, /X-Frame-Options'[\s\S]*DENY/);
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /object-src 'none'/);
  assert.doesNotMatch(config, /unsafe-eval|googleads|googlesyndication/);
});

test('public trust and discovery files are present', () => {
  for (const path of [
    'src/app/accessibility/page.tsx',
    'src/app/about/page.tsx',
    'src/app/contact/page.tsx',
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
  assert.doesNotMatch(sitemap, /marcus-whitfield/);

  const llms = `${read('public/llms.txt')}\n${read('public/llms-full.txt')}`;
  assert.match(llms, /2,334/);
  assert.doesNotMatch(llms, /Coverage: All 50|102\+ public boat ramp/);
  assert.doesNotMatch(read('public/robots.txt'), /Crawl-delay/);
});
