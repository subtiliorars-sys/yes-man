# Yes Man Playtesting

Goal: invite as many useful playtesters as possible while keeping feedback ethical, consent-based, and reviewable.

For itch.io listing drafts (title, tags, screenshot captions, store disclaimer), see `docs/ITCHIO_SHARE_KIT.md`. Owner must approve before any of that copy goes on a public store page.

## What is in the build

- The game has a **Playtest + feedback** button below the score area.
- Public playtest links can use `?playtest=1` to open the hub automatically.
- The hub has a **Copy invite** button that prepares a tester-friendly share message.
- Testers can submit category-tagged feedback and vote on current design decisions.
- Each submission includes an opt-in local play snapshot: Cheer, CPS, clicks, prestiges, stamps (count + ids), generators, upgrades, prompt tier unlocked, prompts seen, and run peak Cheer.
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

## Public build distribution

After this feature lands on `main`, GitHub Actions publishes the Vite build with the `deploy-pages` workflow.

Expected public URL:

```text
https://subtiliorars-sys.github.io/yes-man/
```

Public landing page for outreach:

```text
https://subtiliorars-sys.github.io/yes-man/playtest.html
```

Recommended playtest URL:

```text
https://subtiliorars-sys.github.io/yes-man/?playtest=1
```

GitHub fallback report form:

```text
https://github.com/subtiliorars-sys/yes-man/issues/new?template=playtest-feedback.yml
```

If the Pages URL does not load after merge:

1. Open the repository settings.
2. Go to **Pages**.
3. Set the source to **GitHub Actions**.
4. Run the `deploy-pages` workflow manually.

The app is static and local-first, so broad sharing does not require a server or database. The tradeoff is that testers must export and send JSON themselves, or paste it into the GitHub playtest feedback form.

## Reasonable outreach plan

Share the playtest URL in places where quick indie-game feedback is welcome:

- Existing project Discord, forum, newsletter, or social account.
- Personal devlog update with the short post below.
- Indie game feedback channels that explicitly allow playtest requests.
- Small direct asks to trusted players who can give concrete notes.
- Follow-up with people who already exported JSON and ask whether they will retry a fix.

Avoid spammy cold blasts, paid engagement farms, or reward-for-positive-feedback asks. They create low-signal feedback and conflict with the no-dark-patterns governance.

## Community outreach copy

### Short post

> We are playtesting **Yes Man**, a tiny cozy idle game about saying yes to increasingly silly things.  
> If you have 3-5 minutes, please try the build, tap **Playtest + feedback**, send one honest note, vote on any design prompts, and export the JSON if you are comfortable sharing it.  
> Especially helpful: where you got confused, what felt fun, and any way you managed to break the game.

Add the playtest URL to the end of the post:

```text
https://subtiliorars-sys.github.io/yes-man/playtest.html
```

### Discord / forum post

> Looking for playtest volunteers for **Yes Man**. It is an early Phaser idle game, so we need many quick reactions more than long essays.
>
> What to do:
> - Play for 3-5 minutes.
> - Press **Playtest + feedback** in the game.
> - Submit one concrete note: what you did, what you expected, and what happened or how it felt.
> - Vote yes/no/unsure on design decisions.
> - Export the playtest JSON and send it back if you consent.
> - If export is awkward, use the GitHub playtest feedback form.
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
