# Yes Man

A warm, funny **idle game about the quiet super-power of saying yes**. Tap a
friendly YES button, build a chorus of enthusiastic helpers, and spread Cheer
across the world — with no timers, no FOMO, and full offline progress.

First title in the MeniscusMaximus ship order. Built with Phaser 3 + TypeScript.

**Repo:** https://github.com/subtiliorars-sys/yes-man
**Status:** v1.0 production candidate — full game loop, collectibles, secrets,
settings, accessibility. `verify` green.

## Play / develop

```bash
npm install
npm run dev      # play in your browser
npm run verify   # tsc + vitest + production build (the CI gate)
```

## What's in the game

- **One-tap joy** — squash, particles, and a soft synth pop on every YES.
- **7 Auto-Yesers** — from the Enthusiastic Dog to the Cosmic Yes.
- **8 upgrades** + optional, never-punishing **prestige** ("A Fresh Outlook").
- **35 "say yes to life" prompts** across three unlocking tiers.
- **Golden Yes** — surprise bonus bubbles, delightful and never timed-FOMO.
- **Collection book** — 17 stamps + 10 hidden secrets for completionists.
- **Settings** — Sound, Reduce Motion, Journey stats, Export/Import, Start Over.
- **Honest idle** — 30-day offline window, costs upfront, local-only saves.

## Project layout

| Path | What |
| --- | --- |
| `src/sim/` | Pure, deterministic, unit-tested game logic (no Phaser) |
| `src/scenes/` | Phaser presentation — GameScene + modal panels |
| `src/audio/` | Synthesized Web Audio SFX (no asset files) |
| `docs/` | GDD, Steam store copy, press kit, marketing, community, roadmap, mobile |

## Ethics

No dark patterns: full offline progress, optional prestige, no FOMO timers, no
loot boxes, no real-money progression. See `GOVERNANCE.md` and `docs/GDD.md`.

## Docs

- `docs/GDD.md` — game design & the pragmatist theme
- `docs/STEAM_STORE.md` — store page copy _(owner approval before publishing)_
- `docs/PRESS_KIT.md` · `docs/MARKETING.md` · `docs/COMMUNITY.md`
- `docs/ROADMAP.md` — post-launch + the sequel *No Is a Complete Sentence*
- `docs/MOBILE.md` — iOS/Android rollout path
- `CHANGELOG.md` · `CONTRIBUTING.md` · `CODE_OF_CONDUCT.md`

## Next

- Owner: visual QA pass at 480×800, then store page + Steam Direct (per
  `GOVERNANCE.md`).
- v1.1 free drop: tier-4 prompts + new secrets (scaffolded in `docs/ROADMAP.md`).
- Mobile port via Capacitor (`docs/MOBILE.md`).
