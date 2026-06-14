# Changelog

All notable changes to Yes Man are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow SemVer.

## [1.0.0] — Production candidate ("Say Yes")

The polish-to-ship milestone: the vertical slice grows into a complete,
collectible, accessible idle game.

### Added
- **Golden Yes** — surprise bonus bubbles that drift across the screen
  (~75–165s apart) and burst into Cheer when tapped. Honest by design: no
  timers, no penalty for missing one. (`collectGoldenYes`, `goldenYesReward`)
- **Tier-3 prompts** (10) unlocking at 25K total Cheer — completes the
  three-tier "say yes to life" pool (35 prompts total). Wired tiered selection
  into `promptPool`. (Closes pending wave **YM-W7**.)
- **Secrets / Easter eggs** — 10 hidden collectibles for completionists
  (Konami code, the answer to everything, a William James wink, a very good
  dog, night owl, long haul, lucky sevens, quiet yes, and the completionist
  capstone). Data-driven registry in `src/sim/secrets.ts`.
- **Collection book** — redesigned into tabbed **Stamps + Secrets** with live
  `x / y` counts; undiscovered entries show as `???`. Tap a found secret to
  re-read it.
- **Settings panel** (⚙) — Sound and **Reduce Motion** toggles, a **Journey
  stats** readout (playtime, lifetime yeses, cascades, goldens, totals,
  prestige, stamp/secret counts), and **Export / Import / Start Over** data
  management with confirmation.
- **New stamps** — 1B total, Golden Yes, 10 Goldens, secret hunter, full
  prestige bloom, and "The Journey" completion capstone (17 total).
- **Large-number formatting** — `formatCheer` now scales K → Decillion (and
  scientific beyond), so the late/endgame HUD never overflows. Added
  `formatDuration` for the stats screen.
- **Playtime tracking** (`playSeconds`) and a friendly "Welcome back!" on
  import.
- Mobile-tuned `index.html` (safe-area viewport, no tap highlight,
  `touch-action: manipulation`).

### Changed
- Save format stays **v2**; new fields (`lifetimeGoldenYes`, `playSeconds`,
  `secretsFound`) load with safe defaults — older saves migrate cleanly.
- Header: a single ⚙ Settings entry (sound moved inside) and a unified
  **Collection** button.
- Vite build quiets the expected single-bundle size warning.

### Accessibility
- Reduce Motion disables particles, button squash, and the Golden Yes pulse.

### Tested
- Sim layer fully unit-tested — 41 deterministic tests across engine, stamps,
  secrets, persistence, offline, and prefs; `npm run verify` green (tsc +
  vitest + production build).

---

## [0.x] — Vertical slice (pre-1.0)
- Phaser vertical slice: core sim, save/load, domino shop, prestige (YM-W1/W2).
- Domino / wishing-well generator UI (YM-W3).
- Content expansion: 15 prompts, milestone stamps + stamp book, full offline
  progress, save v2 (YM-W4).
- Tier-2 prompt pool + flavor lines (YM-W5).
- Click juice: squash animation, particle burst, Web Audio click pop + mute
  toggle (YM-W6).
