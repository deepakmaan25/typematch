# TypeMatch — Product Roadmap

> Last updated: 2026-04-29
> Status: v1 deployed at https://typematch-mu.vercel.app
> Source of truth: this file. If anything outside this file disagrees with this roadmap, this file wins.

---

## Roadmap transition note (2026-04-29)

The roadmap direction has changed. The previous plan focused on **Phase 4 polish** (Brief-as-home, token consolidation, completing preview templates, ⌘K palette, score-weight tuning, mobile bottom-sheet). That plan has been superseded.

The new plan shifts toward **font data, richer schema, recommendation quality, ingestion, persistence, and pairing workflows** — turning TypeMatch from a polished prototype into a credible recommendation product. The basis for this rewrite is `typematch-next-level-roadmap.md` (external proposal, now reconciled into this file). That external doc is no longer treated as a parallel roadmap; this file is the single source of truth.

Future work must follow the phases below unless this file is explicitly amended again.

---

## Product intent

TypeMatch should evolve from a visually polished typography prototype into a credible typography recommendation product with three durable strengths: **broad font access, reliable recommendation logic, and workflow-grade preview/comparison tools**. The product wins through a hybrid model: curated structure for trust, live font delivery for scale, and smarter scoring or embedding-assisted ranking over time.

---

## North star

A typography recommendation engine that helps a user confidently choose a single typeface, a pairing, or a full type system by combining structured font metadata, high-quality previews, and transparent recommendation logic.

---

## Success principles

- Recommendation quality must improve faster than surface polish.
- Preview quality must show fonts in real contexts, not only isolated specimen text.
- Pairing support is a core product behavior, not an optional enhancement.
- Font access should scale through live sources instead of a tiny manually-maintained list.
- The system should remain explainable; recommendations must say *why* a choice fits.
- The product should support local fonts and uploaded fonts where browser and licensing constraints allow.

---

## Non-goals

- Do not start with a heavyweight ML system before structured metadata and scoring are stable.
- Do not build a proprietary font hosting platform when live APIs solve the immediate problem.
- Do not treat UI polish as a substitute for recommendation accuracy.

---

## Current gaps

| Gap | Why it matters | Priority |
|---|---|---|
| Small font dataset (~30 in `tm-data.jsx`) | Weak suggestions, repeated outputs reduce utility | Critical |
| Limited metadata | Pairing and ranking logic cannot become intelligent without structured attributes | Critical |
| No persistence layer | Collections, saved pairings, and history cannot become real product value | Critical |
| Weak pairing workflow | Users cannot evaluate headline/body or system combinations properly | Critical |
| Limited font ingestion | Users cannot bring their own fonts into the workflow | High |
| Low recommendation transparency | "AI" label is misleading; reasoning is hidden | High |
| Basic preview contexts | Real-world decision confidence remains low | High |

---

## Product pillars

### Font access
Three sources combined: API-driven web fonts (Google Fonts), local font detection where supported (Local Font Access API), and manual font upload. Google Fonts provides the scalable initial source — fonts via the CSS API, family metadata via the Developer API.

### Structured intelligence
Every font has normalized metadata so the system can score and rank consistently. Minimum useful fields: family, category, subcategory, mood tags, personality traits, readability profile, contrast profile, x-height proxy, weight range, variable font support, screen suitability, editorial suitability, license confidence.

### Workflow-grade preview
The preview system shows typography in actual usage contexts: hero headings, product UI, editorial layouts, dashboard cards, mobile surfaces, brand lockups. The Preview Lab supports pairing slots, not isolated single-font comparisons, so users can evaluate hierarchy, harmony, and contrast together.

---

## Architecture direction

### Current (v1 — no-build static, shipped)

- Single HTML file (`TypeMatch.html`) entry point
- React 18 + Babel standalone (JSX transpiled in-browser, no build step)
- Components mounted as `window.X = Component` globals via `<script type="text/babel">`
- All font data hardcoded in `tm-data.jsx`
- "AI" scoring is a local algorithmic multi-dimension scorer in `tm-recommend.jsx` — not a live API call
- Only theme + rail-collapse persist to `localStorage`
- Static deployment on Vercel (root: `typography-generator/project/`)

### Phase model

