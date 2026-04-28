# TypeMatch — Claude Context

## What this is
TypeMatch is a static, no-build typography selector built with React 18 + Babel standalone (JSX transpiled in-browser). There is no build step, no backend, no bundler. All components are `window.X` globals loaded via `<script type="text/babel">` tags in `TypeMatch.html`.

Live: https://typematch-mu.vercel.app  
Repo: https://github.com/deepakmaan25/typematch

## Read these before making any changes
1. `HANDOFF.md` — current state, what's done, what's broken, next steps
2. `roadmap.md` — product direction, decision rules, what's in/out of scope
3. `audit.md` — full changelog of every phase decision

## Project layout
```
typography-generator/project/   ← Vercel root directory
  TypeMatch.html                ← entry point + all CSS tokens
  tm-data.jsx                   ← font catalogue (hardcoded)
  tm-components.jsx             ← shared UI primitives
  tm-app.jsx                    ← shell, nav, all state wiring
  tm-recommend.jsx              ← brief wizard + scoring + Results + DetailPanel
  tm-preview.jsx                ← Preview Lab + 7 templates
  tm-landing.jsx                ← landing/hero page
  tm-pairing-studio.jsx         ← Pairings view
  tm-collection.jsx             ← Library view
  vercel.json                   ← deployment config
```

## How to work in this repo

**Script load order matters.** Components reference each other as `window.X` globals. The load order in `TypeMatch.html` is the dependency order — do not reorder the `<script>` tags.

**All colors must use CSS custom properties.** Never hardcode `rgba()` or hex values in component JSX for chrome/UI. Use `var(--t1/t2/t3/t4)`, `var(--b1/b2)`, `var(--s1–s4)`, `var(--primary)`. Canvas preview colors (inside `PreviewCard` templates) have their own `darkBg/bgColor/textColor/subColor` system — that's intentional and separate.

**Route `id` values are frozen.** `home`, `recommend`, `pairing`, `preview`, `collection`, `addfonts`, `saved`, `settings` — never rename these. Labels can change.

**Every feature needs three states before it's done:** loading, empty, error with recovery.

**Deploy:** `git push origin main` from `C:/Users/dipum/Downloads/TypeScale Generator`. Vercel auto-deploys in ~15s.

## Important rules
- Do not introduce a build step or npm dependencies without a clear reason
- Do not add a backend until localStorage persistence is genuinely insufficient  
- Do not change the global component mounting pattern (`window.X = Component`) without migrating all consumers
- The "AI" scoring in `tm-recommend.jsx` is a **local algorithm** — do not describe it as a live AI call
- `tm-data.jsx` is the only font data source — all catalogue changes go there
