import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── State abbreviation → full name ────────────────────────────────────────────
const STATE_NAMES = {
  AL:'Alabama', AK:'Alaska', AZ:'Arizona', AR:'Arkansas', CA:'California',
  CO:'Colorado', CT:'Connecticut', DE:'Delaware', FL:'Florida', GA:'Georgia',
  HI:'Hawaii', ID:'Idaho', IL:'Illinois', IN:'Indiana', IA:'Iowa',
  KS:'Kansas', KY:'Kentucky', LA:'Louisiana', ME:'Maine', MD:'Maryland',
  MA:'Massachusetts', MI:'Michigan', MN:'Minnesota', MS:'Mississippi',
  MO:'Missouri', MT:'Montana', NE:'Nebraska', NV:'Nevada', NH:'New Hampshire',
  NJ:'New Jersey', NM:'New Mexico', NY:'New York', NC:'North Carolina',
  ND:'North Dakota', OH:'Ohio', OK:'Oklahoma', OR:'Oregon', PA:'Pennsylvania',
  RI:'Rhode Island', SC:'South Carolina', SD:'South Dakota', TN:'Tennessee',
  TX:'Texas', UT:'Utah', VT:'Vermont', VA:'Virginia', WA:'Washington',
  WV:'West Virginia', WI:'Wisconsin', WY:'Wyoming',
};

const VALID_STATE_NAMES = new Set(Object.values(STATE_NAMES));

