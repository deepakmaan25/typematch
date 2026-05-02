// tm-schema.jsx — TypeMatch normalized font schema (Phase 1)
//
// Canonical font shape used by the recommender, preview lab, and ingestion
// pipelines from Phase 1 onward. This file is a contract + a pure
// conversion helper. It does not mutate tm-data.jsx and is not wired into
// TypeMatch.html until Step 2 (migration) runs.
//
// Loaded via window.TMSchema for downstream consumers.
// ───────────────────────────────────────────────────────────────────

// Canonical field shape. Comments mark what is required, what is optional,
// and what extends the roadmap minimum with TypeMatch-specific intelligence
// (kept so the existing scorer and UI keep working through migration).
const FONT_SCHEMA = {
  // ─── Identity ─────────────────────────────────────────────────
  id:                   'string',          // stable, unique
  family:               'string',          // canonical name; alias of legacy `name`
  source:               'string',          // 'curated' | 'open-library' | 'google-fonts' | 'upload' | 'local'
  foundry:              'string?',         // optional, display

  // ─── Classification ───────────────────────────────────────────
  category:             'string',          // 'serif' | 'sans-serif' | 'display' | 'monospace' | 'handwriting'
  subcategory:          'string?',         // 'neo-grotesk' | 'old-style' | 'transitional' | 'geometric' | etc.

  // ─── Vibe / brand fit (lowercased everywhere) ─────────────────
  mood:                 'string[]',
  personality:          'string[]',
  tags:                 'string[]',

  // ─── Quantitative scoring inputs (0–100) ──────────────────────
  readability:          'number',          // body comfort
  screenSuitability:    'number',          // rasterization, hinting, x-height
  editorialSuitability: 'number',          // print + editorial fit (replaces legacy printSuitability)

  // ─── Type properties ──────────────────────────────────────────
  contrastStyle:        'string',          // 'low' | 'medium' | 'high' | 'variable'
  xHeight:              'string',          // 'low' | 'medium' | 'high'
  weightMin:            'number',          // numeric, e.g. 100
  weightMax:            'number',          // numeric, e.g. 900
  variable:             'boolean',
  axes:                 'string[]',        // ['wght','opsz','slnt','ital',...]

  // ─── Language + licensing ─────────────────────────────────────
  languageSupport:      'string[]',        // tokens: 'latin','latin-ext','cyrillic','greek','vietnamese','arabic','hebrew','thai'
  licenseCode:          'string',          // canonical: 'OFL' | 'Apache' | 'SIL' | 'Commercial' | 'Unknown'
  licenseConfidence:    'string',          // 'high' | 'medium' | 'low'
  license:              'string',          // legacy display string, preserved for UI continuity (e.g. 'OFL (Free)')

  // ─── Rendering ────────────────────────────────────────────────
  cssFamily:            'string',          // CSS family stack ("'Inter', system-ui, sans-serif")
  loaded:               'boolean',         // true if a stylesheet for this family is already linked

  // ─── TypeMatch-specific extensions (kept for recommender continuity) ─
  useCases:             'string[]?',
  brandFit:             'string[]?',
  pairingWith:          'string[]?',
  contextScore:         'object?',         // { saas:0-100, editorial:..., fintech:..., ... }
  goodFor:              'string[]?',
  avoidFor:             'string[]?',
  notes:                'string?',
  previewText:          'string?',
  yearReleased:         'number?',
  trend:                'string?',         // 'emerging' | 'established' | 'classic'
  completeness:         'number?',         // 0–100 metadata health
};

// Legacy → canonical field aliases. Read-only documentation; normalizeFont
// applies these explicitly and does not consult this map at runtime.
const LEGACY_FIELD_MAP = {
  name:               'family',
  classification:     'category',
  subtype:             'subcategory',
  fontFamily:         'cssFamily',
  contrast:           'contrastStyle',
  printSuitability:   'editorialSuitability',
  languages:          'languageSupport',
  weight:             'weightMin/weightMax (parsed)',
};

const CATEGORY_NORMALIZATION = {
  'serif':         'serif',
  'sans-serif':    'sans-serif',
  'sans serif':    'sans-serif',
  'display':       'display',
  'monospace':     'monospace',
  'mono':          'monospace',
  'handwriting':   'handwriting',
  'script':        'handwriting',
};

