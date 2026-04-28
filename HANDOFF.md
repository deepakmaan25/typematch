# TypeMatch — Handoff / Working Memory

> Last updated: 2026-04-28  
> Live: https://typematch-mu.vercel.app  
> Repo: https://github.com/deepakmaan25/typematch  
> Project files: `typography-generator/project/`

---

## Where We Are

Phase 3 is functionally complete and the app is deployed to production on Vercel. The core loop — Brief → Results → Inspect → Preview — is working end-to-end. Phase 4 (polish + completeness) has not started.

---

## What Has Been Built

### Shell & navigation (`tm-app.jsx`)
- Persistent app shell with collapsible left rail (54px ↔ 200px, persisted to `localStorage`)
- Views: `home`, `recommend`, `pairing`, `preview`, `collection`, `addfonts`, `saved`, `settings`
- Inspector state lifted to shell (`inspectorTarget`, `setInspectorTarget`)
- Preview font fallback chain: `previewFont → inspectorTarget → results.collection[0] → results.ai[0] → null`
- `handleOpenPreview(font)` — closes inspector, navigates to preview, shows snack
- Stale inspector cleanup: `useEffect` auto-clears `inspectorTarget` when its font leaves results

### Components (`tm-components.jsx`)
- `Btn` — 7 variants (primary/tonal/outlined/ghost/text/destructive/ai), size sm/md/lg, SRI-safe ripple
- `Inspector` — right drawer with ESC, focus trap (Tab/Shift+Tab), focus return to prior element
- `Chip`, `Badge`, `RangeSlider`, `Divider`, `Icon`, `EmptyState`, `SectionLabel`
- All components use CSS custom property tokens — no hardcoded colors

### Brief + Recommendations (`tm-recommend.jsx`)
- 4-step wizard: project type → collection → preferences → review
- Local algorithmic multi-dimension scorer (`scoreFont`) across 8 axes
- Results: `ResultCard` with hover actions, inspector integration
- `ResultsLoadingSkeleton` — 3 card-shaped placeholders with rotating stage label
- `RecommendErrorState` — inline recoverable error with Retry (replays last query)
- Empty state: explicit copy + Refine/Start-over CTAs
- `DetailPanel` — 4-tab inspector panel (Overview / Score / License / Pairing)
  - Arrow-key roving focus on tablist
  - "Open in Pairings" + "Open in Preview" CTAs in Overview and Pairing tabs

### Preview Lab (`tm-preview.jsx`)
- 7 templates: Article (default), Hero, Body, Editorial, Brand, Mobile, UI
- **Dynamic font injection**: any font from Results/Inspector is injected into `fontCatalogue`
- `toPreviewEntry(font)` — converts Results font shape to catalogue entry
- `ensureFontLoaded(name)` — appends Google Fonts `<link>` idempotently
- `useEffect` on `initialFont.name` — injects + auto-selects on change
- Canvas dark/light toggle is **independent** of app shell theme
- All UI chrome uses CSS custom properties (dark/light parity complete)

### Landing (`tm-landing.jsx`)
- Editorial specimen card (rotating fonts, Aa alphabet string, pagination dots)
- Primary CTA: "Start matching" → enters app
- Secondary CTA: "See sample results" → scrolls to demo strip (no fake "Watch demo")
- Floating accent badge cards removed
- Single `<h1>` with quiet category label

### Deployment
- Static site on Vercel, root directory: `typography-generator/project`
- `vercel.json`: rewrite `/` → `/TypeMatch.html`, cache-control on HTML/JSX, security headers
- `TypeMatch.html`: React 18.3.1 production builds with computed SRI hashes
- Meta tags, OG tags, SVG favicon added

---

## What Is Working

- Full Brief → Results → Inspector → Preview flow
- Dark and light mode with correct parity everywhere
- Inspector focus management (trap, return, ESC)
- Preview font injection from results
- Loading, empty, error states on Results
- Vercel deployment + auto-deploy on `git push`

---

## What Is Incomplete / Known Issues