Build as a hybrid system: structured rules first, smarter ranking later, embeddings only after data quality is stable.

| Phase | Architecture | What it unlocks |
|---|---|---|
| Phase 1 | Curated dataset + Google Fonts ingestion + scoring rules | Fast improvement, explainability, broader catalog |
| Phase 2 | Weighted scoring + curated pairing cache | Trustworthy recommendations at scale |
| Phase 3 | Backend persistence (Supabase/Firebase) for collections + pairings | Real user value and repeat usage |
| Phase 4 | Local Font Access + embedding-assisted ranking | Adaptive relevance, deeper ingestion |

### Recommended stack

- Frontend: existing no-build static stack with theme tokens and dynamic font loading.
- Font source: Google Fonts CSS API + Developer API for initial scale.
- Local font access: Local Font Access API where supported, with graceful fallback.
- Upload path: client-side .ttf/.otf/.woff/.woff2 validation; server-backed persistence in Phase 3.
- Backend: Supabase or Firebase for auth, collections, saved pairings, recommendation history, preferences.
- Search/index: normalized font metadata + pairing scores.
- Future intelligence: embedding vectors and ranking models (Phase 4).

### Architecture decision rules

- The no-build static stack stays until product logic justifies a build step. A build step (Vite) is no longer phase-blocking; introduce when the cold-start cost or DX cost outweighs the simplicity benefit.
- A backend is now on the plan (Phase 3). Do not add it ad-hoc — follow the phase order. Until Phase 3 ships, persist to `localStorage`.
- Component model stays as `window.X` globals until a proper module system is justified by the work in flight.
- `tm-data.jsx` is the canonical font catalog **until Phase 1 ships Google Fonts ingestion**, after which the catalog becomes a normalized, partially-cached dataset and `tm-data.jsx` becomes a curated seed/override.

---

## Data model

### Core entities

User · Collection · Font · FontSource · Pairing · RecommendationRun · SavedComparison · PreviewPreset

### Font schema (target shape — Phase 1)

```json
{
  "id": "font_001",
  "family": "Inter",
  "source": "google-fonts",
  "category": "sans-serif",
  "subcategory": "neo-grotesk",
  "mood": ["neutral", "modern", "precise"],
  "personality": ["clean", "trustworthy", "systematic"],
  "readability": 92,
  "screenSuitability": 96,
  "editorialSuitability": 70,
  "contrastStyle": "low",
  "xHeight": "high",
  "weightMin": 100,
  "weightMax": 900,
  "variable": true,
  "languageSupport": ["latin"],
  "license": "OFL",
  "licenseConfidence": "high",
  "tags": ["ui", "product", "dashboard"]
}
```

### Pairing schema (target shape — Phase 2)

```json
{
  "id": "pair_001",
  "headingFontId": "font_010",
  "bodyFontId": "font_001",
  "context": ["editorial", "branding"],
  "contrastScore": 84,
  "harmonyScore": 78,
  "readabilityScore": 88,
  "distinctivenessScore": 73,
  "overallScore": 83,
  "explainability": [
    "High contrast between display serif and neutral sans",
    "Body face maintains screen readability",
    "Suitable for premium editorial brand systems"
  ]
}
```

---

## Recommendation engine roadmap

### Stage 1 — rule-based + curated logic (Phase 1–2)

Deterministic rules on metadata: category contrast, mood compatibility, readability thresholds, use-case fit. Suggested weighted formula:

```text
overallScore =
  0.25 * useCaseFit +
  0.20 * moodFit +
  0.20 * readability +
  0.15 * contrastCompatibility +
  0.10 * personalityMatch +
  0.05 * popularityOrAdoption +
  0.05 * licenseConfidence
```

### Stage 2 — scoring system + curated pair cache (Phase 2)

Precomputed pairing scores for strong defaults so results stay fast and trustworthy.

### Stage 3 — embedding-assisted ranking (Phase 4)

Visual embeddings + lightweight ranking as a **layer on top** of metadata and scoring. Never a replacement for structured logic.

---

## Font ingestion roadmap

### Source 1 — Google Fonts (Phase 1)
CSS API for live rendering, Developer API for family metadata. Cache normalized metadata locally so the UI stays fast and scoring doesn't depend on runtime API fetches.

