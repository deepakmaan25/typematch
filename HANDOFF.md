# TypeMatch — Handoff / Working Memory

> Last updated: 2026-05-08
> Live: https://typematch-mu.vercel.app
> Repo: https://github.com/deepakmaan25/typematch
> Project files: `typography-generator/project/`

---

## ⚠ Roadmap direction has changed (2026-04-29)

The roadmap has been rewritten. The previous plan focused on **Phase 4 polish** (Brief-as-home, token consolidation, completing preview templates, ⌘K palette, score-weight tuning, mobile bottom-sheet). That plan is **superseded**.

The new plan shifts toward **font data, richer schema, recommendation quality, ingestion, persistence, and pairing workflows**. See [roadmap.md](roadmap.md) — that file is the single source of truth. The external `typematch-next-level-roadmap.md` document was reconciled into [roadmap.md](roadmap.md) and is no longer treated as a parallel plan.

---

## Where We Are

The v1 app is deployed and the core loop (Brief → Results → Inspect → Preview) works end-to-end. The legacy "Phase 4 polish" lane is paused. We are now starting **Phase 1 — Foundation (data + schema)** under the new roadmap.

---

## What Has Been Built (v1, shipped)

### Shell & navigation (`tm-app.jsx`)
- Persistent app shell with collapsible left rail (54px ↔ 200px, persisted to `localStorage`)
- Views: `home`, `recommend`, `pairing`, `preview`, `collection`, `addfonts`, `saved`, `settings`
- Inspector state lifted to shell (`inspectorTarget`, `setInspectorTarget`)
- Preview font fallback chain: `previewFont → inspectorTarget → results.collection[0] → results.ai[0] → null`
- `handleOpenPreview(font)` — closes inspector, navigates to preview, shows snack
- Stale inspector cleanup: `useEffect` auto-clears `inspectorTarget` when its font leaves results

### Components (`tm-components.jsx`)
- `Btn` (7 variants), `Inspector` (ESC, focus trap, focus return), `Chip`, `Badge`, `RangeSlider`, `Divider`, `Icon`, `EmptyState`, `SectionLabel`
- All components use CSS custom property tokens — no hardcoded colors

### Brief + Recommendations (`tm-recommend.jsx`)
- 4-step wizard: project type → collection → preferences → review
- Local algorithmic multi-dimension scorer (`scoreFont`) across 8 axes
- `ResultCard`, `ResultsLoadingSkeleton`, `RecommendErrorState`, empty state with Refine/Start-over CTAs
- `DetailPanel` — 4-tab inspector (Overview / Score / License / Pairing) with arrow-key roving focus

### Preview Lab (`tm-preview.jsx`)
- 7 templates: Article (production-quality), Hero, Body, Editorial, Brand, Mobile, UI (placeholders)
- Dynamic font injection: any font from Results/Inspector is added to `fontCatalogue`
- **Async font load pipeline** (2026-05-03): `loadFont()` + `document.fonts.load()` replaces fire-and-forget `ensureFontLoaded`. Each font tracks `'loading' | 'loaded' | 'failed'` state. `PreviewCard` renders skeleton/error instead of silently falling back to system fonts.
- **Weight integrity** (2026-05-03): `getSupportedWeights()` + `clampToSupported()` derive support from canonical `weightMin`/`weightMax`. Weight buttons reflect real ranges. `buildGFUrl()` requests only supported weights. `fontWeight` auto-clamps on font selection changes and at init.
- **Weight control accessibility** (2026-05-03): `aria-disabled`, `aria-pressed`, `aria-label` with full context, `role="group"`, always-visible per-weight notes naming blocking fonts.
- Canvas dark/light toggle is independent of app shell theme

### Landing (`tm-landing.jsx`)
Editorial specimen card, "Start matching" + "See sample results" CTAs.

### Deployment
Static site on Vercel (root: `typography-generator/project`). React 18.3.1 production builds with computed SRI hashes. Auto-deploy on `git push origin main`.

---

## Current Priorities (Phase 1 — Foundation, ACTIVE)

