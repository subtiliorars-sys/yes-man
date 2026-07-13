# Yes Man — Game Design Document (v1.0)

> *"The truth of an idea is not a stagnant property inherent in it. Truth
> happens to an idea. It becomes true, is made true by events."* — William James

## 1. Vision

**Yes Man** is a warm, funny idle/incremental game about the quiet super-power
of saying *yes*. You tap a big friendly YES button, recruit a chorus of
enthusiastic helpers (a dog, a supportive friend, an over-caffeinated optimism
robot), and watch **Cheer** ripple outward across the world.

It is designed to be a **blessing to play**: no timers, no FOMO, no dark
patterns. You can play it for five minutes or for thirty hours. It will be
kind to you either way.

- **Audience:** adults who want a cozy, witty, low-stress game — and the kids
  watching over their shoulder, who get the colors, the dog, and the sounds
  even if they miss the jokes.
- **Sessions:** 30 seconds to 30 minutes. Full offline progress means stepping
  away is *encouraged*, not punished.
- **Length:** ~20–30 hours to the full prestige bloom, plus a long tail of
  collectibles and secrets for the people who fall in love with it.

## 2. Design Pillars

1. **Honest Delight.** Every system is generous. Surprises are gifts, never
   bait. If you miss a Golden Yes, another comes along.
2. **Comedy with Heart.** The writing is genuinely funny but never mean. The
   joke is always *for* the player, never at their expense.
3. **Pragmatist Soul.** The theme is American Pragmatism (James, Dewey,
   Peirce): an idea is "true" by what it *does*. Saying yes is a small act with
   large, compounding consequences — exactly the loop of an idle game.
4. **Mirror Shine.** It should feel polished to the point that a reviewer
   struggles to find a flaw: tight feel, readable UI, no jank, no data loss.

## 3. Core Loop

```
TAP YES ──▶ gain Cheer ──▶ buy Auto-Yesers (generators) ──▶ Cheer/sec
   ▲                                                            │
   └──────── spend on Upgrades & answer Prompts ◀──────────────┘
                         │
                  reach a threshold
                         ▼
              "A Fresh Outlook" (prestige) ──▶ permanent multiplier
```

- **Cheer** — the single soft currency. Earned by tapping and passively.
- **Auto-Yesers** — 7 generators (Enthusiastic Dog → Cosmic Yes) on a domino
  track that doubles as a progress vista.
- **Upgrades** — 8 one-time multipliers (click value, CPS, synergy, cascade).
- **Prompts** — little "say yes to life?" cards that pop between clicks, in
  three flavor tiers unlocking with total Cheer (15 + 10 + 10 = 35 prompts).
- **Prestige** — *A Fresh Outlook*: optional, never punishing, grants a
  permanent ×0.25-per-level multiplier, up to 20 levels.

## 4. Delight Systems (v1.0 additions)

- **Golden Yes** — a glowing "YES!" bubble drifts across the screen every
  ~75–165s. Tapping it grants a burst (≥40 clicks, or 60s of current CPS —
  whichever is larger). Honest by design: untimed appearance, no penalty for
  missing one.
- **Stamp Book** — 17 milestone stamps. Permanent, no missables, survive
  prestige.
- **Secrets** — 10 hidden Easter eggs for collectors (Konami code, the answer
  to everything, a William James wink, a very good dog, and more). Undiscovered
  secrets show as `???` so the count is visible but the surprise is intact.
- **Collection book** — tabbed Stamps + Secrets, with a live `x / y` count.

## 5. Economy (tunable constants in `src/sim/economy.ts`)

| Lever | Value | Notes |
| --- | --- | --- |
| Generator cost growth | ×1.15 | Classic idle curve |
| Prestige threshold | 100K, ×1.5/level | Gentle ramp |
| Max prestige | 20 | The "full bloom" |
| Prompt tier thresholds | 5K / 25K total Cheer | Tiers 2 / 3 |
| Golden interval | 75–165s | First one early (25–55s) |
| Golden reward | max(60s CPS, 40 clicks) | Scales all game |
| Offline window | 30 days | Generous, never punitive |

Balance is centralized and unit-tested; a designer can retune the entire curve
without touching presentation code.

## 6. Ethics (see `GOVERNANCE.md`)

- No FOMO timers, no missable dailies, no loot boxes, no pay-to-win.
- Full offline progress; all costs shown upfront.
- Recovery-adjacent *tone* (feel-good affirmations) — never clinical claims.
- Player owns their data: one-tap **Export / Import** backup; honest, confirmed
  **Start Over**.

## 7. Accessibility

- **Reduce Motion** toggle (disables particles + squash + golden pulse).
- **Sound on/off** with persistent preference.
- High-contrast amber-on-cream palette; system-ui fonts for legibility.
- Portrait 480×800, touch-first, single-hand playable.

## 8. Architecture

- **`src/sim/`** — pure, deterministic, fully unit-tested game logic
  (engine, economy, stamps, secrets, persistence, offline, prefs). No Phaser.
- **`src/scenes/`** — Phaser presentation (GameScene + modal panels).
- **`src/audio/`** — Web Audio SFX (no asset files; synthesized pops).
- Clean seam between sim and view keeps logic testable and portable to a future
  native/mobile shell.

## 9. Out of Scope for v1.0 (see `docs/ROADMAP.md`)

Cloud save, leaderboards, seasonal cosmetic events, and the sequel
*No Is a Complete Sentence* are designed but deliberately deferred.
