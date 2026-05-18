import fs from "node:fs";

const locations = JSON.parse(fs.readFileSync("src/data/locations.json", "utf8"));

// Florida bounding box (generous): lat 24.4-31.05, lng -87.7 to -79.95
// Anything outside this with stateSlug "florida" is misclassified
const FL_BOUNDS = { latMin: 24.4, latMax: 31.05, lngMin: -87.7, lngMax: -79.95 };

const flagged = [];
for (const loc of locations) {
  if (loc.stateSlug !== "florida") continue;
  const lat = loc.lat ?? loc.latitude;
  const lng = loc.lng ?? loc.longitude ?? loc.lon;
  if (lat == null || lng == null) continue;
  if (lat < FL_BOUNDS.latMin || lat > FL_BOUNDS.latMax || lng < FL_BOUNDS.lngMin || lng > FL_BOUNDS.lngMax) {
    flagged.push({
      slug: loc.slug,
      name: loc.name,
      lat, lng,
      source: loc.source ?? loc.dataSource,
      county: loc.county,
      reason: lng < FL_BOUNDS.lngMin ? "west of FL (AL?)" : lng > FL_BOUNDS.lngMax ? "east of FL (Bahamas?)" : lat < FL_BOUNDS.latMin ? "south of FL" : "north of FL (GA?)"
    });
  }
}

console.log(`Total FL-tagged records: ${locations.filter(l => l.stateSlug === "florida").length}`);
console.log(`Outside FL bounding box: ${flagged.length}`);
console.log("");
console.log(JSON.stringify(flagged, null, 2));
