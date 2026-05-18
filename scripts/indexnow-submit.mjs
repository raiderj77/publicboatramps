#!/usr/bin/env node
/**
 * IndexNow submitter for publicboatramps.com
 * Usage:
 *   node scripts/indexnow-submit.mjs [--dry-run] [url1 url2 ...]
 *   echo "https://publicboatramps.com/florida" | node scripts/indexnow-submit.mjs [--dry-run]
 *   node scripts/indexnow-submit.mjs [--dry-run] < scripts/indexnow-today.txt
 */

import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const HOST = 'publicboatramps.com';
const API_URL = 'https://api.indexnow.org/IndexNow';
const BATCH_SIZE = 10_000;

const STATUS_LABELS = {
  200: 'OK — accepted',
  202: 'Accepted (async)',
  400: 'Bad request — malformed payload',
  403: 'Forbidden — key mismatch',
  422: 'Unprocessable — invalid URLs',
  429: 'Rate limited — slow down',
};

function loadKey() {
  const keyPath = join(__dir, '.indexnow-key');
  try {
    return readFileSync(keyPath, 'utf8').trim();
  } catch {
    console.error(`ERROR: Cannot read key from ${keyPath}`);
    process.exit(1);
  }
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function readStdin() {
  if (process.stdin.isTTY) return [];
  const lines = [];
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed) lines.push(trimmed);
  }
  return lines;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const urlArgs = args.filter(a => a !== '--dry-run');

  const stdinUrls = urlArgs.length === 0 ? await readStdin() : [];
  const allUrls = [...urlArgs, ...stdinUrls];

  if (allUrls.length === 0) {
    console.error('ERROR: No URLs provided. Pass as args or pipe via stdin.');
    process.exit(1);
  }

  // Validate
  const invalid = allUrls.filter(u => !u.startsWith(`https://${HOST}/`));
  if (invalid.length > 0) {
    console.error(`ERROR: ${invalid.length} URLs do not start with https://${HOST}/:`);
    invalid.slice(0, 5).forEach(u => console.error(`  ${u}`));
    process.exit(1);
  }

  // Deduplicate
  const urls = [...new Set(allUrls)];
  if (urls.length < allUrls.length) {
    console.log(`Removed ${allUrls.length - urls.length} duplicate(s). ${urls.length} unique URLs.`);
  } else {
    console.log(`${urls.length} URLs to submit.`);
  }

  const key = loadKey();
  const keyLocation = `https://${HOST}/${key}.txt`;
  const batches = chunk(urls, BATCH_SIZE);

  console.log(`Key location: ${keyLocation}`);
  console.log(`Batches: ${batches.length} (max ${BATCH_SIZE} per batch)`);
  if (dryRun) console.log('\n--- DRY RUN — no HTTP requests will be made ---\n');

  let anyFailure = false;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const payload = {
      host: HOST,
      key,
      keyLocation,
      urlList: batch,
    };

    console.log(`\nBatch ${i + 1}/${batches.length} — ${batch.length} URLs`);
    console.log('First 5:');
    batch.slice(0, 5).forEach(u => console.log(`  ${u}`));
    if (batch.length > 5) console.log(`  ... (${batch.length - 5} more)`);

    if (dryRun) {
      console.log('\nPayload (dry run):');
      const preview = { ...payload, urlList: batch.slice(0, 3).concat(batch.length > 3 ? [`... (${batch.length - 3} more)`] : []) };
      console.log(JSON.stringify(preview, null, 2));
      continue;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const label = STATUS_LABELS[res.status] ?? 'Unknown status';
      const ok = res.status === 200 || res.status === 202;
      console.log(`HTTP ${res.status} — ${label}`);
      if (!ok) {
        anyFailure = true;
        const body = await res.text().catch(() => '');
        if (body) console.error(`Response body: ${body}`);
      }
    } catch (err) {
      console.error(`Network error: ${err.message}`);
      anyFailure = true;
    }
  }

  if (anyFailure) {
    console.error('\nOne or more batches failed.');
    process.exit(1);
  } else if (!dryRun) {
    console.log('\nAll batches submitted successfully.');
  }
}

main();
