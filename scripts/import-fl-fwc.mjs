import { readFileSync, renameSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FWC_LAYER_URL =
  'https://gis.myfwc.com/mapping/rest/services/Open_Data/FWC_Florida_Boat_Ramp_Inventory/MapServer/4';
const FWC_METADATA_URL =
  'https://gis.myfwc.com/mapping/rest/services/Open_Data/FWC_Florida_Boat_Ramp_Inventory/MapServer/info/metadata';
const EXPLICIT_SNAPSHOT_DATE = process.env.FWC_SNAPSHOT_DATE;
const SOURCE_SNAPSHOT_DATE = EXPLICIT_SNAPSHOT_DATE || new Date().toISOString().slice(0, 10);
const MIN_SOURCE_FEATURES = 2000;
const MIN_ELIGIBLE_RECORDS = 1800;

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`FWC request failed (${response.status}): ${url}`);
  return response.json();
}

async function fetchLiveGeoJson() {
  const idsUrl = `${FWC_LAYER_URL}/query?where=1%3D1&returnIdsOnly=true&f=json`;
  const idsPayload = await fetchJson(idsUrl);
  if (!Array.isArray(idsPayload.objectIds)) throw new Error('FWC response did not include objectIds.');
  if (idsPayload.objectIds.length < MIN_SOURCE_FEATURES) {
    throw new Error(`FWC source safety check failed: received only ${idsPayload.objectIds.length} object IDs.`);
  }

  const objectIds = [...idsPayload.objectIds].sort((a, b) => a - b);
  const features = [];
  for (let offset = 0; offset < objectIds.length; offset += 500) {
    const batch = objectIds.slice(offset, offset + 500).join(',');
    const query = new URLSearchParams({
      objectIds: batch,
      outFields: '*',
      returnGeometry: 'true',
      outSR: '4326',
      f: 'geojson',
    });
    const payload = await fetchJson(`${FWC_LAYER_URL}/query?${query}`);
    if (!Array.isArray(payload.features)) throw new Error(`FWC batch at offset ${offset} did not include features.`);
    features.push(...payload.features);
  }

  if (features.length !== objectIds.length) {
    throw new Error(`FWC feature count mismatch: expected ${objectIds.length}, received ${features.length}.`);
  }
  return { type: 'FeatureCollection', features };
}

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
  if (val === null || val === undefined) return false;
  const normalized = String(val).trim().toUpperCase();
  return normalized !== '' && !['UNKNOWN', 'N/A', 'NA', 'NONE', 'NULL'].includes(normalized);
}

function hasDock(value) {
  if (!present(value)) return false;
  return !['NO DOCK', 'NO DOCKS'].includes(String(value).trim().toUpperCase());
}

function hasRestroom(value) {
  if (!present(value)) return false;
  return !['NO TOILET', 'NO RESTROOM', 'NO RESTROOMS'].includes(String(value).trim().toUpperCase());
}

function cleanListValue(value) {
  if (!present(value)) return null;
  const seen = new Set();
  const parts = String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return parts.join(', ') || null;
}