const CONTRAST_NORMALIZATION = {
  'low':      'low',
  'medium':   'medium',
  'high':     'high',
  'variable': 'variable',
};

const XHEIGHT_NORMALIZATION = {
  'low':    'low',
  'medium': 'medium',
  'high':   'high',
};

const LICENSE_NORMALIZATION = {
  'OFL (Free)':        { license: 'OFL',    confidence: 'high' },
  'OFL':               { license: 'OFL',    confidence: 'high' },
  'SIL OFL':           { license: 'OFL',    confidence: 'high' },
  'Apache 2.0 (Free)': { license: 'Apache', confidence: 'high' },
  'Apache 2.0':        { license: 'Apache', confidence: 'high' },
  'SIL':               { license: 'SIL',    confidence: 'high' },
};

// Order matters: more specific fragments must match before generic 'latin'.
const LANGUAGE_TOKEN_MAP = [
  [/pan-european/i,   ['latin', 'latin-ext', 'cyrillic', 'greek']],
  [/latin extended/i, ['latin', 'latin-ext']],
  [/cyrillic/i,       ['cyrillic']],
  [/greek/i,          ['greek']],
  [/vietnamese/i,     ['vietnamese']],
  [/arabic/i,         ['arabic']],
  [/hebrew/i,         ['hebrew']],
  [/thai/i,           ['thai']],
  [/latin/i,          ['latin']],
];

function parseWeightRange(raw) {
  if (typeof raw !== 'string') return { weightMin: 400, weightMax: 700 };
  const range = raw.match(/(\d{2,4})\s*[-–]\s*(\d{2,4})/);
  if (range) return { weightMin: +range[1], weightMax: +range[2] };
  const single = raw.match(/^\s*(\d{2,4})\s*$/);
  if (single) return { weightMin: +single[1], weightMax: +single[1] };
  return { weightMin: 400, weightMax: 700 };
}

function parseLanguageSupport(raw) {
  if (Array.isArray(raw)) return raw.map(s => String(s).toLowerCase());
  if (typeof raw !== 'string') return ['latin'];
  const tokens = new Set();
  LANGUAGE_TOKEN_MAP.forEach(([re, toks]) => {
    if (re.test(raw)) toks.forEach(t => tokens.add(t));
  });
  if (!tokens.size) tokens.add('latin');
  return [...tokens];
}

function parseLicense(raw) {
  if (!raw) return { license: 'Unknown', licenseConfidence: 'low' };
  const exact = LICENSE_NORMALIZATION[raw];
  if (exact) return { license: exact.license, licenseConfidence: exact.confidence };
  if (/OFL/i.test(raw))         return { license: 'OFL',        licenseConfidence: 'high' };
  if (/Apache/i.test(raw))      return { license: 'Apache',     licenseConfidence: 'high' };
  if (/SIL/i.test(raw))         return { license: 'SIL',        licenseConfidence: 'high' };
  if (/commercial/i.test(raw))  return { license: 'Commercial', licenseConfidence: 'medium' };
  if (/free/i.test(raw))        return { license: 'Unknown',    licenseConfidence: 'medium' };
  return { license: 'Unknown', licenseConfidence: 'low' };
}

const lc = (arr) => Array.isArray(arr) ? arr.map(s => String(s).toLowerCase()) : [];

