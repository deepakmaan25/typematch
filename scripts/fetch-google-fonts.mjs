#!/usr/bin/env node
// scripts/fetch-google-fonts.mjs
//
// Offline snapshot script for Google Fonts catalog ingestion.
// Run locally, commit the output. The app reads the snapshot at runtime
// via fetch('./tm-google-fonts.json'). No API key is ever shipped to the browser.
//
// Usage:
//   node scripts/fetch-google-fonts.mjs --key=YOUR_KEY
//   node scripts/fetch-google-fonts.mjs --key YOUR_KEY
//   GOOGLE_FONTS_API_KEY=YOUR_KEY node scripts/fetch-google-fonts.mjs
//   (or place key in scripts/.env as: GOOGLE_FONTS_API_KEY=YOUR_KEY)
//
// Output: typography-generator/project/tm-google-fonts.json
//
// Requirements: Node 18+ (uses built-in fetch and node:fs)
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../typography-generator/project/tm-google-fonts.json');
const GF_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

// ── Key resolution ────────────────────────────────────────────────────────────
// Priority: CLI arg → env var → scripts/.env file

function resolveApiKey() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--key=')) return args[i].slice(6).trim();
    if ((args[i] === '--key' || args[i] === '-k') && args[i + 1]) return args[i + 1].trim();
  }
  if (process.env.GOOGLE_FONTS_API_KEY) return process.env.GOOGLE_FONTS_API_KEY.trim();

  const envPath = resolve(__dirname, '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^GOOGLE_FONTS_API_KEY\s*=\s*(.+)$/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

// ── GF subset → canonical languageSupport tokens ─────────────────────────────

const SUBSET_TO_TOKEN = {
  'latin':                'latin',
  'latin-ext':            'latin-ext',
  'cyrillic':             'cyrillic',
  'cyrillic-ext':         'cyrillic',
  'greek':                'greek',
  'greek-ext':            'greek',
  'vietnamese':           'vietnamese',
  'arabic':               'arabic',
  'hebrew':               'hebrew',
  'thai':                 'thai',
  'devanagari':           'devanagari',
  'chinese-simplified':   'chinese-simplified',
  'chinese-traditional':  'chinese-traditional',
  'japanese':             'japanese',
  'korean':               'korean',
  'khmer':                'khmer',
  'gujarati':             'gujarati',
  'gurmukhi':             'gurmukhi',
  'kannada':              'kannada',
  'bengali':              'bengali',
  'tamil':                'tamil',
  'telugu':               'telugu',
  'myanmar':              'myanmar',
  'tibetan':              'tibetan',
  'ethiopic':             'ethiopic',
  'sinhala':              'sinhala',
};

function normalizeSubsets(subsets) {
  const tokens = new Set();
  for (const s of (subsets || [])) {
    const t = SUBSET_TO_TOKEN[s.toLowerCase()];
    if (t) tokens.add(t);
    // Keep unknown subsets as-is so no coverage data is silently lost
    else tokens.add(s.toLowerCase());
  }
  return [...tokens].sort();
}

// ── Weight derivation from GF variants array ──────────────────────────────────
// Variants are strings like: "100", "200", "regular", "italic", "700italic"
// "regular" and "italic" both represent weight 400.

function parseWeightsFromVariants(variants) {
  const weights = (variants || []).map(v => {
    const stripped = v.replace(/italic$/i, '').trim();
    if (!stripped || stripped === 'regular') return 400;
    const n = parseInt(stripped, 10);
    return Number.isFinite(n) ? n : 400;
  });
  if (!weights.length) return { weightMin: 400, weightMax: 400 };
  return {
    weightMin: Math.min(...weights),
    weightMax: Math.max(...weights),
  };
}

// ── CSS family fallback stack by category ─────────────────────────────────────

const CATEGORY_FALLBACK = {
  'serif':       'serif',
  'sans-serif':  'sans-serif',
  'display':     'cursive',
  'handwriting': 'cursive',
  'monospace':   'monospace',
};

// ── Normalize one GF API item → canonical font shape ─────────────────────────
// Only fields derivable from GF API v1 are populated.
// Absent: mood, personality, tags, readability/screen/editorial scores,
// contrastStyle, xHeight, contextScore, goodFor, avoidFor, notes,
// pairingWith, previewText, yearReleased, trend, completeness.
// These require manual curation or a later enrichment pass.

function normalizeGFEntry(item) {
  const family = item.family;
  const category = (item.category || 'sans-serif').toLowerCase();
  const { weightMin, weightMax } = parseWeightsFromVariants(item.variants);
  const languageSupport = normalizeSubsets(item.subsets);
  const fallback = CATEGORY_FALLBACK[category] || 'sans-serif';

  return {
    // Identity
    id:                  `google-fonts/${family.toLowerCase().replace(/\s+/g, '-')}`,
    family,
    source:              'google-fonts',

    // Classification
    category,
    subcategory:         null,           // not in GF API v1

    // Type properties
    weightMin,
    weightMax,
    variable:            null,           // not deterministic from v1; null = unknown
    axes:                [],             // not in GF API v1

    // Language + licensing
    languageSupport,
    licenseCode:         'OFL',          // all public GF fonts are OFL or Apache 2.0
    licenseConfidence:   'medium',       // inferred from GF hosting, not per-font in API
    license:             'OFL',          // display string

    // Rendering
    cssFamily:           `'${family}', ${fallback}`,
    loaded:              false,

    // GF provenance (for cache invalidation and debugging)
    lastModified:        item.lastModified || null,
    gfVersion:           item.version    || null,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = resolveApiKey();

  if (!apiKey) {
    console.error([
      '',
      'Error: Google Fonts API key not found.',
      '',
      'Provide it via one of:',
      '  --key=YOUR_KEY                        (CLI argument)',
      '  GOOGLE_FONTS_API_KEY=YOUR_KEY node …  (environment variable)',
      '  scripts/.env with GOOGLE_FONTS_API_KEY=YOUR_KEY',
      '',
      'Get a key at: https://developers.google.com/fonts/docs/developer_api',
      '(Enable the "Web Fonts Developer API" in your Google Cloud project)',
      '',
    ].join('\n'));
    process.exit(1);
  }

  const url = `${GF_API_URL}?key=${apiKey}&sort=popularity`;
  console.log('Fetching Google Fonts catalog (sorted by popularity)…');

  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API responded ${res.status}: ${body.slice(0, 300)}`);
    }
    data = await res.json();
  } catch (err) {
    console.error('Fetch failed:', err.message);
    process.exit(1);
  }

  const items = Array.isArray(data.items) ? data.items : [];
  if (!items.length) {
    console.error('API returned zero items. Check your key and quota.');
    process.exit(1);
  }
  console.log(`Received ${items.length} font families from API.`);

  const fonts = items.map(normalizeGFEntry);

  const output = {
    meta: {
      fetchedAt:     new Date().toISOString(),
      totalFamilies: fonts.length,
      apiVersion:    'v1',
      sortedBy:      'popularity',
      note:          'Generated by scripts/fetch-google-fonts.mjs. Do not edit manually. Regenerate with a valid Google Fonts API key.',
    },
    fonts,
  };

  const json = JSON.stringify(output, null, 2);
  writeFileSync(OUT_PATH, json, 'utf8');

  const sizeKB = Math.round(json.length / 1024);
  console.log(`\nSnapshot written to: ${OUT_PATH}`);
  console.log(`Size: ~${sizeKB} KB  |  Fonts: ${fonts.length}`);

  // Category breakdown
  const byCategory = {};
  for (const f of fonts) byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  console.log('\nCategory breakdown:');
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(14)} ${count}`);
  }

  // Null-variable summary (how many entries have variable: null)
  const nullVariable = fonts.filter(f => f.variable === null).length;
  console.log(`\nvariable: null on ${nullVariable}/${fonts.length} entries`);
  console.log('(expected — GF API v1 does not expose a variable font flag)');

  console.log('\nDone. Commit typography-generator/project/tm-google-fonts.json to the repo.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
