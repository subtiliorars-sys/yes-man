# Yes Man

Incremental idle game — first title in the MeniscusMaximus ship order. Phaser 3 + TypeScript.

**Repo:** https://github.com/subtiliorars-sys/yes-man  
**Status:** Week 1–2 slice — core sim, Phaser UI, save/load, domino shop, prestige.

## Commands

```powershell
npm install
npm run dev      # play in browser
npm run verify   # tsc + vitest + build
```

## How to play

1. **Tap YES** (or press Space / Enter) to earn **Cheer**.
2. When you can afford them, buy **generators** in the domino row — they passively add Cheer/sec.
3. Tap **UPGRADES** rows below the domino shop to boost clicks or generator output.
4. Occasionally answer **prompt cards** for bonus Cheer (optional — tap the card to accept).
5. **Stamps** track milestones; open the Stamps button (top right) to see what you have unlocked.
6. **Prestige** (optional, purple button when eligible) resets Cheer and generators but keeps stamps and raises your permanent multiplier. Nothing expires while you are away — offline progress is applied on return.

Progress saves automatically in your browser. No account required.

## Ethics

No dark patterns: full offline progress, optional prestige, no FOMO timers. See `GOVERNANCE.md` and `MeniscusMaximus/YES_MAN_GDD.md`.

## Playtesting

The build includes a local-first **Playtest + feedback** hub for opt-in tester notes, design votes, triage, invite sharing, and JSON export. See `PLAYTESTING.md` for the public playtest URL, community outreach copy, deployment notes, and the feedback review workflow.

Distribution drafts (itch.io share kit) live in `docs/ITCHIO_SHARE_KIT.md` — internal only until owner ethics review.

After GitHub Pages deploys, share the playtest landing page:

```text
https://subtiliorars-sys.github.io/yes-man/playtest.html
```

## Waves

See `WAVES.md` for autonomous worker queue.

## Next

- Domino / wishing-well upgrade panel (prototype parity)
- Prompt content expansion (60 prompts)
- GitHub Actions verify CI
- Pair reskin: *No Is a Complete Sentence*