// Pure function: legacy font → canonical font.
// Preserves all extension fields. Keeps legacy aliases on the same object so
// existing consumers (scoreFont, ResultCard, DetailPanel) continue to work
// during migration. Step 2 wires this into the data load; Step N+ may drop
// the alias layer once all consumers are migrated.
function normalizeFont(legacy) {
  if (!legacy || typeof legacy !== 'object') return null;
  const out = { ...legacy };

  // Identity
  out.family = legacy.family || legacy.name || '';
  out.id     = String(legacy.id ?? out.family.toLowerCase().replace(/\s+/g, '-'));
  out.source = legacy.source || 'curated';

  // Classification
  const rawCat = String(legacy.category || legacy.classification || '').toLowerCase().trim();
  out.category = CATEGORY_NORMALIZATION[rawCat] || rawCat || 'sans-serif';
  const rawSub = String(legacy.subcategory || legacy.subtype || '').toLowerCase().trim();
  out.subcategory = rawSub || null;

  // Vibe
  out.mood        = lc(legacy.mood);
  out.personality = lc(legacy.personality);
  out.tags        = lc(legacy.tags);

  // Numeric scores
  out.readability          = Number.isFinite(+legacy.readability)         ? +legacy.readability         : 70;
  out.screenSuitability    = Number.isFinite(+legacy.screenSuitability)   ? +legacy.screenSuitability   : 70;
  const editorial = legacy.editorialSuitability ?? legacy.printSuitability;
  out.editorialSuitability = Number.isFinite(+editorial) ? +editorial : 70;

  // Type properties
  const rawContrast = String(legacy.contrastStyle || legacy.contrast || '').toLowerCase();
  out.contrastStyle = CONTRAST_NORMALIZATION[rawContrast] || 'medium';
  const rawX = String(legacy.xHeight || '').toLowerCase();
  out.xHeight = XHEIGHT_NORMALIZATION[rawX] || 'medium';
  if (typeof legacy.weight === 'string') {
    Object.assign(out, parseWeightRange(legacy.weight));
  } else {
    out.weightMin = Number.isFinite(+legacy.weightMin) ? +legacy.weightMin : 400;
    out.weightMax = Number.isFinite(+legacy.weightMax) ? +legacy.weightMax : 700;
  }
  out.variable = (legacy.variable == null) ? null : !!legacy.variable; // null = unknown (GF v1 can't determine this)
  out.axes     = Array.isArray(legacy.axes) ? legacy.axes.slice() : [];

  // Language + licensing
  out.languageSupport = parseLanguageSupport(legacy.languageSupport ?? legacy.languages);
  const lic = parseLicense(legacy.license);
  out.licenseCode       = lic.license;
  out.licenseConfidence = legacy.licenseConfidence || lic.licenseConfidence;
  // out.license is preserved by the spread (`{...legacy}`) above for UI continuity.

  // Rendering
  out.cssFamily = legacy.cssFamily || legacy.fontFamily || `'${out.family}', sans-serif`;
  out.loaded    = legacy.loaded !== false;

  // Backwards-compat aliases — only set when not already present from the
  // spread, so legacy casing/values are preserved for existing consumers
  // (scoreFont, ResultCard, DetailPanel). Drop these once consumers migrate.
  if (!out.name)               out.name             = out.family;
  if (!out.classification)     out.classification   = out.category;
  if (!out.subtype)            out.subtype          = out.subcategory || '';
  if (!out.fontFamily)         out.fontFamily       = out.cssFamily;
  if (!out.contrast)           out.contrast         = out.contrastStyle;
  if (out.printSuitability == null) out.printSuitability = out.editorialSuitability;
  if (!out.languages)          out.languages        = out.languageSupport.join(' + ');

  return out;
}

// Light validation: returns array of human-readable issues (empty = valid).
function validateFont(font) {
  const issues = [];
  if (!font || typeof font !== 'object') return ['not an object'];
  if (!font.family)                            issues.push('missing family');
  if (!font.id)                                issues.push('missing id');
  if (!font.category)                          issues.push('missing category');
  if (!Number.isFinite(font.readability))      issues.push('invalid readability');
  if (!Number.isFinite(font.screenSuitability)) issues.push('invalid screenSuitability');
  if (!Number.isFinite(font.weightMin) ||
      !Number.isFinite(font.weightMax))        issues.push('invalid weight range');
  if (!Array.isArray(font.languageSupport) ||
      !font.languageSupport.length)            issues.push('missing languageSupport');
  return issues;
}

const PAIRING_SCHEMA = {
  id:                   'string',
  headingFontId:        'string',
  bodyFontId:           'string',
  context:              'string[]',         // ['editorial','branding','saas',...]
  contrastScore:        'number',           // 0–100
  harmonyScore:         'number',
  readabilityScore:     'number',
  distinctivenessScore: 'number',
  overallScore:         'number',
  explainability:       'string[]',         // 1–3 bullets
};

window.TMSchema = {
  FONT_SCHEMA, PAIRING_SCHEMA,
  LEGACY_FIELD_MAP,
  CATEGORY_NORMALIZATION, CONTRAST_NORMALIZATION, XHEIGHT_NORMALIZATION,
  LICENSE_NORMALIZATION, LANGUAGE_TOKEN_MAP,
  parseWeightRange, parseLanguageSupport, parseLicense,
  normalizeFont, validateFont,
};
