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

## Ethics

No dark patterns: full offline progress, optional prestige, no FOMO timers. See `GOVERNANCE.md` and `MeniscusMaximus/YES_MAN_GDD.md`.

## Playtesting

The build includes a local-first **Playtest + feedback** hub for opt-in tester notes, design votes, triage, and JSON export. See `PLAYTESTING.md` for community outreach copy and the feedback review workflow.

## Waves

See `WAVES.md` for autonomous worker queue.

## Next

- Domino / wishing-well upgrade panel (prototype parity)
- Prompt content expansion (60 prompts)
- GitHub Actions verify CI
- Pair reskin: *No Is a Complete Sentence*
