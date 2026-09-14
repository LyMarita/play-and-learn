# Play & Learn — project rules

Kids learning PWA for Marita's 4-year-old. Live: https://lymarita.github.io/play-and-learn/
Vision and full backlog: **`claude-notes/todo.md`** (gitignored) — read it before adding anything.

## Git
- **AUTO-COMMIT repo**: commit + push without asking (Marita's standing rule for this project). Never a co-author line.
- Deploy = push to `main` (GitHub Pages, repo root).

## Deploy discipline (every deploy, no exceptions)
1. Bump `VERSION` in `sw.js` AND `APP_VERSION` in `js/app.js` (same number, e.g. pal-v8 / v8). Phones show the tag bottom-right of the hub — this is how Marita verifies what she's running.
2. New files that must work offline → add to `ASSETS` in `sw.js` (audio clips are runtime-cached automatically, don't precache them).
3. After push, verify live: `curl` the changed file on lymarita.github.io until it serves.

## Code pattern
- Pure game logic in `js/engine/` — TDD with `node --test 'tests/*.test.js'` (run before every push; must stay green).
- One game = one module in `js/modules/` exporting `{ id, titleKey, icon, start(root, api) }` + one registry line in `js/app.js` + strings in `js/i18n.js`.
- UI is vanilla ES modules, no framework, no build step. Emoji art. Age-4 rules: everything spoken, no fail states, big targets, stars only.

## Voice audio
- All speech = pre-generated neural mp3s: `uv run --with edge-tts python scripts/gen_audio.py` (skips existing files; phrase table in that script must mirror `js/i18n.js`).
- Sets: `audio/en-jenny/`, `audio/km-sreymom/`, `audio/km-piseth/` (hub has a KM voice switch). New phrases → add to BOTH i18n.js and gen_audio.py, regenerate, commit the mp3s.
- Khmer letter names must always play from a km set even in EN mode.
- Fallback chain in `js/audio.js`: clip → phone TTS (best-voice picker) → caption.
