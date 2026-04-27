# TypeMatch Audit

## Purpose
This document is the living audit and decision log for TypeMatch. It captures the current product critique, approved design direction, implementation priorities, and unresolved questions.

## Scope
- Product: TypeMatch typography selector / generator
- Current state reviewed:
  - Landing / brief flow
  - Results flow
  - Pairings / preview / library concepts
  - Visual system
  - States and edge cases
  - Accessibility and implementation quality

## Current-State Critique
### What is currently weak
- The landing page is marketing-led instead of tool-led.
- The hero specimen behaves like a collage rather than a working product surface.
- Hierarchy is conflicted.
- Recommendation/scoring logic is not visible enough.
- The app feels like a prototype in several places.
- The color system uses too many competing accents.
- Density is too low for a serious typography tool.
- Trust signals, licensing, and scoring explanations are too hidden.
- Navigation and state management need clearer structure.
- Some flows can dead-end without a strong recovery path.

### Biggest UX risks
- First-time users may not understand what to do.
- Returning users may not be able to recover prior work easily.
- Users may regenerate instead of iterating with locked variables.
- Similar preview pages may confuse the mental model.
- Destructive actions without undo can cause frustration.

### Biggest visual opportunities
- Make the typography itself the hero.
- Reduce chrome and decorative noise.
- Use one accent color with semantic states.
- Show real context previews instead of decorative specimens.
- Increase typographic scale quality and layout discipline.

## Product Direction
### Principles
- Type is the hero, chrome is the stage.
- Opinion over options.
- Show the work.
- Real context, not isolated specimens.
- Lock and iterate.
- Library-first.
- No dead ends.

### Recommended UX direction
- A calm, dense, command-driven app shell.
- Quiet chrome with restrained accent usage.
- Clear state model and visible scoring logic.
- Strong real-world previews and comparison tools.
- A professional design-tool feel, not a marketing page.

## Approved IA Direction
- Brief
- Results
- Pairings
- Preview
- Library
- Settings

## Approved Visual Direction
- One accent color for chrome.
- Semantic state colors only for score/status.
- Compact, product-style type hierarchy.
- Consistent radius, borders, and spacing.
- Dark mode and light mode parity.

## Design System Rules
### Typography
- UI should use a clear, compact hierarchy.
- Caps lock should be limited to micro-labels only.
- Type specimens can use display fonts; chrome should stay restrained.

### Spacing
- Use a single spacing scale.
- Keep rhythm compact and deliberate.

### Components
- Buttons
- Inputs
- Cards
- Inspector
- Command palette
- Empty/loading/error states
- Preview templates
- Compare tray

### Interaction Rules
- Clear hover, focus, active, disabled states.
- Undo over destructive confirmation where possible.
- Reduced motion must be respected.
- Keyboard navigation must be first-class.

## Edge Cases
- No results
- Partial results
- Font load failure
- Copy failure
- Empty library
- Overlong brief
- Mobile inspector behavior
- Unsaved changes
- Theme switching
- Offline/slow network states
- Regeneration conflicts

## Implementation Phases
### Phase 1 — Quick wins
- Button cleanup
- Typographic cleanup
- Color cleanup
- State cleanup
- Motion cleanup
- Accessibility cleanup

### Phase 2 — Structural redesign
- Persistent shell
- Left rail
- Inspector pattern
- Results refactor
- Pairings refactor

### Phase 3 — Differentiators
- Real-context previews
- Lock and regenerate
- Compare mode
- Command palette
- Score-weight tuning

### Phase 3 (partial) — Implemented
- Inspector tabs: Overview / Score / License / Pairing inside `DetailPanel` (embedded mode), with arrow-key roving focus across the tablist and inline empty hints per tab so the inspector never dead-ends.
- Inspector primitive hardened: focus trap with Tab / Shift+Tab cycling inside the drawer, focus return to the previously focused element on close, ESC-to-close retained.
- Inspector resilience: shell-level `useEffect` auto-clears `inspectorTarget` when the underlying font is no longer in `results.collection ∪ results.ai` (or results were cleared), preventing stale state.
- One real-context preview template — `Article` (kicker · headline · byline · deck · 2-column body · pull-quote). Headline uses the card's selected font; body uses an inferred complementary family (DM Sans for serifs/displays, Fraunces for sans). Wired as the new first entry in `PREVIEW_TEMPLATES` and set as default selection.
- Results loading state: `ResultsLoadingSkeleton` with three card-shaped placeholders matching real `ResultCard` dimensions (replaces the spinner-based loader for the Results path); rotating stage label preserved; `aria-busy="true"` and `aria-live="polite"`.
- Results empty state: explicit copy ("No fonts match this brief") with primary `Refine brief` and ghost `Start over` CTAs when both collection and AI ranks are empty.
- Results error state: scoring is wrapped in try/catch; on failure, an inline recoverable error card renders with the message, an `Edit brief` ghost, and a `Retry` button that re-runs the last query.

