# TypeMatch — Handoff / Working Memory

> Last updated: 2026-04-29
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
- `ensureFontLoaded(name)` — appends Google Fonts `<link>` idempotently
- Canvas dark/light toggle is independent of app shell theme

### Landing (`tm-landing.jsx`)
Editorial specimen card, "Start matching" + "See sample results" CTAs.

### Deployment
Static site on Vercel (root: `typography-generator/project`). React 18.3.1 production builds with computed SRI hashes. Auto-deploy on `git push origin main`.

---

## Current Priorities (Phase 1 — Foundation, ACTIVE)

In rough order. Sequence may shift, but **all of these come before any of the deferred items below**.

1. **Define the normalized font schema in code** — match the target shape in [roadmap.md](roadmap.md). Decide where it lives (`tm-data.jsx` extension vs. a dedicated `tm-schema.jsx`).
2. **Google Fonts ingestion pipeline** — pull family metadata via the Developer API, render via the CSS API. Cache normalized metadata locally; do not fetch at scoring time.
3. **Catalog expansion** — grow well beyond the ~30 hardcoded fonts in `tm-data.jsx`. Treat the existing entries as a curated seed/override layer.
4. **Recommendation explainability** — every result card surfaces a "why this works" string. This unblocks the trust problem with the current "AI" label.
5. **Replace "AI" copy** — UI strings ("Get recommendations · auto_awesome", any "AI" badges) become honest structured-scoring language.

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
- Dynamic Google Fonts injection in PreviewLab
- Loading, empty, error states on Results
- Vercel auto-deploy on `git push`

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

---

## Latest Important Decisions

| Decision | Status |
|---|---|
| Roadmap rewritten around data, schema, ingestion, recommendation quality, persistence, pairing | Active (2026-04-29) |
| Google Fonts API integration moved to Phase 1 | Active |
| Backend (Supabase/Firebase) planned for Phase 3 | Active |
| Font upload + Local Font Access moved into scope (Phase 3 / Phase 4) | Active |
| Pairing Studio promoted to signature feature | Active |
| Replace "AI" copy with structured-scoring language | Active |
| No build step until justified | Active constraint |
| Route `id` values are frozen | Active constraint |
| Local-first development — Vercel deploy only at roadmap checkpoints | Active constraint (2026-04-30) |
| Brief-as-home route swap | Deferred (was approved-not-shipped) |
| Single chrome accent (primary only) | Deferred (was approved-partial) |

## Step 2 migration findings (2026-04-30)

Recorded for Step 3 awareness — no action required now.

| Finding | Impact | Resolution |
|---|---|---|
| `source: 'web'` on all `OPEN_FONT_LIBRARY` entries — not in canonical enum | Non-breaking; recommender overrides `source` at results-assembly time | Remap to `'open-library'` in same commit as GF ingestion (Step 3) |
| `OPEN_FONT_LIBRARY` missing `xHeight`, `weight`, `axes`, `variable`, `personality`, `tags`, etc. | Normalizer backfills generic defaults; scorer null-guards all of these | Populated by GF metadata snapshot in Step 3 |
| `cssFamily` is borrowed in `OPEN_FONT_LIBRARY` (e.g. IBM Plex Sans renders as Inter) | Pre-existing data issue; fonts visual-proxy to other loaded fonts in Preview Lab | Fixed when `ensureFontLoaded` is wired per-entry in Step 3 |
| `AI_SUGGESTIONS` carries "AI" framing in variable name and UI copy | Misleading; Phase 1 copy work target | Copy pass in Phase 1 step 5–6 |

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