// ── Utilities ─────────────────────────────────────────────────────────────────
function slugify(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function titleCase(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// Haversine distance in metres
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function makeSlug(name, county, existingSlugs) {
  const base = slugify(`${name}-${county || 'unknown'}`);
  if (!existingSlugs.has(base)) {
    existingSlugs.add(base);
    return base;
  }
  let n = 2;
  while (true) {
    const candidate = `${base}-${n}`;
    if (!existingSlugs.has(candidate)) {
      existingSlugs.add(candidate);
      return candidate;
    }
    n++;
  }
}

// ── CSV parser (handles quoted fields) ───────────────────────────────────────
function parseCSV(text) {
  // Strip UTF-8 BOM if present
  const stripped = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  const lines = stripped.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const headers = splitCSVRow(lines[0]);
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVRow(line);
    const record = {};
    headers.forEach((h, idx) => { record[h.trim()] = (values[idx] ?? '').trim(); });
    records.push(record);
  }
  return records;
}

function splitCSVRow(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const csvPath   = resolve(__dirname, '../data/USGS_BoatRamps.csv');
  const locationsPath = resolve(__dirname, '../src/data/locations.json');

  if (!existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    console.error('Download from: https://www.sciencebase.gov/catalog/item/63b81b50d34e92aad3cc004d');
    console.error('Save as: data/USGS_BoatRamps.csv');
    process.exit(1);
  }

  // ── Backup ────────────────────────────────────────────────────────────────
  const backupTs = new Date().toISOString().replace(/:/g, '-').replace(/\.\d+Z$/, '');
  const backupPath = `${locationsPath}.backup-${backupTs}`;
  copyFileSync(locationsPath, backupPath);
  console.log(`Backup created: ${backupPath}`);

  // ── Load existing data ────────────────────────────────────────────────────
  const existing = JSON.parse(readFileSync(locationsPath, 'utf8'));
  console.log(`Existing records: ${existing.length}`);

  const existingSlugs = new Set(existing.map(r => r.slug));

  // ── Parse USGS CSV ────────────────────────────────────────────────────────
  console.log('\nParsing USGS CSV...');
  const rawRows = parseCSV(readFileSync(csvPath, 'utf8'));
  console.log(`CSV rows loaded: ${rawRows.length}`);

  // Validate rows and skip non-US-state records (territories)
  let skippedBadCoords   = 0;
  let skippedNoName      = 0;
  let skippedTerritory   = 0;
  let skippedPrivate     = 0;
  const validRows = [];

  for (const row of rawRows) {
    const lat = parseFloat(row.Latitude);
    const lng = parseFloat(row.Longitude);
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) { skippedBadCoords++; continue; }
    if (!row.AccessName || !row.AccessName.trim()) { skippedNoName++; continue; }
    const stateName = (row.State || '').trim();
    if (!VALID_STATE_NAMES.has(stateName)) { skippedTerritory++; continue; }
    if ((row.Type || '').trim() !== 'Public') { skippedPrivate++; continue; }
    validRows.push({ ...row, _lat: lat, _lng: lng, _stateName: stateName });
  }

  console.log(`Valid rows after pre-filter: ${validRows.length}`);
  console.log(`  Skipped bad coords:  ${skippedBadCoords}`);
  console.log(`  Skipped no name:     ${skippedNoName}`);
  console.log(`  Skipped territories: ${skippedTerritory}`);
  console.log(`  Skipped private:     ${skippedPrivate}`);

  // ── Dedupe and merge ──────────────────────────────────────────────────────
  console.log('\nDeduplicating and merging...');

  // Working copy of existing — we'll mutate this list (replace OSM records in place)
  const merged = [...existing];
  // Index for fast proximity lookup: we'll just iterate (24k × 8k is ~200M ops — too slow)
  // Instead bucket by rounded lat/lng (0.001° ≈ 111m) for a fast pre-filter
  const spatialIndex = new Map();
  const bucketKey = (lat, lng) => `${(lat * 100).toFixed(0)}_${(lng * 100).toFixed(0)}`;

  merged.forEach((r, idx) => {
    const rLat = parseFloat(r.lat);
    const rLng = parseFloat(r.lng);
    if (isNaN(rLat) || isNaN(rLng)) return;
    const key = bucketKey(rLat, rLng);
    if (!spatialIndex.has(key)) spatialIndex.set(key, []);
    spatialIndex.get(key).push(idx);
  });

  function findNearby(lat, lng) {
    // Check the 3×3 grid of buckets around the point
    const bLat = Math.round(lat * 100);
    const bLng = Math.round(lng * 100);
    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLng = -1; dLng <= 1; dLng++) {
        const key = `${bLat + dLat}_${bLng + dLng}`;
        const bucket = spatialIndex.get(key);
        if (!bucket) continue;
        for (const idx of bucket) {
          const r = merged[idx];
          const rLat = parseFloat(r.lat);
          const rLng = parseFloat(r.lng);
          if (haversine(lat, lng, rLat, rLng) < 50) return { idx, record: r };
        }
      }
    }
    return null;
  }

  let skippedFwc      = 0;
  let replacedOsm     = 0;
  let added           = 0;
  const stateCounts   = {};
  const replacedLog   = []; // for sample reporting

  for (const row of validRows) {
    const lat = row._lat;
    const lng = row._lng;
    const stateName = row._stateName;
    const name      = titleCase(row.AccessName.trim());
    const county    = row.County ? titleCase(row.County.trim()) : null;

    const nearby = findNearby(lat, lng);

    if (nearby) {
      const src = nearby.record.dataSource;
      if (src === 'FWC_FL') {
        // FWC is richer — keep FWC, skip USGS
        skippedFwc++;
        continue;
      }
      if (!src || src === undefined) {
        // OSM record — replace with USGS
        const oldRecord = { ...nearby.record };
        const slug = nearby.record.slug; // keep existing slug to preserve URLs
        const usgsRecord = buildRecord(row, name, county, stateName, slug);
        merged[nearby.idx] = usgsRecord;
        // Update spatial index entry (lat/lng might differ slightly — keep same idx)
        replacedLog.push({ old: oldRecord, new: usgsRecord });
        replacedOsm++;
        stateCounts[stateName] = (stateCounts[stateName] || 0) + 1;
        continue;
      }
      // Any other source (RIDB etc.) — skip USGS
      skippedFwc++; // reuse counter label as "skipped existing"
      continue;
    }

    // No nearby match — add new record
    const slug = makeSlug(name, county, existingSlugs);
    const usgsRecord = buildRecord(row, name, county, stateName, slug);
    merged.push(usgsRecord);

    // Add to spatial index
    const key = bucketKey(lat, lng);
    if (!spatialIndex.has(key)) spatialIndex.set(key, []);
    spatialIndex.get(key).push(merged.length - 1);

    added++;
    stateCounts[stateName] = (stateCounts[stateName] || 0) + 1;
  }

  // ── Write output ──────────────────────────────────────────────────────────
  writeFileSync(locationsPath, JSON.stringify(merged, null, 2), 'utf8');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n═══ IMPORT SUMMARY ════════════════════════════════════════');
  console.log(`USGS rows loaded:              ${rawRows.length}`);
  console.log(`Valid after pre-filter:        ${validRows.length}`);
  console.log(`Skipped — duplicate of FWC/other existing: ${skippedFwc}`);
  console.log(`Replaced OSM records:          ${replacedOsm}`);
  console.log(`New records added:             ${added}`);
  console.log(`Final total:                   ${merged.length}`);

  console.log('\nPer-state breakdown (new + replaced):');
  Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).forEach(([s, n]) => {
    console.log(`  ${s.padEnd(22)} ${n}`);
  });

  // 3 sample new records from CA, TX, MN
  console.log('\n── Sample new USGS records ─────────────────────────────────');
  const targets = ['California', 'Texas', 'Minnesota'];
  const newRecords = merged.filter(r => r.dataSource === 'USGS' && targets.includes(r.state));
  targets.forEach(st => {
    const r = newRecords.find(x => x.state === st);
    if (!r) { console.log(`\n[${st}] — no USGS record found`); return; }
    console.log(`\n[${st}]`);
    console.log(`  name:          ${r.name}`);
    console.log(`  slug:          ${r.slug}`);
    console.log(`  county:        ${r.county}`);
    console.log(`  lat/lng:       ${r.lat}, ${r.lng}`);
    console.log(`  waterBodyName: ${r.waterBodyName ?? '(none)'}`);
    console.log(`  rampType:      ${r.rampType ?? '(none)'}`);
    console.log(`  watershed:     ${r.watershed ?? '(none)'}`);
    console.log(`  dataSource:    ${r.dataSource}`);
    console.log(`  dataSourceDetail: ${r.dataSourceDetail ?? '(none)'}`);
  });

  // 1 sample OSM→USGS replacement
  if (replacedLog.length > 0) {
    const ex = replacedLog[0];
    console.log('\n── OSM → USGS replacement example ─────────────────────────');
    console.log('BEFORE (OSM):');
    console.log(`  name:       ${ex.old.name}`);
    console.log(`  slug:       ${ex.old.slug}`);
    console.log(`  lat/lng:    ${ex.old.lat}, ${ex.old.lng}`);
    console.log(`  dataSource: ${ex.old.dataSource ?? '(OSM/undefined)'}`);
    console.log(`  amenities:  ${(ex.old.amenities || []).join(', ')}`);
    console.log('AFTER (USGS):');
    console.log(`  name:       ${ex.new.name}`);
    console.log(`  slug:       ${ex.new.slug}`);
    console.log(`  lat/lng:    ${ex.new.lat}, ${ex.new.lng}`);
    console.log(`  dataSource: ${ex.new.dataSource}`);
    console.log(`  county:     ${ex.new.county}`);
    console.log(`  waterBodyName: ${ex.new.waterBodyName ?? '(none)'}`);
    console.log(`  watershed:  ${ex.new.watershed ?? '(none)'}`);
  }

  console.log(`\nWritten to ${locationsPath}`);
}