function isoDate(value) {
  if (!present(value)) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function fwcSourceKey(record) {
  const rampId = record.rampId ?? record.RampID ?? '';
  const waterBody = record.waterBodyName ?? record.WaterBodyName ?? '';
  return `${String(rampId).trim()}::${String(waterBody).trim()}`;
}

function isDirectoryIndexable(record) {
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

function displayFeeAmount(value) {
  const amount = Number(String(value).replace(/[$,]/g, ''));
  return Number.isFinite(amount) ? amount.toFixed(2) : String(value).trim();
}

// ── Amenity derivation ────────────────────────────────────────────────────────

function deriveAmenities(p) {
  const amenities = [];

  amenities.push('Boat launch');
  amenities.push('Public access recorded');

  const rampType = (p.RampType || '').toLowerCase();

  if (rampType === 'hand launch only') {
    amenities.push('Hand launch only');
  } else if (rampType.includes('marina')) {
    amenities.push('Marina ramp');
  } else if (rampType.includes('airboat')) {
    amenities.push('Airboat access');
  }

  if (hasRestroom(p.RestroomType)) {
    amenities.push('Restroom recorded');
  }

  if (p.isRestroomAccessible === 'Yes') {
    amenities.push('Restroom accessibility recorded');
  }

  if (hasDock(p.DockType)) {
    amenities.push('Dock recorded');
  }

  const trailerSpaces = parseInt(p.Trailer, 10);
  if (!isNaN(trailerSpaces) && trailerSpaces > 0) {
    amenities.push('Trailer parking recorded');
  }

  if (p.isFeeRequired === 'No') {
    amenities.push('No launch fee recorded');
  } else if (p.isFeeRequired === 'Yes') {
    amenities.push('Launch fee recorded');
  }

  const accessibility = (p.AccessibilityLevel || '').toLowerCase();
  if (
    accessibility.includes('fully') ||
    accessibility.includes('partially') ||
    accessibility.includes('high level') ||
    accessibility.includes('moderate level')
  ) {
    amenities.push('Accessibility feature recorded');
  }

  return amenities;
}

// ── Description generation ────────────────────────────────────────────────────

function inferDirectoryState(p, priorState) {
  const stateByCode = { AL: 'Alabama', FL: 'Florida', GA: 'Georgia', NY: 'New York' };
  const stateBounds = {
    AL: { minLat: 30.1, maxLat: 35.1, minLng: -88.5, maxLng: -84.7 },
    FL: { minLat: 24.3, maxLat: 31.1, minLng: -87.7, maxLng: -79.8 },
    GA: { minLat: 30.3, maxLat: 35.1, minLng: -85.7, maxLng: -80.7 },
    NY: { minLat: 40.3, maxLat: 45.2, minLng: -79.9, maxLng: -71.7 },
  };
  const stateCode = String(p.StateCode ?? '').trim().toUpperCase();
  const bounds = stateBounds[stateCode];
  const latitude = Number(p.Latitude);
  const longitude = Number(p.Longitude);
  const coordinatesMatchStateCode = bounds && Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= bounds.minLat && latitude <= bounds.maxLat &&
    longitude >= bounds.minLng && longitude <= bounds.maxLng;
  if (stateByCode[stateCode] && coordinatesMatchStateCode) return stateByCode[stateCode];
  if (priorState) return priorState;
  const context = [p.RampName, p.PrimaryAdminEntity, p.WaterBodyName].filter(Boolean).join(' ');
  if (/\bAlabama\b/i.test(context) || /^ZZ1/i.test(String(p.RampID ?? ''))) return 'Alabama';
  if (/\bGeorgia\b/i.test(context) || /^ZZ2/i.test(String(p.RampID ?? ''))) return 'Georgia';
  return 'Florida';
}

function generateDescription(p, stateName) {
  const parts = [];

  const name = p.RampName || 'This facility';
  const city = present(p.City) ? titleCase(p.City) : null;
  const rampType = present(p.RampType) ? p.RampType.toLowerCase() : 'boat ramp';
  const waterBody = present(p.WaterBodyName) ? p.WaterBodyName : null;
  const waterType = present(p.WaterType) ? p.WaterType.toLowerCase() : null;
  const totalLanes = parseInt(p.TotalLanes, 10);
  const surface = cleanListValue(p.RampSurface)?.toLowerCase() ?? null;
  const condition = present(p.RampCondition) ? String(p.RampCondition).trim().toLowerCase() : null;

  // Sentence 1: source-record identity
  let intro = `The FWC source record identifies ${name} as a ${rampType}`;
  if (city) intro += ` in ${city}, ${stateName}`;
  if (waterBody) {
    intro += `, providing access to ${waterBody}`;
    if (waterType) intro += ` (${waterType})`;
  } else if (waterType) {
    intro += `, providing ${waterType} access`;
  }
  parts.push(intro + '.');

  // Sentence 2: ramp lanes and surface
  if (!isNaN(totalLanes) || surface) {
    let rampDesc = 'The source record lists';
    if (!isNaN(totalLanes)) rampDesc += ` ${totalLanes} lane${totalLanes !== 1 ? 's' : ''}`;
    if (surface) rampDesc += `${!isNaN(totalLanes) ? ' with a' : ' a'} ${surface} surface`;
    if (condition && condition !== 'unknown') rampDesc += ` and a ${condition} recorded condition`;
    parts.push(rampDesc + '.');
  }

  // Sentence 3: fee
  if (p.isFeeRequired === 'Yes') {
    let feeStr = 'The source record marks a launch fee as required';
    if (present(p.FeeAmount) && p.FeeAmount !== '0') feeStr += ` ($${displayFeeAmount(p.FeeAmount)})`;
    if (present(p.FeeCollectionType)) feeStr += `; the recorded collection method is ${String(p.FeeCollectionType).trim().toLowerCase()}`;
    parts.push(feeStr + '.');
  } else if (p.isFeeRequired === 'No') {
    parts.push('The source record marks no launch fee.');
  }

  // Sentence 4: dock / restrooms / accessibility
  const extras = [];
  if (hasDock(p.DockType)) {
    extras.push(`a ${cleanListValue(p.DockType).toLowerCase()}`);
  }
  if (hasRestroom(p.RestroomType)) {
    const accessible = p.isRestroomAccessible === 'Yes' ? ' with restroom accessibility recorded' : '';
    extras.push(`${String(p.RestroomType).trim().toLowerCase()} restrooms${accessible}`);
  }
  const trailerSpaces = parseInt(p.Trailer, 10);
  if (!isNaN(trailerSpaces) && trailerSpaces > 0) {
    extras.push(`trailer parking for ${trailerSpaces} vehicle${trailerSpaces !== 1 ? 's' : ''}`);
  }
  if (extras.length > 0) {
    const last = extras.pop();
    const list = extras.length > 0 ? extras.join(', ') + ' and ' + last : last;
    parts.push(`The source record lists ${list}.`);
  }

  // Sentence 5: hours / admin
  if (present(p.Hours) && p.Hours.toLowerCase() !== 'unknown') {
    parts.push(`Source-record hours: ${String(p.Hours).trim()}.`);
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

const sourceArg = process.argv[2];
if (!sourceArg) {
  console.error('Usage: node scripts/import-fl-fwc.mjs <path-to-geojson|--live|--check-live>');
  process.exit(1);
}

const usesLiveSource = sourceArg === '--live' || sourceArg === '--check-live';
if (!usesLiveSource && !EXPLICIT_SNAPSHOT_DATE) {
  console.error('FWC_SNAPSHOT_DATE=YYYY-MM-DD is required when importing a local source file.');
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(SOURCE_SNAPSHOT_DATE)) {
  console.error('FWC_SNAPSHOT_DATE must use YYYY-MM-DD format.');
  process.exit(1);
}

const locationsPath = resolve(__dirname, '../src/data/locations.json');

let geojson;
const checkOnly = sourceArg === '--check-live';
if (usesLiveSource) {
  console.log(`Fetching current FWC GeoJSON from: ${FWC_LAYER_URL}`);
  geojson = await fetchLiveGeoJson();
} else {
  console.log(`Reading GeoJSON from: ${resolve(sourceArg)}`);
  geojson = JSON.parse(readFileSync(resolve(sourceArg), 'utf8'));
}
const features = geojson.features || [];
console.log(`GeoJSON features total: ${features.length}`);

console.log(`Reading locations from: ${locationsPath}`);
const existing = JSON.parse(readFileSync(locationsPath, 'utf8'));
console.log(`\nLocations before: ${existing.length}`);

const priorFwcRecords = existing.filter((r) => r.dataSource === 'FWC_FL');
const baseRecords = existing.filter((r) => r.dataSource !== 'FWC_FL');
const priorRecordsBySourceKey = new Map(priorFwcRecords.map((r) => [fwcSourceKey(r), r]));
console.log(`Prior FWC records removed before refresh: ${priorFwcRecords.length}`);

// Filter FWC features
const eligible = features.filter((f) => {
  const p = f.properties;
  return (
    p.Status === 'Open for Business' &&
    p.AccessType !== 'Government Owned for Restricted Public Use'
  );
}).sort((a, b) => String(a.properties.RampID).localeCompare(String(b.properties.RampID)));
console.log(`FWC features after filter: ${eligible.length} (of ${features.length} total)`);
const minimumEligible = Math.max(MIN_ELIGIBLE_RECORDS, Math.floor(priorFwcRecords.length * 0.85));
if (eligible.length < minimumEligible) {
  throw new Error(`FWC source safety check failed: ${eligible.length} eligible records is below the minimum ${minimumEligible}.`);
}

// Routes are state-scoped, so keep a separate slug set for each state.
const existingSlugsByState = new Map();
for (const record of baseRecords) {
  const stateSlug = String(record.stateSlug ?? '');
  if (!existingSlugsByState.has(stateSlug)) existingSlugsByState.set(stateSlug, new Set());
  existingSlugsByState.get(stateSlug).add(record.slug);
}

// Map to locations schema
const flRecords = eligible.map((f) => {
  const p = f.properties;
  const priorRecord = priorRecordsBySourceKey.get(fwcSourceKey(p));
  const stateName = inferDirectoryState(p, priorRecord?.state);
  const stateSlug = slugify(stateName);
  if (!existingSlugsByState.has(stateSlug)) existingSlugsByState.set(stateSlug, new Set());
  const existingSlugs = existingSlugsByState.get(stateSlug);
  const priorSlug = priorRecord?.slug;
  let slug;
  if (priorSlug && !existingSlugs.has(priorSlug)) {
    slug = priorSlug;
    existingSlugs.add(slug);
  } else {
    slug = makeSlug(p, existingSlugs);
  }

  return {
    name: p.RampName,
    slug,
    state: stateName,
    stateSlug,
    city: present(p.City) ? titleCase(p.City) : '',
    lat: parseFloat(p.Latitude),
    lng: parseFloat(p.Longitude),
    description: generateDescription(p, stateName),
    amenities: deriveAmenities(p),

    // Enriched FWC fields
    dataSource: 'FWC_FL',
    dataSourceDetail: 'Florida Boat Ramp Inventory, FWC-FWRI; normalized by Public Boat Ramps Directory',
    sourceSnapshotDate: SOURCE_SNAPSHOT_DATE,
    sourceOriginalMetadataUrl: FWC_METADATA_URL,
    sourceProcessingNote: 'Filtered to source records marked Open for Business and excluding restricted public use; field names, text casing, slugs, descriptions, and amenity labels were normalized for directory display.',
    rampId: p.RampID,
    rampType: p.RampType,
    accessType: p.AccessType,
    adminEntity: p.PrimaryAdminEntity,
    hours: present(p.Hours) ? String(p.Hours).trim() : null,
    isFeeRequired: p.isFeeRequired,
    feeAmount: present(p.FeeAmount) ? p.FeeAmount : null,
    feeCollectionType: present(p.FeeCollectionType) ? String(p.FeeCollectionType).trim() : null,
    rampSurface: cleanListValue(p.RampSurface),
    rampCondition: present(p.RampCondition) ? String(p.RampCondition).trim() : null,
    singleLanes: p.SingleLanes,
    doubleLanes: p.DoubleLanes,
    totalLanes: p.TotalLanes,
    dockType: hasDock(p.DockType) ? cleanListValue(p.DockType) : null,
    parkingSurface: cleanListValue(p.ParkingSurface),
    parkingCondition: present(p.ParkingCondition) ? String(p.ParkingCondition).trim() : null,
    trailerSpaces: p.Trailer,
    accessibleTrailerSpaces: p.AccessibleTrailer,
    vehicleSpaces: p.Vehicle,
    accessibleVehicleSpaces: p.AccessibleVehicle,
    restroomType: hasRestroom(p.RestroomType) ? String(p.RestroomType).trim() : null,
    isRestroomAccessible: p.isRestroomAccessible,
    accessibilityLevel: present(p.AccessibilityLevel) ? p.AccessibilityLevel : null,
    street: present(p.Street1) ? p.Street1 : null,
    county: present(p.County) ? titleCase(p.County) : null,
    zipCode: p.ZipCode,
    waterType: present(p.WaterType) ? p.WaterType : null,
    waterBodyName: present(p.WaterBodyName) ? p.WaterBodyName : null,
    waterBodySlug: present(p.WaterBodyName) ? slugify(p.WaterBodyName) : null,
    hydrologicalType: present(p.HydrologicalType) ? p.HydrologicalType : null,
    contactPhone: present(p.ContactPhone) ? String(p.ContactPhone).trim() : null,
    externalUrl: present(p.URL) ? p.URL : null,
    hasPhotos: p.hasPhotos === 1,
    lastEditedDate: isoDate(p.last_edited_date),
  };
});

console.log(`FWC records added:      ${flRecords.length}`);

const merged = [...baseRecords, ...flRecords];
console.log(`Total after:            ${merged.length}`);

const retiredRampsPath = resolve(__dirname, '../src/data/retired-ramps.json');
const acknowledgedRetirements = new Set(
  JSON.parse(readFileSync(retiredRampsPath, 'utf8')).map((record) => `${record.stateSlug}/${record.slug}`),
);
const routeRedirectsPath = resolve(__dirname, '../src/data/route-redirects.json');
const reviewedRedirects = new Map(
  JSON.parse(readFileSync(routeRedirectsPath, 'utf8')).map((redirect) => [
    redirect.source.replace(/^\//, ''),
    redirect.destination.replace(/^\//, ''),
  ]),
);
const nextIndexableRoutes = new Set(
  flRecords.filter(isDirectoryIndexable).map((record) => `${record.stateSlug}/${record.slug}`),
);
const unhandledRetirements = priorFwcRecords
  .filter(isDirectoryIndexable)
  .map((record) => `${record.stateSlug}/${record.slug}`)
  .filter((route) => {
    if (nextIndexableRoutes.has(route) || acknowledgedRetirements.has(route)) return false;
    const destination = reviewedRedirects.get(route);
    return !destination || !nextIndexableRoutes.has(destination);
  });
if (unhandledRetirements.length) {
  console.error('Previously published FWC routes require an explicit retirement or replacement review:');
  unhandledRetirements.forEach((route) => console.error(`- /${route}`));
  process.exit(1);
}

if (checkOnly) {
  const comparable = (record) => {
    const copy = { ...record };
    delete copy.sourceSnapshotDate;
    return JSON.stringify(copy);
  };
  const currentByKey = new Map(priorFwcRecords.map((record) => [fwcSourceKey(record), record]));
  const expectedByKey = new Map(flRecords.map((record) => [fwcSourceKey(record), record]));
  const added = [...expectedByKey.keys()].filter((key) => !currentByKey.has(key));
  const removed = [...currentByKey.keys()].filter((key) => !expectedByKey.has(key));
  const changed = [...expectedByKey.keys()].filter(
    (key) => currentByKey.has(key) && comparable(currentByKey.get(key)) !== comparable(expectedByKey.get(key)),
  );

  console.log(`FWC drift check: ${added.length} added, ${removed.length} removed, ${changed.length} changed.`);
  if (added.length || removed.length || changed.length) {
    console.error('FWC source drift detected. Run npm run refresh:fwc, review the data diff, and update source-backed counts before release.');
    process.exit(1);
  }
  console.log('FWC source snapshot matches the current official layer.');
  process.exit(0);
}

// Write
const temporaryLocationsPath = `${locationsPath}.tmp-${process.pid}`;
writeFileSync(temporaryLocationsPath, JSON.stringify(merged, null, 2), 'utf8');
renameSync(temporaryLocationsPath, locationsPath);
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
