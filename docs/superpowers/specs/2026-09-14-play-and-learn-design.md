# Play & Learn — Design Spec (approved 2026-09-14)

A learning-game hub for a 4-year-old. Opens on any smartphone browser
(Android, Huawei/HarmonyOS, iOS) as a PWA. Grows over time by adding modules.

## Platform & stack
- Pure static PWA: plain HTML/CSS/JS (ES modules), no framework, no build step.
- Hosted on GitHub Pages (free). Update = git push. Cloudflare Pages is the
  fallback host if ever needed — same repo, ten-minute switch.
- Installable via "Add to Home Screen"; service worker caches for offline play.

## Architecture — module registry
- Hub screen = menu grid. Each game registers `{ id, title, icon, start() }`.
- Adding a future game = one JS file in `js/modules/` + one registry line.
- Modules own their screen fully; exit returns to hub. Shared state = progress
  store only.
- Game logic lives in pure functions under `js/engine/` — unit-tested with the
  Node built-in test runner (`node --test`), no browser required.

## V1 modules
1. **Coding maze** — drag/tap arrow tiles into a plan bar, press GO; bunny hops
   cell-by-cell toward the carrot. 10 levels: 1 step → obstacles → a simple
   repeat tile ("do that again") at the end. Teaches sequencing.
2. **Counting** — "Tap the apples!" Each tap counts aloud; then "how many?"
   with 3 number buttons. Numbers 1–10.
3. **Colors & shapes** — "Find the red circle" — tap the right one of four.
4. **Letters ABC** — "Tap the letter B" — tap the right one of four.
   (Finger-tracing is a later iteration.)

## Age-4 UX rules
- Zero reading required: every instruction spoken.
- Big touch targets, no timers, no fail states — wrong answer = gentle
  "try again", never a game over.
- Stars are the only reward currency.
- Art is emoji-based at V1 (renders everywhere, zero assets); upgradeable to
  SVG art later without touching game logic.

## Language — Khmer + English
- KH/EN toggle on the hub.
- English: phone built-in speech (Web Speech API).
- Khmer: pre-recorded clips in `audio/km/<key>.mp3` (parent-recorded welcome).
  Missing clip fallback: show Khmer text caption + English voice.

## Progress
- Stars + completed levels in `localStorage`. Per device, no accounts,
  no server, nothing personal leaves the phone.

## Testing
- Engines (maze simulation, level definitions, round generators) = pure JS,
  unit-tested via `node --test tests/`.
- Every maze level carries a known `solution`; a test proves each is solvable.
- Touch/UI verified by hand on a real phone via the GitHub Pages URL.
