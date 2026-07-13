# Yes Man

Incremental idle game â€” first title in the MeniscusMaximus ship order. Phaser 3 + TypeScript.

**Repo:** https://github.com/subtiliorars-sys/yes-man  
**Status:** Week 1â€“2 slice â€” core sim, Phaser UI, save/load, domino shop, prestige.

## Commands

```powershell
npm install
npm run dev      # play in browser
npm run verify   # tsc + vitest + build
```

## Ethics

No dark patterns: full offline progress, optional prestige, no FOMO timers. See `GOVERNANCE.md` and `MeniscusMaximus/YES_MAN_GDD.md`.

## First session

New players: see `docs/FIRST-SESSION.md` for what the first minutes include — and what they deliberately do **not** (no FOMO timers, no forced account).

## Playtesting

The build includes a local-first **Playtest + feedback** hub for opt-in tester notes, design votes, triage, invite sharing, and JSON export. See `PLAYTESTING.md` for the public playtest URL, community outreach copy, deployment notes, and the feedback review workflow.

Distribution drafts (itch.io share kit) live in `docs/ITCHIO_SHARE_KIT.md` â€” internal only until owner ethics review.

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