### Source 2 — Local fonts (Phase 4)
Local Font Access API where available. Permission requested only on user action; clearly explain that local fonts stay on-device unless the user explicitly uploads files.

### Source 3 — Manual upload (Phase 3)
Support .ttf, .otf, .woff, .woff2. UI validates file type, infers or requests family naming, lets the user enrich metadata after upload.

---

## Preview lab roadmap

The Preview Lab splits into two product modes. **Pairing Studio is the signature feature.**

### Compare Fonts
- Compare up to 3 single fonts
- Adjust size, weight, line-height, tracking, case, background
- View hero, body, editorial, UI, mobile samples

### Pairing Studio (signature)
- Heading + body pairing
- UI font + marketing font
- Brand system mode: display, supporting sans, labels
- Editorial mode: title, deck, paragraph, caption
- Swap pair slots instantly
- Lock one font and explore compatible companions
- Auto-suggest compatible pairings from rules and scores
- Save pairings to a shortlist

---

## Backend roadmap (Phase 3)

A backend becomes necessary once the product needs user collections, saved pairings, recommendation history, and persistent preferences. Supabase or Firebase is sufficient — the immediate need is persistence, not heavy infrastructure.

### Initial backend scope
Auth · User profile · Saved font collection · Uploaded fonts metadata · Saved pairings · Saved recommendation runs · Saved preview presets · Theme preference

---

## UX roadmap

### Immediate UX improvements
- Make pairing a first-class job in onboarding and navigation.
- Show recommendation provenance: collection / structured catalog / AI-assisted inference.
- Replace lorem-style previews with realistic contexts (SaaS hero, editorial masthead, app settings, dashboard KPI card, brand card).
- Show "why this works" explanations on each recommendation card.
- Add confidence indicators and tradeoff notes.
- Replace the "AI" copy throughout the UI with honest structured-scoring language.

### Differentiation
Most tools stop at font specimens or simplistic pair suggestions. TypeMatch differentiates by treating the decision workflow seriously: contextual previews, explainable ranking, better saved comparisons, better collection intelligence.

---

## Delivery phases

### ✅ Completed (v1, shipped 2026-04-28)

Pre-existing foundation work — kept as historical record, not active priorities:

- Foundation cleanup: button hierarchy, focus-visible, reduced-motion, design tokens, motion tokens, light/dark with no-flash init
- Shell + structure: collapsible left rail, persistent layout, frozen route IDs, reusable Inspector primitive, DetailPanel with 8-dimension score breakdown
- Differentiators (partial): Inspector tabs with roving focus, Results loading/empty/error states, Article preview template, dynamic Google Fonts injection in PreviewLab via `ensureFontLoaded`, hero/landing redesign, full dark/light parity

### 🟢 Phase 1 — Foundation (data + schema) — 2–3 weeks · ACTIVE

- Integrate Google Fonts catalog (CSS API + Developer API)
- Normalize metadata schema (target shape above)
- Expand dataset substantially beyond the ~30 in `tm-data.jsx`
- Cache normalized metadata locally; do not fetch at scoring time
- Refactor recommendation cards to show explainability ("why this works")
- Replace "AI" copy with structured-scoring language

### 🔲 Phase 2 — Recommendation quality — 2–4 weeks

- Implement weighted scoring engine (formula above)
- Add curated pairing cache for strong defaults
- Add use-case presets and filters
- Add pairing-specific results (not just single-font lists)
- Add better preview contexts (Compare Fonts mode)

### 🔲 Phase 3 — User value — 2–3 weeks

- Add backend persistence (Supabase or Firebase)
- Save collections, pairings, recommendation history
- Add manual font upload support
- Add shortlist and compare flows

### 🔲 Phase 4 — Advanced ingestion + intelligence — 3–6 weeks

- Add Local Font Access API support
- Advanced metadata enrichment
- Precompute pairing scores at scale
- Explore embedding-assisted ranking

---

## Build order

1. Expand font source via Google Fonts.
2. Define and normalize the metadata model.
3. Implement scoring-based recommendations with explainability.
4. Rebuild Preview Lab into Compare Fonts + Pairing Studio.
5. Add persistence with Supabase or Firebase.
6. Add upload and Local Font Access flows.
7. Add embedding enrichment only after the above is stable.

