# Play & Learn

Learning games for a little kid (age ~4). Pure static PWA — opens in any
phone browser (Android, Huawei, iOS), installable via "Add to Home Screen",
plays offline after the first visit.

## Games
- 🐰 **Bunny Maze** — arrange arrow tiles, press GO, guide the bunny to the
  carrot. First programming: sequencing + a repeat tile. 10 levels.
- 🔢 **Counting** — tap and count, then answer "how many?" (1–10).
- 🎨 **Colors & Shapes** — find the red circle.
- 🔤 **Letters ABC** — tap the letter it says.

## Language
EN/ខ្មែរ toggle in the top bar. English speaks via the phone's built-in
voice. Khmer speaks pre-recorded clips: record a phrase, save it as
`audio/km/<key>.mp3` (keys = `js/i18n.js`), and add the key to `KM_CLIPS`
in `js/audio.js`. Missing clips fall back to Khmer caption + English voice.

## Run locally
```bash
python3 -m http.server 8123
# open http://localhost:8123
```

## Tests
```bash
node --test 'tests/*.test.js'
```
Game logic (maze simulation, level solvability, round generators) is pure JS
under `js/engine/` and fully unit-tested.

## Add a new game
1. Create `js/modules/<name>.js` exporting `{ id, titleKey, icon, start(root, api) }`.
2. Add its strings to `js/i18n.js`.
3. Import + add one line to `MODULES` in `js/app.js`.
4. Add its files to `ASSETS` in `sw.js` and bump `VERSION`.

## Deploy
GitHub Pages serves the repo root. On every deploy bump BOTH `VERSION` in `sw.js` AND `APP_VERSION` in `js/app.js` (the tag shown on the hub) so phones refresh their offline copy and the running version is visible.

