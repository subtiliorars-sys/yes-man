# Yes Man — Mobile Rollout Plan

> The game is already built mobile-first; this is the path to store-ready iOS &
> Android builds. No code rewrite is required.

## Why it's already close

- **Portrait 480×800, touch-first.** Phaser `Scale.FIT` + `CENTER_BOTH` adapts
  to any aspect ratio with letterboxing. All input is `pointerdown` (works for
  mouse and touch identically).
- **No keyboard dependency for core play.** The only keyboard feature is the
  Konami-code secret, which is intentionally desktop-only flavor.
- **Self-contained bundle.** One JS bundle + one HTML file; no backend.
- **`index.html` is already tuned for mobile:** `viewport-fit=cover`,
  `user-scalable=no`, `touch-action: manipulation`, tap-highlight disabled.
- **Saves are local and portable** via `localStorage` + Export/Import codes.

## Recommended shell: Capacitor

Wrap the existing Vite `dist/` build in [Capacitor](https://capacitorjs.com):

1. `npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
2. `npx cap init "Yes Man" com.meniscusmaximus.yesman --web-dir=dist`
3. `npm run build && npx cap copy`
4. `npx cap add ios && npx cap add android`
5. Open in Xcode / Android Studio to set icons, splash, and submit.

Capacitor keeps `localStorage` working and gives native splash/icon/haptics
with near-zero code change.

## Mobile-specific polish (pre-submission checklist)

- [ ] **Safe-area insets** — pad the top HUD for notches (`env(safe-area-inset-*)`).
- [ ] **Haptics** — light tap on YES and a richer buzz on Golden Yes
      (`@capacitor/haptics`), respecting an in-game toggle.
- [ ] **Audio unlock** — already handled: `AudioContext` resumes on first tap.
- [ ] **Lifecycle saves** — also `trySave` on `pause`/`visibilitychange`
      (mobile OSes kill backgrounded apps; the existing `shutdown` save covers
      web, add a visibility hook for native).
- [ ] **Icons & splash** — from the capsule art (`docs/STEAM_STORE.md`).
- [ ] **Store listings** — reuse `docs/STEAM_STORE.md` copy, trimmed to limits.

## Monetization (mobile)

Free download. A single **cosmetic** "Tip the Dog" IAP (a hat for the
Enthusiastic Dog, a thank-you). **Never** a progression paywall, never ads that
gate play — per `GOVERNANCE.md`. The tip is gratitude, not a gate.

## Store compliance notes

- **No gambling mechanics** — Golden Yes and prompts are deterministic gifts,
  not wagers; nothing is purchasable with real money for a randomized outcome.
- **Privacy** — no data collected, no network calls. A one-line privacy policy
  ("Yes Man stores your save on your device and sends nothing online") satisfies
  both stores; owner hosts it.
- **Age rating** — Everyone / 4+. Mild comedic themes only.

## Performance

- Single autosave timer (5s) + event-driven saves; cheap per-frame `tick`.
- Particle counts are small and **Reduce Motion** disables them — good for
  low-end devices and battery.