---

## Decision rules

| Situation | Rule |
|---|---|
| Choosing what to build next | If it improves recommendation quality, preview quality, or persistence → primary. If only visual polish → secondary. |
| Considering an ML feature | If the same value can be reached with metadata + scoring first, delay ML. |
| Adding a font source | If it introduces licensing risk without clear value, avoid it. |
| Building a preview | If it doesn't simulate a real use case, it's incomplete. |
| Adding a new component | Must use CSS custom property tokens — no hardcoded chrome colors. |
| Changing nav structure | Route `id` values are frozen. Labels can change; IDs cannot. |
| Adding a font to the (current) catalogue | Edit `tm-data.jsx` → `FONT_COLLECTION`. After Phase 1, this becomes seed/override only. |
| Adding a preview template | Add entry to `PREVIEW_TEMPLATES` in `tm-preview.jsx`. Must implement the `darkBg/bgColor/textColor/subColor` canvas color system. |
| Shipping a feature | Must have loading, empty, and error states. No dead ends. |
| Deploying | `git push origin main` — Vercel auto-deploys. Never push broken main. |

---

## Definition of done

A feature is done when:
1. It works in both dark and light mode
2. It has loading, empty, and error/recovery states
3. It is keyboard-navigable (focus-visible, no focus traps)
4. It respects `prefers-reduced-motion`
5. The `audit.md` changelog entry is written
6. It is deployed and verified at the live URL
7. (For recommendation features) it surfaces an explainability string the user can read

A phase is complete only when:
- Users can access a broad enough font set to get meaningfully varied results.
- Recommendation results explain why they exist.
- Pairing is supported as a complete workflow, not a workaround.
- Collections and saved decisions persist reliably (from Phase 3 onward).
- The preview lab supports real contexts and fast comparison.
- The product still feels premium, clear, and trustworthy.

---

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| API dependency on Google Fonts | Catalog instability, latency | Cache metadata and critical presets locally |
| Weak metadata quality | Poor recommendation quality | Controlled normalized schema, audit tags |
| Browser support variance for Local Font Access API | Broken expectations | Feature detection + graceful fallback messaging |
| Upload licensing ambiguity | Legal/product confusion | Show source + license confidence; require user confirmation |
| Overbuilding ML too early | Slow delivery, low ROI | Delay embeddings until scoring + data quality stable |
| Babel in-browser cold start | Slower first load | Tolerate for now; revisit Vite if it becomes blocking |
| "AI" copy misleads users | Trust issue | Replace with structured-scoring language in Phase 1 |
| `window.X` global pattern + load-order bugs | Build breakage | Maintain strict `<script>` load order in `TypeMatch.html` |

---

## Superseded priorities (from the previous roadmap)

These were active under the previous Phase-4-polish plan. They are now deferred or reframed under the new direction. They may return, but only after the new Phase 1–3 work justifies them.

| Old priority | New status |
|---|---|
| Brief-as-home route swap | Deferred — revisit during Phase 1 UX polish if it accelerates recommendation testing |
| Token consolidation (drop purple/teal/warm chrome accents) | Deferred — not blocking; pick up opportunistically while editing components |
| Compare mode skeleton | Reframed — folded into Phase 2 Preview Lab "Compare Fonts" mode |
| Lock-and-regenerate | Reframed — now part of Phase 2 Pairing Studio |
| ⌘K command palette | Dropped from active plan |
| Score-weight tuning UI | Dropped from active plan |
| Inspector mobile bottom-sheet | Deferred — mobile remains best-effort |
| Vite migration | Deferred — no longer phase-blocking |
| Real Claude API for brief interpretation | Deferred — explainable structured scoring first; revisit after Phase 2 |
| URL-based routing | Deferred — revisit when persistence (Phase 3) makes deep links valuable |

---

## Team working agreement

Before building anything new, ask:

1. Does this improve recommendation quality, preview quality, or persistence?
2. Does this help TypeMatch become a real decision-support tool?
3. Is this the simplest version that moves the product toward the north star?
4. Are we improving the system, or decorating the interface?

If any answer is "no" or "just polish," it does not belong in the active phase.
