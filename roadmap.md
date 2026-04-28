# TypeMatch — Product Roadmap

> Last updated: 2026-04-28  
> Status: v1 deployed at https://typematch-mu.vercel.app

---

## Product Vision

TypeMatch is a **professional typography selector** for designers and developers who take typeface decisions seriously. It is not a font browser. It is a decision-support tool that scores, pairs, previews, and manages typefaces against the real context of a project.

The end state: TypeMatch feels like a calm, opinionated design tool — the typography equivalent of a brand standards kit — that helps practitioners make faster, better-justified typeface decisions without relying on gut feel or trend-chasing.

---

## North Star

> A designer can describe their project in plain terms, see a ranked list of typefaces scored against that brief from their own library and beyond, inspect the reasoning, pair them, and preview the result in real context — all in one session without switching tools.

---

## Intended User Value

| User type | Core value |
|---|---|
| Product designers | Find a typeface that fits a SaaS product without guessing |
| Brand designers | Justify a type recommendation to a client with visible scoring |
| Developers | Copy font-family strings and license info directly from the tool |
| Type enthusiasts | Build and curate a personal font library with rich metadata |

---

## Core Product Pillars

1. **Brief-driven scoring** — Every recommendation traces back to a project context. No context = no recommendation.
2. **Library-first** — Your own font collection is always scored first. External suggestions supplement, not replace.
3. **Show the work** — Scoring dimensions, weights, and reasoning are visible, not black-boxed.
4. **Real-context preview** — Fonts are shown in realistic editorial/UI/brand templates, not isolated specimen strings.
5. **Lock and iterate** — Users should be able to pin a font and regenerate companions, not start over every time.
6. **No dead ends** — Every state (empty, error, zero results) has a clear recovery path.

---

## Architecture Direction

### Current (v1 — no-build static)
- Single HTML file (`TypeMatch.html`) as entry point
- React 18 + Babel standalone (JSX transpiled in-browser — no build step)
- All components are `window.X = Component` globals loaded via `<script type="text/babel">`
- All data is hardcoded in `tm-data.jsx` (FONT_COLLECTION array)
- "AI" scoring is a local algorithmic multi-dimension scorer — **not a live API call**
- State is in-memory; only theme + rail-collapse state persisted to `localStorage`
- Deployed as a static site on Vercel

### Architectural ceiling (known limitations)
- No backend → no user accounts, no cloud sync, no real AI
- Babel in-browser transpilation → ~1MB overhead, cold start lag on first load
- No URL routing → deep links and browser back/forward don't work
- Font library is static (hardcoded) → adding real fonts requires editing `tm-data.jsx`

### Target architecture (Phase 5+, not yet committed)
- Move to Vite + React build step (removes Babel in-browser overhead)
- Add a lightweight backend for: user auth, library persistence, real AI brief interpretation
- Google Fonts API integration to expand the searchable catalogue dynamically
- URL-based routing (React Router or similar) so views are deep-linkable

### Architecture decision rules
- **Do not introduce a build step until the product logic is stable.** The no-build approach allows rapid iteration.
- **Do not add a backend until localStorage is genuinely insufficient.** Prove the product works first.
- **Do not fragment the component model.** All components stay as `window.X` globals until a proper module system is introduced.
- **`tm-data.jsx` is the single source of truth for font data** until a dynamic API replaces it.

---

## Phased Roadmap

### ✅ Phase 1 — Foundation cleanup (complete)
- Button hierarchy (sentence case, ripple confined to primary)
- Reduced-motion support (`prefers-reduced-motion`)
- Focus-visible accessibility
- Design token system (CSS custom properties for all surfaces, text, borders, brand)
- Motion token system (MD3-inspired easing + duration scale)
- Light + dark theme with no-flash init

### ✅ Phase 2 — Shell + structure (complete)
- Persistent app shell with collapsible left rail (54px icon ↔ 200px labelled)
- Rail state persisted to `localStorage`
- Nav labels aligned to IA: Brief / Pairings / Preview / Library
- Reusable `Inspector` primitive (right drawer, ESC, focus trap, focus return)
- Inspector state lifted to App shell (`inspectorTarget`)
- `DetailPanel` embedded in Inspector with 8-dimension score breakdown

### ✅ Phase 3 — Differentiators (partially complete)
**Done:**
- Inspector tabs (Overview / Score / License / Pairing) with roving arrow-key focus
- Results hardened: card-shaped loading skeletons, explicit empty state, recoverable error + Retry
- Article preview template (kicker · headline · byline · deck · 2-col body · pull-quote)
- Preview view wired into shell with font-context fallback chain
- Dynamic font injection: any Results font is injected into PreviewLab catalogue on demand
- Google Fonts link injected for unlisted fonts (`ensureFontLoaded`)
- Hero/landing redesign: editorial specimen card, fixed CTA logic, "See sample results" scroll
- Full dark/light mode parity across all PreviewLab UI chrome

