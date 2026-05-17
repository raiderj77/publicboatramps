import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Utilities ────────────────────────────────────────────────────────────────

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleCase(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function present(val) {
  return val !== null && val !== undefined && val !== '' && val !== 'Unknown' && val !== 'N/A' && val !== 'None';
}

// ── Amenity derivation ────────────────────────────────────────────────────────

function deriveAmenities(p) {
  const amenities = [];

  amenities.push('Boat launch');
  amenities.push('Public access');

  const rampType = (p.RampType || '').toLowerCase();

  if (rampType === 'hand launch only') {
    amenities.push('Hand launch only');
  } else if (rampType.includes('marina')) {
    amenities.push('Marina ramp');
  } else if (rampType.includes('airboat')) {
    amenities.push('Airboat access');
  }

  if (present(p.RestroomType) && p.RestroomType !== 'No Toilet') {
    amenities.push('Restrooms available');
  }

  if (p.isRestroomAccessible === 'Yes') {
    amenities.push('ADA accessible restroom');
  }

  if (present(p.DockType) && p.DockType !== 'None') {
    amenities.push('Courtesy dock');
  }

  const trailerSpaces = parseInt(p.Trailer, 10);
  if (!isNaN(trailerSpaces) && trailerSpaces > 0) {
    amenities.push('Trailer parking');
  }

  if (p.isFeeRequired === 'No') {
    amenities.push('Free launch');
  } else if (p.isFeeRequired === 'Yes') {
    amenities.push('Fee required');
  }

  const accessibility = (p.AccessibilityLevel || '').toLowerCase();
  if (accessibility.includes('fully') || accessibility.includes('partially')) {
    amenities.push('ADA accessible');
  }

  return amenities;
}

// ── Description generation ────────────────────────────────────────────────────

function generateDescription(p) {
  const parts = [];

  const name = p.RampName || 'This facility';
  const city = present(p.City) ? titleCase(p.City) : null;
  const rampType = present(p.RampType) ? p.RampType.toLowerCase() : 'boat ramp';
  const waterBody = present(p.WaterBodyName) ? p.WaterBodyName : null;
  const waterType = present(p.WaterType) ? p.WaterType.toLowerCase() : null;
  const totalLanes = parseInt(p.TotalLanes, 10);
  const surface = present(p.RampSurface) ? p.RampSurface.toLowerCase() : null;
  const condition = present(p.RampCondition) ? p.RampCondition.toLowerCase() : null;

  // Sentence 1: identity
  let intro = `${name} is a ${rampType}`;
  if (city) intro += ` in ${city}, Florida`;
  if (waterBody) {
    intro += `, providing access to ${waterBody}`;
    if (waterType) intro += ` (${waterType})`;
  } else if (waterType) {
    intro += `, providing ${waterType} access`;
  }
  parts.push(intro + '.');

  // Sentence 2: ramp lanes and surface
  if (!isNaN(totalLanes) || surface) {
    let rampDesc = 'The ramp';
    if (!isNaN(totalLanes)) rampDesc += ` has ${totalLanes} lane${totalLanes !== 1 ? 's' : ''}`;
    if (surface) rampDesc += `${!isNaN(totalLanes) ? ' with a' : ' has a'} ${surface} surface`;
    if (condition && condition !== 'unknown') rampDesc += ` in ${condition} condition`;
    parts.push(rampDesc + '.');
  }

  // Sentence 3: fee
  if (p.isFeeRequired === 'Yes') {
    let feeStr = 'A launch fee is required';
    if (present(p.FeeAmount) && p.FeeAmount !== '0') feeStr += ` ($${p.FeeAmount})`;
    if (present(p.FeeCollectionType)) feeStr += `; fees are collected ${p.FeeCollectionType.toLowerCase()}`;
    parts.push(feeStr + '.');
  } else if (p.isFeeRequired === 'No') {
    parts.push('Launch is free of charge.');
  }

  // Sentence 4: dock / restrooms / accessibility
  const extras = [];
  if (present(p.DockType) && p.DockType !== 'None') {
    extras.push(`a ${p.DockType.toLowerCase()}`);
  }
  if (present(p.RestroomType) && p.RestroomType !== 'No Toilet') {
    const accessible = p.isRestroomAccessible === 'Yes' ? ' (ADA accessible)' : '';
    extras.push(`${p.RestroomType.toLowerCase()} restrooms${accessible}`);
  }
  const trailerSpaces = parseInt(p.Trailer, 10);
  if (!isNaN(trailerSpaces) && trailerSpaces > 0) {
    extras.push(`trailer parking for ${trailerSpaces} vehicle${trailerSpaces !== 1 ? 's' : ''}`);
  }
  if (extras.length > 0) {
    const last = extras.pop();
    const list = extras.length > 0 ? extras.join(', ') + ' and ' + last : last;
    parts.push(`The facility features ${list}.`);
  }

  // Sentence 5: hours / admin
  if (present(p.Hours) && p.Hours.toLowerCase() !== 'unknown') {
    parts.push(`Hours: ${p.Hours}.`);
  }

  return parts.join(' ');
}

// ── Slug uniqueness ───────────────────────────────────────────────────────────

function makeSlug(properties, existingSlugs) {
  const base = slugify(`${properties.RampName}-${properties.City}`);
  if (!existingSlugs.has(base)) {
    existingSlugs.add(base);
    return base;
  }
  // Append county to break ties
  const withCounty = slugify(`${properties.RampName}-${properties.City}-${properties.County}`);
  if (!existingSlugs.has(withCounty)) {
    existingSlugs.add(withCounty);
    return withCounty;
  }
  // Final fallback: append RampID
  const withId = slugify(`${properties.RampName}-${properties.City}-${properties.RampID}`);
  if (!existingSlugs.has(withId)) {
    existingSlugs.add(withId);
    return withId;
  }
  // Safety net: numeric suffix
  let n = 2;
  while (true) {
    const withN = `${withId}-${n}`;
    if (!existingSlugs.has(withN)) {
      existingSlugs.add(withN);
      return withN;
    }
    n++;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const geojsonPath = process.argv[2];
if (!geojsonPath) {
  console.error('Usage: node scripts/import-fl-fwc.mjs <path-to-geojson>');
  process.exit(1);
}

const locationsPath = resolve(__dirname, '../src/data/locations.json');

console.log(`Reading GeoJSON from: ${resolve(geojsonPath)}`);
const geojson = JSON.parse(readFileSync(resolve(geojsonPath), 'utf8'));
const features = geojson.features || [];
console.log(`GeoJSON features total: ${features.length}`);

console.log(`Reading locations from: ${locationsPath}`);
const existing = JSON.parse(readFileSync(locationsPath, 'utf8'));
console.log(`\nLocations before: ${existing.length}`);

const nonFlorida = existing.filter((r) => r.state !== 'Florida');
const removedCount = existing.length - nonFlorida.length;
console.log(`FL records removed:     ${removedCount}`);

// Filter FWC features
const eligible = features.filter((f) => {
  const p = f.properties;
  return (
    p.Status === 'Open for Business' &&
    p.AccessType !== 'Government Owned for Restricted Public Use'
  );
});
console.log(`FWC features after filter: ${eligible.length} (of ${features.length} total)`);

// Build slug set from non-Florida records to avoid cross-state collisions
const existingSlugs = new Set(nonFlorida.map((r) => r.slug));

// Map to locations schema
const flRecords = eligible.map((f) => {
  const p = f.properties;
  const slug = makeSlug(p, existingSlugs);

  return {
    name: p.RampName,
    slug,
    state: 'Florida',
    stateSlug: 'florida',
    city: present(p.City) ? titleCase(p.City) : '',
    lat: parseFloat(p.Latitude),
    lng: parseFloat(p.Longitude),
    description: generateDescription(p),
    amenities: deriveAmenities(p),

    // Enriched FWC fields
    dataSource: 'FWC_FL',
    rampId: p.RampID,
    rampType: p.RampType,
    accessType: p.AccessType,
    adminEntity: p.PrimaryAdminEntity,
    hours: present(p.Hours) ? p.Hours : null,
    isFeeRequired: p.isFeeRequired,
    feeAmount: present(p.FeeAmount) ? p.FeeAmount : null,
    feeCollectionType: present(p.FeeCollectionType) ? p.FeeCollectionType : null,
    rampSurface: present(p.RampSurface) ? p.RampSurface : null,
    rampCondition: present(p.RampCondition) ? p.RampCondition : null,
    singleLanes: p.SingleLanes,
    doubleLanes: p.DoubleLanes,
    totalLanes: p.TotalLanes,
    dockType: present(p.DockType) ? p.DockType : null,
    parkingSurface: present(p.ParkingSurface) ? p.ParkingSurface : null,
    parkingCondition: present(p.ParkingCondition) ? p.ParkingCondition : null,
    trailerSpaces: p.Trailer,
    accessibleTrailerSpaces: p.AccessibleTrailer,
    vehicleSpaces: p.Vehicle,
    accessibleVehicleSpaces: p.AccessibleVehicle,
    restroomType: present(p.RestroomType) ? p.RestroomType : null,
    isRestroomAccessible: p.isRestroomAccessible,
    accessibilityLevel: present(p.AccessibilityLevel) ? p.AccessibilityLevel : null,
    street: present(p.Street1) ? p.Street1 : null,
    county: present(p.County) ? titleCase(p.County) : null,
    zipCode: p.ZipCode,
    waterType: present(p.WaterType) ? p.WaterType : null,
    waterBodyName: present(p.WaterBodyName) ? p.WaterBodyName : null,
    waterBodySlug: present(p.WaterBodyName) ? slugify(p.WaterBodyName) : null,
    hydrologicalType: present(p.HydrologicalType) ? p.HydrologicalType : null,
    contactPhone: present(p.ContactPhone) ? p.ContactPhone : null,
    externalUrl: present(p.URL) ? p.URL : null,
    hasPhotos: p.hasPhotos === 1,
    lastEditedDate: p.last_edited_date,
  };
});

console.log(`FL records added:       ${flRecords.length}`);

const merged = [...nonFlorida, ...flRecords];
console.log(`Total after:            ${merged.length}`);

// Write
writeFileSync(locationsPath, JSON.stringify(merged, null, 2), 'utf8');
console.log(`\nWritten to ${locationsPath}`);

// ── Sample output ─────────────────────────────────────────────────────────────

console.log('\n── 3 sample records by RampType ──────────────────────────────────────────\n');
const sampleTypes = ['Stand Alone Ramp', 'Hand Launch Only', 'Boat Ramp Within Marina'];
const samples = sampleTypes.map((t) => flRecords.find((r) => r.rampType === t)).filter(Boolean);
samples.forEach((r, i) => {
  console.log(`[${i + 1}] ${r.name}  (${r.rampType})`);
  console.log(`    slug:        ${r.slug}`);
  console.log(`    city:        ${r.city}, ${r.county} County`);
  console.log(`    water:       ${r.waterBodyName ?? 'n/a'} (${r.waterType ?? 'n/a'})`);
  console.log(`    amenities:   ${r.amenities.join(', ')}`);
  console.log(`    description: ${r.description}`);
  console.log('');
});