### Phase 3 (continuation) — Preview wiring
- Added `preview` route/view to the shell with `id:'preview'`, icon `menu_book`, label "Preview" in NAV_ITEMS (positioned between Pairings and Library per audit IA).
- Shell mounts `<PreviewLab initialFont={...} />` at the `preview` route; fallback chain: `previewFont → inspectorTarget → results.collection[0] → results.ai[0] → null` (PreviewLab built-in defaults apply when all are null).
- Added `previewFont` state and `handleOpenPreview(font)` to App(): sets previewFont, closes inspector, navigates, shows snack.
- DetailPanel `onOpenPreview` prop added: "Open in Preview" button (outlined) appears alongside "Open in Pairings" (tonal) in Overview and Pairing tabs when prop is provided. Standalone/non-shell usage unchanged.
- PreviewLab `initialFont` initialiser hardened: falls back to `['Playfair Display','DM Sans']` if the passed font's name is not in `ALL_PREVIEW_FONTS`, preventing an empty preview canvas.
- Breadcrumb label `preview:'Preview'` added.

### Phase 3 (continuation) — Dynamic Preview font injection
- `fontCatalogue` state replaces the static `ALL_PREVIEW_FONTS` reference throughout PreviewLab; base catalogue is unchanged.
- `toPreviewEntry(font)` converts a Results/Inspector font object (with `name`, `fontFamily`, `classification`) into a catalogue entry.
- `buildCatalogue(initialFont)` prepends the injected font to the base list on mount if not already present.
- `ensureFontLoaded(name)` dynamically appends a Google Fonts `<link>` for any injected font not pre-loaded in the HTML head (idempotent — skipped if the link already exists).
- `useEffect` watches `initialFont.name`: on change, injects the new font into `fontCatalogue` and calls `setSelectedFonts([name])` so the canvas auto-selects it immediately.
- Sidebar renders `fontCatalogue` instead of the static constant; injected fonts show a `· from results` micro-label in their type row.
- `fontData` lookup in the canvas area uses `fontCatalogue.find(...)` — injected fonts now render correctly in all templates.

### Phase 3 — Deferred (intentional)
- Compare mode, lock-and-regenerate, command palette, score-weight tuning UI.
- Full preview suite rebuild (Hero / Dashboard / Pricing / Slide / Mobile redesigns) — only Article in this pass.
- Inspector mobile bottom-sheet variant (Phase 4 polish).
- Brief-as-home default route swap (pending audit open question).
- Token consolidation (drop unused chrome accents) — Phase 4.

### Phase 4 — Polish
- Parity audit
- QA
- Accessibility verification
- Edge-case hardening

## Decision Log
| Date | Decision | Status | Notes |
|---|---|---|---|
| 2026-04-26 | Landing should become Brief-as-home | Approved | |
| 2026-04-26 | Use a single chrome accent | Approved | |
| 2026-04-26 | Build left rail in Phase 2 | Approved | |
| 2026-04-26 | Build inspector in Phase 2 | Approved | |
| 2026-04-26 | Do not build Preview rewrite in Phase 1 | Approved | |

## Open Questions
- Which accent color should be final?
- Should the app default to dark mode or system mode?
- Which preview templates are must-have for v1?
- Which fonts should remain eager-loaded?

## Changelog
- 2026-04-26: Initial audit created from current app review.
- 2026-04-26: Phase 1 executed — button hierarchy cleanup (sentence case, dropped letter-spacing, ripple confined to primary), reduced-motion support, focus-visible verified, motion tokens trimmed in usage. See "Files changed" in commit notes.
- 2026-04-26: Phase 2 executed — added reusable `Inspector` primitive (right drawer, ESC-to-close, focus management). Lifted inspector state to App shell. Refactored Results to dispatch card clicks to shell-level inspector; in-card score expander removed; full 8-dimension breakdown + Good-for / Avoid-for grid moved into `DetailPanel` (embedded mode). Left rail made collapsible (54 ↔ 200px), labels visible when expanded, persisted to localStorage. Nav labels aligned to audit IA: Recommend → Brief, Collection → Library, Pairing Studio → Pairings (route IDs unchanged for graceful fallback). Brief-as-home default route swap deferred (Home dashboard preserved; Brief reachable from rail).
- 2026-04-27: Phase 3 (partial) executed — Inspector tabs (Overview / Score / License / Pairing) inside `DetailPanel` with roving arrow-key focus and per-tab empty hints; `Inspector` primitive gained focus trap and focus return; shell auto-clears `inspectorTarget` when its font leaves the results set. Added one real-context preview template (`Article`) wired into `PREVIEW_TEMPLATES` as the new default. Results hardened with card-shaped `ResultsLoadingSkeleton`, explicit empty state ("No fonts match this brief" + Refine/Start-over CTAs), and inline recoverable error state with Retry that replays the last query. Compare mode, lock-and-regenerate, command palette, score-weight tuning, and full preview suite remain deferred.
- 2026-04-27: Phase 3 (Preview wiring) — `preview` route added to shell (NAV_ITEMS, viewMap, labels). `PreviewLab` mounted from shell with font-context fallback chain. `handleOpenPreview` handler + `previewFont` state added. "Open in Preview" CTA added to DetailPanel Overview and Pairing tabs (gated on `onOpenPreview` prop). `PreviewLab` initialFont initialiser hardened against unlisted fonts.
- 2026-04-28: Phase 3 (Dynamic Preview) — Preview is now fully dynamic. Any Results/Inspector font is injected into `fontCatalogue` on demand, auto-selected in the canvas, and loaded via Google Fonts if not pre-loaded. PreviewLab UI chrome tokenized (all `rgba(255,255,255,...)` values replaced with CSS custom properties for correct dark/light mode parity).
