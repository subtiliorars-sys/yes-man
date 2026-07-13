# Yes Man — Wave Registry

One wave = one PR. Branch prefix: `automation/wave-*` or `work/*`. Verify: `npm run verify`.

## Active queue

_(empty — next wave after YM-W24 merges)_

## Completed — GDD fixes (W19–W22) · merged to `main` 2026-06-21

### Wave YM-W19 — Prestige keeps prompt progress · `done`
- Stop resetting `nextPromptIndex` on prestige; test + confirm dialog copy update

### Wave YM-W20 — GDD achievement stamps · `done`
- Yes Sage (10 prestige); Overflowing run (1M Cheer peak via `runPeakCheer`)

### Wave YM-W21 — Playtest reset save · `done`
- `clearSave()` in persistence; Reset game save button in Playtest hub

### Wave YM-W22 — Playtest docs sync · `done`
- PLAYTESTING.md snapshot fields; export snapshot `runPeakCheer`

### Wave YM-W23 — itch.io share kit · `done` 2026-07-03
**Branch:** `automation/wave-ym-w23-itchio-kit` · PR #7
- [x] itch.io share kit + screenshot captions — `docs/ITCHIO_SHARE_KIT.md`

## Completed — Sprint 2026-06-20 (W7–W18)

Merged to `main` via PR #5 · Deployed GitHub Pages.

W7–W18: tier 3–6 prompts (60 total), keyboard YES, click milestones, SFX juice, background tiers, welcome back, domino flavor, generator chimes, prestige UX, playtest export, mobile tap targets.

### Wave YM-W24 — Mobile tap targets + export snapshot polish · `done` 2026-06-28
**Branch:** `automation/wave-ym-w24-mobile-tap-polish`
- [x] 44px min hit areas on header, playtest, prestige, prompt, domino buy buttons
- [x] Export snapshot includes earned `stampIds` for triage

### Wave YM-V1 — v1.0 production polish
**Status:** `in_review`
**Branch:** `claude/indie-clicker-game-j14xhs` · PR #3
- [x] Golden Yes surprise bubbles (honest, no FOMO)
- [x] Easter-egg / secrets system (10 collectibles) + tabbed Collection book
- [x] Settings panel: Sound, Reduce Motion, Journey stats, Export/Import/Reset
- [x] New stamps (25 total) incl. completion capstone
- [x] Large-number formatting (K→Dc) + playtime tracking
- [x] Mobile-tuned index.html; clean production build
- [x] Full sales/community/sequel docs package (`docs/`)
- [x] `npm run verify` green
- [ ] Owner visual QA pass at 480×800

## Completed waves (earlier)

### Wave YM-W1 — Phaser vertical slice · `done` 2026-06-13
### Wave YM-W2 — Persistence + upgrades + prestige · `done` 2026-06-13
### Wave YM-W3 — Domino / wishing-well upgrade UI · `done` 2026-06-13
### Wave YM-W4 — Content expansion · `done` PR #1
### Wave YM-W5 — Prompt tiers + tier 2 · `done` PR #1
### Wave YM-W6 — Click juice + sound stubs · `done` PR #2

## Blocked (owner)
- Steam store page publish / Steam Direct / pricing (copy ready in
  `docs/STEAM_STORE.md`)
- Final capsule art, screenshots, trailer
- *No Is a Complete Sentence* reskin until Yes Man v1 ships (sketch in
  `docs/ROADMAP.md`)
