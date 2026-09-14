// Speech: pre-generated neural voice clips in audio/<lang>/<clipId>.mp3
// (see scripts/gen_audio.py) — the same warm human-like voice on every
// phone, both languages. If a clip is missing or fails, fall back to the
// phone's speech engine. To use a parent-recorded voice for any phrase,
// just replace its mp3 file.

import { t, tEn, getLang } from './i18n.js';

let captionEl = null;
let captionTimer = 0;

export function initAudio(el) { captionEl = el; }

function showCaption(text) {
  if (!captionEl) return;
  captionEl.textContent = text;
  captionEl.classList.add('show');
  clearTimeout(captionTimer);
  captionTimer = setTimeout(() => captionEl.classList.remove('show'), 3000);
}

// ── Fallback: phone's own speech engine ─────────────────────────
// Prefer the natural/neural voices over the robotic defaults.
// Voices load async, so keep re-checking on voiceschanged.
let enVoice = null;
let kmVoice = null;

function voiceScore(v) {
  let s = 0;
  if (/natural|neural|premium|enhanced/i.test(v.name)) s += 4;
  if (/google/i.test(v.name)) s += 3;
  if (/samantha|karen|moira|daniel/i.test(v.name)) s += 2;
  if (v.lang === 'en-US') s += 1;
  return s;
}

function refreshVoices() {
  const voices = speechSynthesis.getVoices() || [];
  kmVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith('km')) || null;
  enVoice = voices
    .filter(v => (v.lang || '').toLowerCase().startsWith('en'))
    .sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
}
if ('speechSynthesis' in window) {
  refreshVoices();
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

function speakFallback(key, vars, caption) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const km = getLang() === 'km' && kmVoice;
  const u = new SpeechSynthesisUtterance(km ? caption : tEn(key, vars));
  const voice = km ? kmVoice : enVoice;
  if (voice) { u.voice = voice; u.lang = voice.lang; }
  else u.lang = 'en-US';
  u.rate = 0.9;
  u.pitch = 1.05;
  speechSynthesis.speak(u);
}

// ── Clip playback ────────────────────────────────────────────────
let currentClip = null;

function playClip(lang, clipId) {
  return new Promise((resolve, reject) => {
    const a = new Audio(`audio/${lang}/${clipId}.mp3`);
    currentClip?.pause();
    currentClip = a;
    a.onended = resolve;
    a.onerror = () => reject(new Error('clip missing'));
    a.play().catch(reject);
  });
}

// Speak the string for `key` in the current language, with caption.
// clipId names the audio file when the phrase has variants
// (e.g. `tap_letter_B`); defaults to the key itself.
export function say(key, vars = {}, clipId = key) {
  const caption = t(key, vars);
  showCaption(caption);
  speechSynthesis?.cancel?.();
  playClip(getLang(), clipId).catch(() => speakFallback(key, vars, caption));
}

// Speak a number 1-10 while counting.
export function sayNumber(n) {
  say(`num_${n}`);
}

// Short reward jingle via WebAudio — no asset files needed.
let ctx = null;
export function chime(kind = 'win') {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 'win' ? [523, 659, 784, 1047] : [330, 262];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch { /* audio is a nice-to-have; never break the game over it */ }
}
