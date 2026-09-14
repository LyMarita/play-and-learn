import { t, getLang, setLang } from './i18n.js';
import { initAudio, say, chime } from './audio.js';
import * as progress from './progress.js';
import maze from './modules/maze.js';
import counting from './modules/counting.js';
import colors from './modules/colors.js';
import letters from './modules/letters.js';

// Keep in sync with VERSION in sw.js — shown on the hub so anyone can
// tell which version a phone is actually running.
const APP_VERSION = 'v5';

// ── Module registry ──────────────────────────────────────────────
// Adding a game later = import it and add one line here.
const MODULES = [maze, counting, colors, letters];

const screen = document.getElementById('screen');
const starsEl = document.getElementById('stars');
const homeBtn = document.getElementById('homeBtn');
const langBtn = document.getElementById('langBtn');
const titleEl = document.getElementById('title');

function updateStars() {
  starsEl.textContent = `⭐ ${progress.totalStars()}`;
}

function updateLangBtn() {
  langBtn.textContent = getLang() === 'en' ? 'ខ្មែរ' : 'EN';
}

// Emoji confetti burst over the whole screen.
function burst(big = false) {
  const layer = document.getElementById('confetti');
  const emo = ['🎉', '⭐', '🌟', '🎈', '💖', '✨'];
  const n = big ? 26 : 12;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'confetti-bit';
    s.textContent = emo[Math.floor(Math.random() * emo.length)];
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 0.4}s`;
    s.style.fontSize = `${1.4 + Math.random() * 1.4}rem`;
    layer.appendChild(s);
    setTimeout(() => s.remove(), 2600);
  }
}

// API handed to every module — the only door back into the shell.
const api = {
  say,
  chime,
  progress,
  exit() { renderHub(); },
  smallWin() {
    progress.addStars(1);
    updateStars();
    chime('win');
    const praise = ['great_job', 'great_job_2', 'great_job_3'];
    say(praise[Math.floor(Math.random() * praise.length)]);
    burst(false);
  },
  bigWin() {
    progress.addStars(3);
    updateStars();
    chime('win');
    say('all_done');
    burst(true);
  },
  oops() {
    chime('sad');
    say('try_again');
  },
};

function renderHub() {
  titleEl.textContent = t('app_title');
  homeBtn.style.visibility = 'hidden';
  screen.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'hub-grid';
  for (const m of MODULES) {
    const card = document.createElement('button');
    card.className = 'hub-card';
    card.innerHTML = `<span class="hub-icon">${m.icon}</span>
                      <span class="hub-name">${t(m.titleKey)}</span>`;
    card.addEventListener('click', () => startModule(m));
    grid.appendChild(card);
  }
  screen.appendChild(grid);
  const ver = document.createElement('div');
  ver.className = 'version-tag';
  ver.textContent = APP_VERSION;
  screen.appendChild(ver);
  say('hub_welcome');
}

function startModule(m) {
  titleEl.textContent = t(m.titleKey);
  homeBtn.style.visibility = 'visible';
  screen.innerHTML = '';
  m.start(screen, api);
}

homeBtn.addEventListener('click', () => api.exit());

langBtn.addEventListener('click', () => {
  setLang(getLang() === 'en' ? 'km' : 'en');
  updateLangBtn();
  renderHub();
});

initAudio(document.getElementById('caption'));
updateStars();
updateLangBtn();
renderHub();

// PWA: offline cache + home-screen install.
// When a new deploy takes over, reload once so the update shows on the
// FIRST reopen instead of the second.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(reg => reg.update())
    .catch(() => {});
  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) location.reload();
    hadController = true;
  });
}
