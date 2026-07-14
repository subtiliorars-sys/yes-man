# Yes Man

**Live:** [Play Yes Man](https://subtiliorars-sys.github.io/yes-man/) — tap YES, build helpers, spread Cheer. No timers, no FOMO.

A warm, funny **idle game about the quiet super-power of saying yes**. Tap a
friendly YES button, build a chorus of enthusiastic helpers, and spread Cheer
across the world — with no timers, no FOMO, and full offline progress.

First title in the MeniscusMaximus ship order. Built with Phaser 3 + TypeScript.

**Repo:** https://github.com/subtiliorars-sys/yes-man
**Status:** v1.0 production candidate — full game loop, collectibles, secrets,
settings, accessibility. `verify` green.


### First-run tip

Open [Play](https://subtiliorars-sys.github.io/yes-man/) (or `npm run dev`). Say YES to keep the chain alive — check Settings for controls; the first run shows a one-time tip.

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

## How to play

1. **Tap YES** (or press Space / Enter) to earn **Cheer**.
2. When you can afford them, buy **generators** in the domino row — they passively add Cheer/sec.
3. Tap **UPGRADES** rows below the domino shop to boost clicks or generator output.
4. Occasionally answer **prompt cards** for bonus Cheer (optional — tap the card to accept).
5. **Stamps** track milestones; open the Stamps button (top right) to see what you have unlocked.
6. **Prestige** (optional, purple button when eligible) resets Cheer and generators but keeps stamps and raises your permanent multiplier. Nothing expires while you are away — offline progress is applied on return.

Progress saves automatically in your browser. No account required.

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

## First session

New players: see `docs/FIRST-SESSION.md` for what the first minutes include — and what they deliberately do **not** (no FOMO timers, no forced account).

## Playtesting

The build includes a local-first **Playtest + feedback** hub for opt-in tester notes, design votes, triage, invite sharing, and JSON export. See `PLAYTESTING.md` for the public playtest URL, community outreach copy, deployment notes, and the feedback review workflow.

Distribution drafts (itch.io share kit) live in `docs/ITCHIO_SHARE_KIT.md` — internal only until owner ethics review.

After GitHub Pages deploys, share the playtest landing page:

```text
https://subtiliorars-sys.github.io/yes-man/playtest.html
```

## Waves

See `WAVES.md` for autonomous worker queue.

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


## Shared asset libraries

**Agents:** do not invent colored-box placeholders when free art exists.
See [docs/ASSETS.md](docs/ASSETS.md) â†’ `game-visual-assets`, `game-audio-assets`, `game-3d-assets`.