In rough order. Sequence may shift, but **all of these come before any of the deferred items below**.

1. ~~**Define the normalized font schema in code**~~ — ✅ Done. `tm-schema.jsx`, `normalizeFont()`, `validateFont()`. All 22 curated fonts valid.
2. ~~**Google Fonts ingestion pipeline**~~ — ✅ Done. 1938-family snapshot (`tm-google-fonts.json`), `enrichGFEntry()`, `initGFMerge()` IIFE, `window.ALL_FONTS` (1938 total), `tm:catalog-updated` event. Scorer uses GF catalog when ready. Verified 2026-05-05.
3. **Catalog expansion** — ✅ Resolved by Step 2. GF snapshot provides 1916 enriched entries. `tm-data.jsx` is now the curated seed/override layer.
4. ~~**Recommendation explainability**~~ — ✅ Done. `buildWhyText` rewritten to mirror scorer signals (mood + use-case via `goodFor`+`useCases` haystack), preserve original case, append heuristic-confidence tag for low-completeness GF entries. Honest, scannable.
5. ~~**Replace "AI" copy**~~ — ✅ Done. Settings: "AI recommendations" → "Library suggestions". Tweak toggle: "AI suggestions" → "Library suggestions". Data sources list rewritten to reflect actual sources. Internal comments cleaned in `tm-data.jsx`, `tm-recommend.jsx`.

Phase 2 (weighted scoring engine, curated pairing cache, Pairing Studio rebuild) and Phase 3 (Supabase/Firebase backend, uploads) follow. See [roadmap.md](roadmap.md).

---

## Superseded / Deferred Priorities

Previously active under the old Phase-4-polish plan. Do **not** start these without explicit go-ahead.

| Old priority | New status |
|---|---|
| Brief-as-home route swap | Deferred — may return during Phase 1 UX polish if it accelerates testing |
| Token consolidation (purple/teal/warm → primary) | Deferred — opportunistic only, not phase-blocking |
| Compare mode skeleton | Reframed — folded into Phase 2 Preview Lab "Compare Fonts" mode |
| Lock-and-regenerate | Reframed — part of Phase 2 Pairing Studio |
| ⌘K command palette | Dropped from active plan |
| Score-weight tuning UI | Dropped from active plan |
| Inspector mobile bottom-sheet | Deferred — mobile stays best-effort |
| Vite migration | Deferred — no longer phase-blocking |
| Real Claude API for brief interpretation | Deferred — structured-scoring + explainability first |
| URL-based routing | Deferred — revisit when Phase 3 persistence makes deep links valuable |
| localStorage for results/library/comparisons | Subsumed — Phase 3 introduces a real backend instead |

---

## Active Constraints

- **No-build static stack** stays for now (Babel standalone + `window.X` globals). A build step is no longer phase-blocking but also not yet justified.
- **Backend is on the plan** (Phase 3, Supabase or Firebase). Do not introduce one ad-hoc — follow phase order.
- **`tm-data.jsx` is the canonical font catalog** until Phase 1 ships Google Fonts ingestion. After that, it becomes a seed/override layer over the live catalog.
- **Route `id` values are frozen** — labels can change, IDs cannot.
- **All chrome colors via CSS custom properties** — no hardcoded `rgba()` or hex in component JSX. Canvas preview colors (`darkBg/bgColor/textColor/subColor`) are a separate intentional system.
- **Definition of Done** still applies (loading + empty + error states, dark + light parity, keyboard nav, reduced-motion, deployed + verified).

---

## What Is Working

- Full Brief → Results → Inspector → Preview flow
- Dark/light mode parity everywhere
- Inspector focus management (trap, return, ESC)
- Dynamic Google Fonts injection in PreviewLab — now async with load/failed states
- Loading, empty, error states on Results
- Vercel auto-deploy on `git push`
- Weight controls reflect actual font weight support (no phantom/unsupported options shown)
- Retry-safe font injection (stale `<link>` cleared before re-attempt)

---

