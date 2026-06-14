# Contributing to Yes Man

Thanks for wanting to help! Yes Man is built with care; the bar is "polished to
a mirror shine." Here's how to keep it there.

## Setup

```bash
npm install
npm run dev      # play locally at the printed URL
npm run verify   # tsc --noEmit && vitest run && vite build  (the CI gate)
```

`npm run verify` must pass before any PR. CI runs the same command.

## Architecture (please respect the seam)

- **`src/sim/`** — pure, deterministic game logic. **No Phaser, no DOM.**
  Everything here is unit-tested. New mechanics start here.
- **`src/scenes/`** — Phaser presentation only. Reads/writes state via the sim
  API; never embeds balance numbers directly.
- **`src/audio/`** — synthesized SFX (no asset files).
- Balance lives in `src/sim/economy.ts`. Tune there; don't scatter constants.

## Adding content (the easy wins)

- **A prompt:** add to a tier array in `economy.ts`.
- **A stamp:** add to `STAMP_DEFS` + a `qualifies()` case in `stamps.ts`, with a
  test.
- **A secret:** add to `SECRET_DEFS` in `secrets.ts`; wire a trigger in the
  scene or `evaluatePassiveSecrets`, with a test.

## Tests

- Every sim change needs a test. We keep the `src/sim` layer near-fully covered.
- Prefer deterministic tests (inject `rng` where needed, as `clickYes` does).

## Style

- TypeScript strict mode; match the surrounding code (system-ui fonts,
  `AMBER`/`INK` palette, `.js` import extensions for ESM/bundler resolution).
- Keep comments at the density of the file you're editing.

## The values bar (non-negotiable)

Read `GOVERNANCE.md`. No dark patterns, ever: no FOMO timers, no missable
dailies, no loot boxes, no real-money progression. If a change makes the game
less kind to the player, it doesn't ship — no matter how much it "engages."

## PRs

- One focused change per PR. Clear title + a short test plan.
- Don't merge your own PR; the owner merges when CI is green.
