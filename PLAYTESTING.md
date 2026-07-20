# Yes Man Playtesting

Goal: invite as many useful playtesters as possible while keeping feedback ethical, consent-based, and reviewable.

For itch.io listing drafts (title, tags, screenshot captions, store disclaimer), see `docs/ITCHIO_SHARE_KIT.md`. Owner must approve before any of that copy goes on a public store page.

**Known blocker:** no itch.io page URL exists anywhere in this repo or its
docs yet — `docs/ITCHIO_SHARE_KIT.md` is draft copy pending the owner's
ethics review, not a published listing. Any outreach post that references
an itch.io link (see venues below) needs that URL confirmed by the owner
first; until then, lead with the GitHub Pages playtest URL instead.

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

## Specific venues to recruit volunteer playtesters

Ranked by fit for a small, free, wholesome idle browser game. Rules change
over time — **owner should re-check the current sidebar/wiki rules of any
subreddit immediately before posting**, since these could not be fetched
live while drafting this list (Reddit blocks the fetch tool used here) and
are based on public knowledge plus web search summaries, not a direct read
of the live rules page.

1. **itch.io "Playtesting" community board** —
   `https://itch.io/board/385447/playtesting-`. Verified live and active as
   of this writing (recent threads within the last ~2 weeks). This is the
   single best first stop: no karma gate, explicitly for this purpose, has a
   pinned "Looking for Playtesters" post template to follow. Requires an
   itch.io project page to link to (see Blockers below).
2. **itch.io devlog on your own project page** — once the project page
   exists, a devlog post there is zero-risk self-promotion (it's your own
   page) and shows up in itch.io's devlog feed and followers' feeds. Draft
   below.
3. **r/incremental_games** — large, on-topic community for this exact genre.
   Known rules (owner should confirm current sidebar before posting): no
   referral/affiliate links, no spam, games built on templated "Idle Game
   Maker" tooling are barred (not a concern here, Yes Man is bespoke
   TypeScript/Phaser), and the general Reddit norm of not posting only
   self-promo content applies. Has historically welcomed genuine
   feedback/playtest requests when framed as such rather than a store pitch.
   **Verify current self-promo rule text in the sidebar before posting.**
4. **r/IndieDev** (~400k+ members) — broad indie-dev audience, regularly
   used for devlogs, WIP shares, and feedback asks. Many large subreddits in
   this space run a recurring "Feedback Friday" or similar megathread for
   exactly this kind of ask instead of a standalone post — **check the
   subreddit's current pinned/weekly-thread schedule before posting** so the
   post isn't removed as an off-day self-promo.
5. **r/playtesters** — small, purpose-built subreddit for exactly this ask
   (its whole premise is "post your game, get playtesters"). Lower reach
   than the two above but zero friction and on-topic by design. Could not
   verify current activity level or rule text directly (Reddit fetch
   blocked) — **owner should open the subreddit and confirm it's still
   active before relying on it.**
6. **r/WebGames** — fits well since Yes Man is a browser game with no
   install. Historically bans crypto-miner-laced pages (not a concern here)
   and is generally receptive to browser game submissions. **Owner should
   confirm current rules before posting**, since detailed current sidebar
   text could not be verified here.
7. **TIGSource forums — DevLogs board** (`forums.tigsource.com`, board 27)
   and its companion **Playtesting** board — a long-running, respected indie
   dev community. Posting a devlog thread there and cross-linking a
   playtest ask is a well-established norm; low pressure, thoughtful
   audience, good fit for the "honest idle" pitch.
8. **Existing project channels** (already covered above): personal
   devlog/newsletter, any Discord/forum the owner already has a presence in,
   and direct asks to trusted players. Cheapest and most reliable signal —
   do this regardless of which of the above the owner also tries.

Not recommended without more verification: broad "IndieDB" submission and
general Discord servers for incremental-game fans — real communities exist,
but no specific server invite or IndieDB posting norms could be verified
here. If the owner already belongs to one, that's a fine zero-effort add;
don't cold-join a server just to post a playtest ask, which reads as
low-effort self-promo in most Discords.

## Ready-to-paste posts for specific venues

### itch.io Playtesting board (uses the pinned template's fields)

> **Name of game:** Yes Man
> **Platform:** Browser (itch.io web build, no install)
> **What it is:** A tiny cozy idle game about saying yes to increasingly
> silly prompts — tap YES, stack Cheer, build passive helpers, and prestige
> only if you want to. No timers, no FOMO, no loot boxes.
> **What I need:** 3-5 minutes of your time. Play a bit, then use the
> in-game **Playtest + feedback** button to tell me one thing that was fun
> and one thing that was confusing, slow, or breakable. Design votes welcome
> too.
> **Session length:** 3-5 minutes minimum; longer is welcome but not needed.
> **Link:** *(itch.io project URL — owner to add once page is live)*
>
> Mischief testers welcome — if you find a way to break it, reproduction
> steps make it actionable instead of just "lol broken."

### r/IndieDev or Feedback Friday-style thread

> **Yes Man** — a tiny free browser idle game that tries hard not to
> manipulate you. Tap YES, build a chorus of Auto-Yesers, spread Cheer.
> Looking for a few playtesters willing to spend 3-5 minutes and leave one
> honest note (fun thing / confusing thing) through the in-game feedback
> hub. No account, no install, no dark patterns — full offline progress and
> an optional, never-required prestige. Link + more detail in comments if
> that's this sub's norm this week.

### TIGSource devlog / playtesting board post

> Hey folks — posting **Yes Man**, a small cozy idle game (Phaser 3 +
> TypeScript) built around one idea: an idle game that never pressures you.
> No FOMO timers, no missable dailies, full offline progress, and an
> optional prestige that only ever helps.
>
> It's playable now in the browser and has a built-in, opt-in **Playtest +
> feedback** hub — no hidden telemetry, testers export their own data if
> they want to share it. Would love 3-5 minutes from anyone willing: one
> thing that felt fun, one thing that felt confusing/slow/breakable, and any
> votes on open design questions. Exploit reports especially welcome if you
> include repro steps.
>
> Play: `https://subtiliorars-sys.github.io/yes-man/?playtest=1`

## Draft itch.io devlog post (once the page exists)

> ### Looking for a few playtesters
>
> Yes Man just got a built-in playtest hub, and I'd love a handful of fresh
> eyes on it. It's a tiny cozy idle game about saying yes to increasingly
> silly things — tap YES, build passive helpers, watch Cheer stack up. No
> timers, no FOMO, no loot boxes, and prestige is there if you want it, never
> because you have to.
>
> If you have 3-5 minutes: play a bit, tap **Playtest + feedback** in game,
> and tell me one thing that was fun and one thing that was confusing, slow,
> or (bonus points) breakable. There are a couple of open design questions
> in there too if you want to vote.
>
> No pressure, no account needed, and nothing you do is tracked unless you
> choose to export and share it. Thank you in advance to anyone who tries
> it — every honest note helps.
>
> Play in browser: *(itch.io page link goes here)*
> Direct playtest link: `https://subtiliorars-sys.github.io/yes-man/?playtest=1`

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
