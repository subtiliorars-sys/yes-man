# Yes Man Playtesting

Goal: invite as many useful playtesters as possible while keeping feedback ethical, consent-based, and reviewable.

## What is in the build

- The game has a **Playtest + feedback** button below the score area.
- Testers can submit category-tagged feedback and vote on current design decisions.
- Each submission includes an opt-in local play snapshot: Cheer, CPS, clicks, prestiges, stamps, generators, and upgrades.
- Feedback is stored locally in the browser until the tester exports JSON and shares it with the team.
- The export includes triage buckets:
  - `actionable`: detailed enough to use directly in issue planning.
  - `needs_review`: potentially useful, but needs human interpretation.
  - `likely_noise`: too short, repeated, placeholder, or otherwise low-signal.
- Exploit or mischievous reports are flagged as `mischief_or_exploit`. Reproducible exploit reports can still become `actionable`.

## Tester call-to-action

Ask testers to play for 3-5 minutes, then submit:

1. One thing that was fun.
2. One thing that was confusing, slow, broken, or abusable.
3. Votes on any design decisions they have an opinion about.
4. Exported playtest JSON if they are willing to share the local report.

Use short sessions first. Fresh confusion is often more useful than polished feedback.

## Community outreach copy

### Short post

> We are playtesting **Yes Man**, a tiny cozy idle game about saying yes to increasingly silly things.  
> If you have 3-5 minutes, please try the build, tap **Playtest + feedback**, send one honest note, vote on any design prompts, and export the JSON if you are comfortable sharing it.  
> Especially helpful: where you got confused, what felt fun, and any way you managed to break the game.

### Discord / forum post

> Looking for playtest volunteers for **Yes Man**. It is an early Phaser idle game, so we need many quick reactions more than long essays.
>
> What to do:
> - Play for 3-5 minutes.
> - Press **Playtest + feedback** in the game.
> - Submit one concrete note: what you did, what you expected, and what happened or how it felt.
> - Vote yes/no/unsure on design decisions.
> - Export the playtest JSON and send it back if you consent.
>
> Mischief is welcome when it helps us improve the game: if you find an exploit, please include reproduction steps instead of just saying it is broken.

### Follow-up prompt

> Thank you for testing. If you only have time for one more note: what would make you want to keep clicking for another minute?

## Feedback review workflow

1. Combine exported JSON files from testers.
2. Review `actionable` submissions first and convert clear bugs or design issues into GitHub issues.
3. Review `mischief_or_exploit` flags separately:
   - Keep reports with steps, expected result, actual result, and a play snapshot.
   - Down-rank vague bragging, automation spam, or repeated text.
4. Sample `needs_review` for patterns. Promote repeated themes even when individual reports are weak.
5. Use `likely_noise` only for aggregate signals unless a human spots a real issue.
6. Summarize design votes by decision id before changing design direction.

## Volunteer roles

- **Fresh tester:** plays once and exports one report.
- **Regression tester:** retries a fixed issue and checks whether it is still broken.
- **Design voter:** approves, rejects, or marks uncertainty on open design decisions.
- **Mischief tester:** deliberately attempts exploits, reload tricks, local storage edits, or automation, then reports reproducible steps.

## Ethics guardrails

- No hidden telemetry. Testers must export and share reports themselves.
- No personal data is required. Tester handles are optional.
- Do not pressure testers with FOMO timers, rewards, or streaks.
- Treat negative feedback as useful when it is specific and consented.