// ── Record builder ────────────────────────────────────────────────────────────
function buildRecord(row, name, county, stateName, slug) {
  const wb = (row.OriginalWB && row.OriginalWB.trim() && row.OriginalWB.trim().toLowerCase() !== 'unknown')
    ? titleCase(row.OriginalWB.trim()) : null;
  const hucName = (row.HUC12_Name && row.HUC12_Name.trim() && row.HUC12_Name.trim().toUpperCase() !== 'N/A')
    ? titleCase(row.HUC12_Name.trim()) : null;
  const dataSourceDetail = (row.DataSource && row.DataSource.trim()) ? row.DataSource.trim() : null;
  const accessType = (row.Type && row.Type.trim()) ? row.Type.trim() : null;

  return {
    name,
    slug,
    state:     stateName,
    stateSlug: slugify(stateName),
    city:      null,
    lat:       row._lat,
    lng:       row._lng,
    description:    null,
    amenities:      ['Boat launch', 'Public access'],

    dataSource:       'USGS',
    dataSourceDetail,
    rampId:           row.OID_ ? String(row.OID_) : null,
    rampType:         null,
    accessType,
    adminEntity:      null,
    hours:            null,
    isFeeRequired:    null,
    feeAmount:        null,
    feeCollectionType: null,
    rampSurface:      null,
    rampCondition:    null,
    singleLanes:      null,
    doubleLanes:      null,
    totalLanes:       null,
    dockType:         null,
    parkingSurface:   null,
    parkingCondition: null,
    trailerSpaces:    null,
    accessibleTrailerSpaces: null,
    vehicleSpaces:    null,
    accessibleVehicleSpaces: null,
    restroomType:     null,
    isRestroomAccessible: null,
    accessibilityLevel: null,
    street:           null,
    county,
    zipCode:          null,
    waterType:        null,
    waterBodyName:    wb,
    waterBodySlug:    wb ? slugify(wb) : null,
    hydrologicalType: null,
    watershed:        hucName,
    contactPhone:     null,
    externalUrl:      null,
    hasPhotos:        false,
    lastEditedDate:   '2023-01-31',
  };
}

main().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