### Deferred Phase 3 features (not started)
- **Compare mode** — side-by-side font comparison tray
- **Lock-and-regenerate** — pin one font, regenerate pairing candidates
- **Command palette** — `⌘K` global shortcut
- **Score-weight tuning** — user-adjustable dimension weights
- **Preview templates** — only Article is production-quality; Hero/Body/Editorial/Brand/Mobile/UI are basic placeholders

### Approved but not shipped
- **Brief-as-home** — landing was redesigned but the app still shows a Home dashboard on entry after brief completion; Brief-as-home route (Brief as default view) approved but not implemented
- **Token consolidation** — app still uses purple, teal, warm as chrome accents; should reduce to primary only for chrome, semantics only for score/status

### UX issues still open
- No URL routing — browser back button does nothing; no deep links
- No persistence — refreshing loses the current brief, results, and any saved comparisons
- "AI" label in UI (button reads "Get recommendations · auto_awesome") is misleading — the scorer is local and algorithmic
- Mobile layout is broken in several views (tool is desktop-primary)
- Inspector mobile variant (bottom sheet) not built

### Architecture limitations
- Babel standalone transpiles JSX in-browser — noticeable cold-start lag (~1–2s) on first load
- `window.X` global component pattern requires strict `<script>` load order in TypeMatch.html
- Font catalogue is fully hardcoded in `tm-data.jsx` — adding a font requires a code edit
- No localStorage persistence for library state or saved comparisons (only theme + rail collapse)

---

## Latest Important Decisions

| Decision | Status |
|---|---|
| Brief-as-home as default entry route | Approved, not shipped |
| Single chrome accent (primary only) | Approved, partially done |
| Dynamic font injection in PreviewLab | Shipped |
| No build step until product logic is stable | Active constraint |
| No backend until localStorage is insufficient | Active constraint |
| Route `id` values are frozen — labels can change, IDs cannot | Active constraint |

---

## Immediate Next Steps (Phase 4 start)

1. **Brief-as-home** — remove `HomeView`, make `recommend` the default `appView`, update nav/breadcrumb logic. Medium complexity.
2. **Token consolidation** — audit all JSX for `var(--purple)`, `var(--teal)`, `var(--warm)` in chrome contexts; replace with `var(--primary)`. Leave semantic uses (score bars, status) intact.
3. **Preview template suite** — bring Hero, Body, Editorial, Brand templates to the same quality level as Article.
4. **localStorage persistence** — save current `results`, `collection` selections, and `saved` comparisons to localStorage so a refresh doesn't lose state.
5. **Compare mode skeleton** — most-wanted differentiator; even a basic 2-font side-by-side panel is a meaningful step.

---

## Blockers / Assumptions

- **No real AI**: The scoring engine is a local algorithm in `scoreFont()` inside `tm-recommend.jsx`. The "AI" label in the UI is a product decision, not an implementation reality. This will be a trust issue with users once the app gets real users.
- **Font catalogue quality**: The 30-ish fonts in `tm-data.jsx` were manually curated with metadata scores. The scores are author-defined, not empirically validated. This is the biggest data quality risk.
- **Google Fonts dependency**: All fonts are loaded from Google Fonts CDN. Offline or CDN-down scenarios are unhandled.
- **No analytics**: There is no visibility into how real users use the app. Prioritisation decisions after public launch should wait until usage data exists.

---

## Key Files — What to Read First

| File | Why |
|---|---|
| `TypeMatch.html` | Entry point, script load order, all CSS tokens |
| `tm-app.jsx` | App shell, all nav/state wiring, view routing |
| `tm-components.jsx` | All shared components — check here before building new UI |
| `tm-recommend.jsx` | Brief wizard, scoring engine, Results, DetailPanel |
| `tm-preview.jsx` | Preview Lab, font catalogue, all 7 templates |
| `tm-data.jsx` | All font data — the canonical catalogue |
| `roadmap.md` | Product direction, what's in scope, decision rules |
| `audit.md` | Detailed changelog, all phase decisions |
