import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(path, overrides = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const exports = {};
  new Function('require', 'exports', output)(name => name in overrides ? overrides[name] : require(name), exports);
  return exports;
}

test('signed claims round trip, reject tampering and expire at the boundary', () => {
  const api = load('src/lib/claim-token.ts');
  const secret = 'test-secret-at-least-sixteen-characters';
  const input = { email: 'private@example.test', businessName: 'Test business' };
  const token = api.createClaimToken(input, secret);
  const payload = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
  assert.deepEqual(api.verifyClaimToken(token, secret, payload.iat), { ok: true, ...input });
  assert.equal(payload.exp - payload.iat, 48 * 60 * 60 * 1000);
  assert.deepEqual(api.verifyClaimToken(token, secret, payload.exp), { ok: false, reason: 'expired' });
  assert.deepEqual(api.verifyClaimToken(token, 'different-secret', payload.iat), { ok: false, reason: 'bad-signature' });
  assert.deepEqual(api.verifyClaimToken('bad.token.extra', secret), { ok: false, reason: 'malformed' });
  const altered = Buffer.from(JSON.stringify({ ...payload, businessName: 'Altered' })).toString('base64url') + '.' + token.split('.')[1];
  assert.equal(api.verifyClaimToken(altered, secret).ok, false);
  assert.notEqual(api.createClaimToken(input, secret), token);
});

test('verify API never returns the private address or accepts malformed bodies', async () => {
  const tokenApi = load('src/lib/claim-token.ts');
  const secret = 'test-secret-at-least-sixteen-characters';
  const route = load('src/app/api/claim/verify/route.ts', { '@/lib/claim-token': { ...tokenApi, getClaimTokenSecret: () => secret } });
  const token = tokenApi.createClaimToken({ email: 'private@example.test', businessName: 'Test business' }, secret);
  const response = await route.POST(new Request('https://publicboatramps.com/api/claim/verify', { method: 'POST', body: JSON.stringify({ token }) }));
  assert.deepEqual(await response.json(), { ok: true, businessName: 'Test business', status: 'verified-pending-review' });
  const invalid = await route.POST(new Request('https://publicboatramps.com/api/claim/verify', { method: 'POST', body: 'null' }));
  assert.equal(invalid.status, 400);
});

test('claim requests validate input and keep delivery details out of responses', async () => {
  const categories = load('src/data/claims.ts');
  const tokenApi = load('src/lib/claim-token.ts');
  const deliveries = [];
  let delivery = { sent: true };
  let secret = 'test-secret-at-least-sixteen-characters';
  const route = load('src/app/api/claim/request/route.ts', {
    '@/data/claims': categories,
    '@/lib/claim-token': { ...tokenApi, getClaimTokenSecret: () => secret },
    '@/lib/claim-mailer': { sendClaimVerificationEmail: async data => { deliveries.push(data); return delivery; } },
  });
  const input = { businessName: 'Test business', email: 'private@example.test', website: 'https://example.test', category: categories.CLAIM_CATEGORIES[0], serviceArea: 'Polk County' };
  const post = body => route.POST(new Request('https://publicboatramps.com/api/claim/request', { method: 'POST', body: JSON.stringify(body) }));
  for (const [field, value] of [['email', 'bad'], ['website', 'http://example.test'], ['category', 'invalid'], ['serviceArea', 'x'], ['businessName', 'x']]) {
    const response = await post({ ...input, [field]: value });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'invalid-input', field });
  }
  const success = await post(input);
  assert.deepEqual(await success.json(), { ok: true });
  assert.equal(deliveries.length, 1);
  assert.match(deliveries[0].verifyUrl, /\/claim\/verify\?token=/);
  delivery = { sent: false, reason: 'not-configured' };
  assert.equal((await post(input)).status, 503);
  delivery = { sent: false, reason: 'provider-error' };
  assert.equal((await post(input)).status, 502);
  secret = null;
  assert.equal((await post(input)).status, 503);
});

test('hub exports match gated records and every cross-link resolves', () => {
  const locations = JSON.parse(readFileSync(new URL('../src/data/locations.json', import.meta.url)));
  const gate = load('src/lib/quality-gate.ts');
  const hubs = load('src/lib/hubs.ts', { '@/data/locations': { default: locations, __esModule: true }, '@/lib/quality-gate': gate });
  assert.equal(hubs.countyHubs.length, 59);
  assert.equal(hubs.cityHubs.length, 105);
  for (const h of [...hubs.countyHubs, ...hubs.cityHubs]) {
    assert.equal(h.rampCount, h.ramps.length);
    assert.equal(h.freeCount, h.ramps.filter(r => r.isFeeRequired === 'No').length);
    assert.ok(h.waterBodies.length <= 8);
    for (const w of h.waterBodies) assert.ok(locations.filter(r => gate.isIndexable(r) && r.stateSlug === h.stateSlug && r.waterBodySlug === w.slug).length >= 3);
  }
  for (const h of hubs.countyHubs) for (const c of h.cities) assert.ok(hubs.getCityHub(h.stateSlug, c.citySlug));
  for (const h of hubs.cityHubs) {
    if (h.county) assert.ok(hubs.getCountyHub(h.stateSlug, h.county.countySlug));
    for (const c of h.otherCities) assert.ok(hubs.getCityHub(h.stateSlug, c.citySlug));
  }
});

test('visit counts are real in development and hidden when unconfigured', async () => {
  const oldMode = process.env.NODE_ENV;
  const oldUrl = process.env.VISIT_COUNTER_API_URL;
  try {
    delete process.env.VISIT_COUNTER_API_URL;
    process.env.NODE_ENV = 'development';
    const store = load('src/lib/visit-store.ts');
    assert.equal(await store.getVisitCount('partner:test'), 0);
    assert.equal(await store.recordVisit('partner:test'), 1);
    assert.equal(await store.recordVisit('partner:test'), 2);
    assert.equal(await store.getVisitCount('partner:test'), 2);
    process.env.NODE_ENV = 'production';
    assert.equal(await store.getVisitCount('partner:test'), null);
    assert.equal(await store.recordVisit('partner:test'), null);
  } finally {
    if (oldMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldMode;
    if (oldUrl === undefined) delete process.env.VISIT_COUNTER_API_URL; else process.env.VISIT_COUNTER_API_URL = oldUrl;
  }
});

test('visits API rejects unsafe keys before accessing the counter', async () => {
  const seen = [];
  const route = load('src/app/api/visits/route.ts', { '@/lib/visit-store': {
    getVisitCount: async key => { seen.push(key); return null; },
    recordVisit: async key => { seen.push(key); return 1; },
  } });
  assert.equal((await route.GET(new Request('https://publicboatramps.com/api/visits?key=bad%20key'))).status, 400);
  assert.equal((await route.POST(new Request('https://publicboatramps.com/api/visits', { method: 'POST', body: 'null' }))).status, 400);
  assert.deepEqual(seen, []);
  const get = await route.GET(new Request('https://publicboatramps.com/api/visits?key=partner:test'));
  assert.deepEqual(await get.json(), { count: null });
  const post = await route.POST(new Request('https://publicboatramps.com/api/visits', { method: 'POST', body: JSON.stringify({ key: 'partner:test' }) }));
  assert.deepEqual(await post.json(), { count: 1 });
});