**Deferred to Phase 4:**
- Compare mode (side-by-side font comparison tray)
- Lock-and-regenerate (pin a font, regenerate pairing candidates)
- Command palette (`⌘K`)
- Score-weight tuning UI (user-adjustable dimension weights)
- Remaining preview templates: Hero, Editorial, Dashboard, Pricing, Mobile (redesigned)
- Inspector mobile bottom-sheet variant
- Brief-as-home default route (approved but not shipped — Home dashboard preserved)
- Token consolidation (remove unused purple/teal chrome accents)

### 🔲 Phase 4 — Polish + completeness
- Brief-as-home route swap (remove home dashboard, Brief becomes the entry point)
- Complete preview template suite (all 7 templates production-quality)
- Compare mode
- Lock-and-regenerate
- Command palette shell (`⌘K`)
- Score-weight tuning
- Inspector mobile bottom-sheet
- Token consolidation
- Full accessibility audit (WCAG 2.1 AA)
- Edge-case hardening (offline, font load failure, overlong brief, mobile)
- QA pass across all views

### 🔲 Phase 5 — Real intelligence
- Replace local scoring algorithm with Claude API brief interpretation
- Natural language brief → structured scoring weights
- Explain-scoring mode ("why this font for my brief")
- Vite build step migration (remove Babel standalone overhead)
- URL-based routing

### 🔲 Phase 6 — Platform
- User accounts + library cloud sync
- Google Fonts API dynamic catalogue
- Font import from URL
- Share / export pairing as code snippet or PDF
- Team library support

---

## In Scope (v1)

- Single-user, in-browser typography workflow
- Brief → Score → Inspect → Preview → Pair
- Static font catalogue (hardcoded, curated)
- Local algorithmic scoring
- Dark + light mode
- Google Fonts only (no local font upload)
- Static deployment (no backend)

## Out of Scope (v1)

- User accounts or cloud persistence
- Real AI / Claude API calls
- Font file upload
- Custom scoring models
- Mobile-first layout (desktop-primary, mobile is best-effort)
- Pricing, paywalls, or tiers
- Analytics or telemetry
- CMS or content management

---

## Decision Rules

| Situation | Rule |
|---|---|
| Adding a new component | Must use CSS custom property tokens — no hardcoded colors |
| Adding dark/light support | UI chrome uses `var(--t1/t2/t3/t4)`, `var(--b1/b2)`, `var(--s1-s4)`. Canvas colors use their own toggle. |
| Changing nav structure | Route `id` values are frozen. Labels can change. IDs cannot — other code references them. |
| Adding a font to the catalogue | Edit `tm-data.jsx` → `FONT_COLLECTION` array. Match the existing schema exactly. |
| Adding a preview template | Add entry to `PREVIEW_TEMPLATES` in `tm-preview.jsx`. Must implement the `darkBg/bgColor/textColor/subColor` canvas color system. |
| Shipping a feature | Must have: loading state, empty state, error state. No dead ends. |
| Deploying | `git push origin main` — Vercel auto-deploys. Never push broken main. |

---

## Definition of Done

A feature is done when:
1. It works in both dark and light mode
2. It has a loading state, empty state, and error/recovery state
3. It is keyboard-navigable (focus-visible, no focus traps)
4. It respects `prefers-reduced-motion`
5. The audit.md changelog entry is written
6. It is deployed and verified at the live URL

---

## Current Priorities (as of 2026-04-28)

1. Phase 4 — Brief-as-home route swap (high leverage, approved, unblocked)
2. Phase 4 — Compare mode skeleton (most-requested differentiator)
3. Phase 4 — Complete preview template suite
4. Phase 4 — Token consolidation (remove multi-accent chrome noise)
5. Phase 5 planning — Claude API brief interpretation (research spike)

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Babel in-browser is too slow for users on first load | Medium | High | Migrate to Vite in Phase 5 |
| Static font catalogue feels stale/limited | High | Medium | Add Google Fonts API in Phase 6; curate catalogue carefully now |
| "AI" label misleads users (scoring is local, not AI) | Medium | Medium | Rename to "Smart scoring" or "Brief matching" in UI copy |
| No persistence means users lose work on refresh | High | Medium | Add localStorage persistence for library + saved comparisons in Phase 4 |
| Mobile experience is broken | High | Low (desktop tool) | Add mobile-specific layouts in Phase 4 polish |
| `window.X` global pattern causes load-order bugs | Low | High | Maintain strict `<script>` load order in TypeMatch.html |

---

## Build Order Principles

When building new features, follow this sequence:
1. **Data model first** — define the shape in `tm-data.jsx` or local state
2. **Component in isolation** — build the component so it works standalone
3. **Wire to shell** — connect to `tm-app.jsx` state/handlers last
4. **Harden states** — loading → empty → error before marking done
5. **Token audit** — replace any hardcoded colors before committing
6. **Deploy + verify** — push and confirm at live URL
