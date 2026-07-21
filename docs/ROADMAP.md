# Yes Man — Roadmap & Sequel Sketches

> What ships in v1.0, what comes after, and where the series goes. Post-launch
> scope and dates are owner-approved.

## v1.0 — "Say Yes" (this release)

Shipped and verified:

- Core loop: tap, 7 generators, 8 upgrades, 35 prompts (3 tiers), prestige (×20).
- Golden Yes surprise bubbles.
- Collection book: 17 stamps + 10 secrets.
- Settings: Sound, Reduce Motion, Export/Import, Start Over, Journey stats.
- Full offline progress (30-day window), large-number formatting (K→Dc),
  autosave + on-shutdown save.
- 41 deterministic unit tests over the sim layer; clean `verify` (tsc +
  vitest + build).

## v1.1 — "More Yes" (free, ~Day 30)

Shipped ahead of schedule, in the W7–W18 sprint (see `WAVES.md`):

- **Tier 4–6 prompts** (30 more, 60 total across six tiers) unlocking at
  100K / 500K / 2M total Cheer. Wired into `promptPool` in `engine.ts`.
- **Matching stamps** — `tier4_unlock`, `tier5_unlock`, `tier6_unlock`.
- 10 secrets (the full v1.0 target) already shipped; no new ones queued.

Remaining from the original v1.1 scope:

- **Steam Achievements** mapped 1:1 to stamps (native shell hook) — still
  pending, blocked on Steam Direct per `WAVES.md`.

## v1.2 — "Cloud & Cosmetics"

- Steam Cloud save (wrap `exportSave`/`importSave` over the cloud blob).
- Cosmetic YES-button skins unlocked by milestones (no purchase).
- Optional color themes (sunrise / dusk / mint).

## v1.3 — "Mobile" (see `docs/MOBILE.md`)

- Capacitor/native shell, store builds, cosmetic-only tip jar.

## Backlog / Ideas (unprioritized)

- A gentle "story" of vignettes that unlock with prestige blooms.
- Seasonal *cosmetic* events (never FOMO; permanent unlocks).
- Localization (strings are centralized; text volume is low by design).
- Accessibility: colorblind-safe palette variants, font-size slider.

---

## Sequel Sketch — *No Is a Complete Sentence*

> The companion piece, deliberately the **inverse** of Yes Man. Where Yes Man
> is about expansive, compounding *yes*, the sequel is about the equally
> powerful, equally kind art of the boundary: the well-placed **no**.

**Logline:** A cozy idle game about protecting your peace. You don't generate
Cheer by saying yes to everything — you generate **Calm** by saying *no* to the
right things, reclaiming time and energy that compound into a quiet, spacious
life.

**Design inversion (the hook):**

| Yes Man | No Is a Complete Sentence |
| --- | --- |
| Currency: **Cheer** (outward) | Currency: **Calm** (inward) |
| Generators: enthusiastic helpers | "Boundaries" that *block* drains |
| Prompts: say yes to life | Requests you can decline (guilt-free) |
| Golden Yes: bonus burst | Quiet Moment: a still, restorative pause |
| Prestige: A Fresh Outlook | Prestige: A Clean Slate |

**Pragmatist throughline:** both games are about *acts having consequences*.
Yes and No are the same lesson from two sides — agency is real, and small
choices compound. The two titles are designed to be played as a pair.

**Tech reuse:** the `src/sim` architecture is engine-agnostic and directly
reusable. A "No" reskin swaps `economy.ts` content, relabels currency, and
inverts a handful of strings — the loop, persistence, offline, stamps, and
secrets systems carry straight over. Original plan called this a "pair reskin";
the clean sim/view split makes it largely a content + theming effort.

**Sequencing:** *No Is a Complete Sentence* is gated until **Yes Man v1 ships**
(per `WAVES.md` blocked list) so the first title gets full polish and a clean
launch before attention splits.

### Series vision

A small shelf of kind, honest, single-idea idle games — *Yes*, *No*, and
perhaps *Maybe* (a game about sitting comfortably with uncertainty) — each
taking one tiny human truth seriously, each a blessing to play.
