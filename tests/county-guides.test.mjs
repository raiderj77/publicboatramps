import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const guides = JSON.parse(read('src/data/county_guides.json'));
const locations = JSON.parse(read('src/data/locations.json'));

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

test('every county guide points at a county that exists in the directory data', () => {
  const keys = Object.keys(guides);
  assert.ok(keys.length > 0, 'at least one county guide exists');
  for (const key of keys) {
    const [stateSlug, countySlug] = key.split('/');
    const matches = locations.filter(
      (r) => r.stateSlug === stateSlug && slugify(r.county || '') === countySlug,
    );
    assert.ok(matches.length > 0, `${key} matches directory records`);
    assert.equal(guides[key].county, matches[0].county, `${key} county name matches the data`);
  }
});

test('every county guide is complete: intro, notes, dated sources', () => {
  for (const [key, guide] of Object.entries(guides)) {
    assert.ok(guide.intro && guide.intro.length > 80, `${key} has a substantive intro`);
    assert.ok(Array.isArray(guide.notes) && guide.notes.length >= 3, `${key} has at least 3 notes`);
    for (const note of guide.notes) assert.ok(note.length > 40, `${key} notes are substantive`);
    assert.match(guide.checked, /^[A-Z][a-z]+ \d{1,2}, \d{4}$/, `${key} carries a checked date`);
    assert.ok(Array.isArray(guide.sources) && guide.sources.length >= 1, `${key} cites sources`);
    for (const source of guide.sources) {
      assert.ok(source.label && source.label.length > 3, `${key} source has a label`);
      if (source.url) assert.match(source.url, /^https?:\/\//, `${key} source url is a url`);
    }
  }
});

test('county hub page renders the guide section', () => {
  const page = read('src/app/[state]/county/[slug]/page.tsx');
  assert.match(page, /getCountyGuide/);
  assert.match(page, /Ramp Fees, Parking and Local Notes/);
});