## What Is Incomplete / Known Issues

### Now-relevant gaps (front-loaded by the new roadmap)
- Catalog is small (~30 fonts), hardcoded — addressed in Phase 1
- Metadata is shallow — addressed by the new schema
- "AI" label is misleading — addressed in Phase 1 copy work
- Recommendations don't show "why" — addressed in Phase 1
- Pairing workflow is weak — addressed in Phase 2 (Pairing Studio rebuild)
- No persistence beyond theme + rail collapse — addressed in Phase 3

### Still-open issues (lower priority)
- Hero/Body/Editorial/Brand/Mobile/UI preview templates are basic placeholders (Article is the only production-quality template)
- No URL routing — back button does nothing, no deep links
- Mobile layout is broken in several views
- Babel in-browser cold-start lag (~1–2s)
- ~~`cssFamily` is still borrowed in `OPEN_FONT_LIBRARY` entries~~ — ✅ Resolved by Step 3. GF ingestion provides per-entry loading; `OPEN_FONT_LIBRARY` entries load via their own GF families.
- ~~`source: 'web'` on `OPEN_FONT_LIBRARY` not in canonical enum~~ — ✅ Resolved by Step 3. `initGFMerge()` remaps `source:'web'` → `'open-library'` when snapshot resolves.

---

## Latest Important Decisions

| Decision | Status |
|---|---|
| Roadmap rewritten around data, schema, ingestion, recommendation quality, persistence, pairing | Active (2026-04-29) |
| Preview Lab font load pipeline: async pipeline, weight integrity, a11y polish (3 passes, `tm-preview.jsx` only) | Shipped (2026-05-03) — PR #3 |
| "AI" copy removed from landing and onboarding surfaces | Shipped (2026-05-03, `dbad554`) — Phase 1 Step 5 done |
| **Phase 1 Step 3 — GF ingestion pipeline verified and complete** | **Shipped (2026-05-05)** — 1938 families, all enriched, scorer active, DetailPanel null-guards confirmed |
| **Phase 1 Step 4/5 — Explainability + AI copy cleanup** | **Shipped (2026-05-08)** — `buildWhyText` rewrite, settings/tweak copy, internal comments. Honest structured-scoring language throughout. |
| **Critical bugfix: pairing-studio `const ALL_FONTS` clobbered window.ALL_FONTS** | **Shipped (2026-05-08)** — Babel transpiles `const` → `var` in classic script mode, leaking to window. Renamed to `PAIRING_STUDIO_FONTS`. Without this fix, GF fonts never appeared in scoring results. |
| Google Fonts API integration moved to Phase 1 | ✅ Complete |
| Backend (Supabase/Firebase) planned for Phase 3 | Active |
| Font upload + Local Font Access moved into scope (Phase 3 / Phase 4) | Active |
| Pairing Studio promoted to signature feature | Active |
| Replace "AI" copy with structured-scoring language | Active |
| No build step until justified | Active constraint |
| Route `id` values are frozen | Active constraint |
| Local-first development — Vercel deploy only at roadmap checkpoints | Active constraint (2026-04-30) |
| Brief-as-home route swap | Deferred (was approved-not-shipped) |
| Single chrome accent (primary only) | Deferred (was approved-partial) |

## Step 2 migration findings (2026-04-30) — resolved in Step 3

| Finding | Impact | Resolution |
|---|---|---|
| `source: 'web'` on all `OPEN_FONT_LIBRARY` entries — not in canonical enum | Non-breaking | ✅ `initGFMerge()` remaps `source:'web'` → `'open-library'` on snapshot resolve |
| `OPEN_FONT_LIBRARY` missing `xHeight`, `weight`, `axes`, `variable`, `personality`, `tags`, etc. | Normalizer backfills generic defaults | ✅ `normalizeFont()` + `enrichGFEntry()` provide full schema for all GF entries |
| `cssFamily` is borrowed in `OPEN_FONT_LIBRARY` (e.g. IBM Plex Sans renders as Inter) | Fonts visual-proxy to other loaded fonts in Preview Lab | ✅ GF ingestion provides per-entry CSS loading via `loadFont()` / `buildGFUrl()` |
| `AI_SUGGESTIONS` carries "AI" framing in variable name and UI copy | Misleading; Phase 1 copy work target | Open — copy pass in Phase 1 step 4/5 |

