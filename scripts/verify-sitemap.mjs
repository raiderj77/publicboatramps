const BASE = "https://publicboatramps.com";

async function text(url) {
  const r = await fetch(url);
  return { status: r.status, body: await r.text() };
}

(async () => {
  console.log("=== robots.txt ===");
  const robots = await text(`${BASE}/robots.txt`);
  console.log(`status: ${robots.status}`);
  console.log(robots.body);

  console.log("\n=== sitemap index ===");
  const idx = await text(`${BASE}/sitemap.xml`);
  console.log(`status: ${idx.status}`);
  console.log(idx.body.slice(0, 500));

  const locs = [...idx.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`\n=== child sitemaps (${locs.length}) ===`);

  let total = 0;
  for (const url of locs) {
    const r = await text(url);
    const count = (r.body.match(/<url>/g) || []).length;
    total += count;
    console.log(`${r.status} ${String(count).padStart(5)} URLs  ${url}`);
  }
  console.log(`\nTOTAL URLs: ${total}`);
  console.log(`Expected:    2535`);
})();
