// Speech: English via the phone's built-in voice (Web Speech API).
// Khmer via pre-recorded clips in audio/km/<key>.mp3 — list each recorded
// clip in KM_CLIPS below. Missing clip => Khmer caption + English voice.

import { t, tEn, getLang } from './i18n.js';

// Add a key here after dropping its recording into audio/km/<key>.mp3
const KM_CLIPS = new Set([
  // 'great_job', 'try_again', ...
]);

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

// Phones ship several voices of very different quality. Prefer the
// natural/neural ones over the robotic defaults. Voices load async,
// so keep re-checking on voiceschanged.
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

function speakEnglish(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (enVoice) u.voice = enVoice;
  u.lang = enVoice?.lang || 'en-US';
  u.rate = 0.9;
  u.pitch = 1.05;
  speechSynthesis.speak(u);
}

function speakKhmer(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = kmVoice;
  u.lang = kmVoice.lang;
  u.rate = 0.9;
  u.pitch = 1.05;
  speechSynthesis.speak(u);
}

// Speak the string for `key` in the current language, with caption.
export function say(key, vars = {}) {
  const caption = t(key, vars);
  showCaption(caption);
  if (getLang() === 'km') {
    // recorded clip (parent's voice) > phone's Khmer voice > English voice
    if (KM_CLIPS.has(key)) {
      speechSynthesis?.cancel?.();
      new Audio(`audio/km/${key}.mp3`).play().catch(() => speakEnglish(tEn(key, vars)));
    } else if (kmVoice) {
      speakKhmer(caption);
    } else {
      speakEnglish(tEn(key, vars));
    }
  } else {
    speakEnglish(tEn(key, vars));
  }
}

// Speak a raw word (already localized upstream), e.g. counting "1, 2, 3".
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