## Step 3 verification findings (2026-05-05)

| Check | Result |
|---|---|
| `window.__GF_CATALOG_READY === true` | ✅ |
| `window.ALL_FONTS.length` | ✅ 1938 (10 curated + 12 open-library + 1916 GF) |
| `window.GF_FONT_LIBRARY.length` | ✅ 1916 |
| All GF entries `completeness === 45` | ✅ 0 anomalies |
| All GF entries `source === 'google-fonts'` | ✅ 0 wrong-source |
| All GF entries `mood.length > 0` | ✅ 0 empty |
| All GF entries `goodFor.length > 0` | ✅ 0 empty |
| All GF entries `contextScore` populated | ✅ 0 missing |
| All GF entries `loaded === false` | ✅ 0 wrong-loaded |
| No empty/missing `family` fields | ✅ 0 empty |
| No duplicates in `ALL_FONTS` | ✅ 0 duplicates |
| `OPEN_FONT_LIBRARY` source remap | ✅ 0 entries with `source:'web'` |
| Roboto `licenseCode === 'Apache'` | ✅ high confidence |
| Noto Sans `licenseCode === 'Apache'` | ✅ high confidence |
| `passesEnrichmentGate()` — all GF entries pass | ✅ 0 gate failures |
| GF fonts appear in scorer results (Nunito: 70, curated Inter: 78) | ✅ completeness damping active |
| `buildGFUrl()` — correct URL format | ✅ weights filtered to declared range |
| Link injection path — `<link>` added to DOM correctly | ✅ |
| `toPreviewEntry()` sets `loaded: false` for GF fonts | ✅ |
| DetailPanel — `wouldRenderBad` fields | ✅ empty (zero crash paths) |
| `variable: null` in License tab | ⚠ Cosmetic only — fixed: `null → '—'` (was `'No'`) |

---

## Blockers / Assumptions

- **Google Fonts API key + quota** — Phase 1 needs a Developer API key. Assume one is obtainable; confirm before implementation.
- **No real AI yet** — until Phase 5+, the scorer remains local and algorithmic. Phase 1 reframes this honestly in UI.
- **Font metadata quality** — the existing ~30 entries have author-defined scores. Phase 1 must define how new entries get their scores (heuristics from Google Fonts metadata, manual curation, or both).
- **Backend choice** — Supabase vs. Firebase is unresolved. Decide before Phase 3 starts.
- **No analytics** — usage data still doesn't exist; prioritization remains qualitative.

---

## Key Files — What to Read First

| File | Why |
|---|---|
| [roadmap.md](roadmap.md) | Single source of truth — direction, phases, decision rules |
| [CLAUDE.md](CLAUDE.md) | Working rules, file layout, what not to do |
| [TypeMatch.html](typography-generator/project/TypeMatch.html) | Entry point, script load order, all CSS tokens |
| [tm-app.jsx](typography-generator/project/tm-app.jsx) | App shell, nav/state wiring, view routing |
| [tm-recommend.jsx](typography-generator/project/tm-recommend.jsx) | Brief wizard, `scoreFont`, Results, DetailPanel |
| [tm-data.jsx](typography-generator/project/tm-data.jsx) | Current font catalog — Phase 1 will reshape this |
| [tm-pairing-studio.jsx](typography-generator/project/tm-pairing-studio.jsx) | Existing pairing view — Phase 2 rebuild target |
| [tm-preview.jsx](typography-generator/project/tm-preview.jsx) | Preview Lab + 7 templates — Phase 2 split target |
| [tm-components.jsx](typography-generator/project/tm-components.jsx) | Shared primitives — check before building new UI |
| [audit.md](audit.md) | Detailed changelog of every phase decision |
