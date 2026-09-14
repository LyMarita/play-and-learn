// Pure round generators — rng is injected so tests are deterministic.

// mulberry32: tiny seeded PRNG, plenty for game rounds.
export function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function shuffle(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const COUNT_EMOJI = ['🍎', '🍌', '🐤', '⭐', '🎈', '🐟', '🍓', '🦋'];

// stage 0 → counts 1-3, stage 1 → 1-5, stage 2 → 1-7, stage 3+ → 1-10
export function makeCountingRound(rng, stage) {
  const max = Math.min(10, 3 + Math.max(0, stage) * 2 + (stage >= 3 ? 1 : 0));
  const count = 1 + Math.floor(rng() * max);
  const choices = new Set([count]);
  while (choices.size < 3) {
    choices.add(1 + Math.floor(rng() * 10));
  }
  return { count, emoji: pick(rng, COUNT_EMOJI), choices: shuffle(rng, [...choices]) };
}

export const COLORS = [
  { id: 'red', hex: '#e53935' },
  { id: 'blue', hex: '#1e88e5' },
  { id: 'green', hex: '#43a047' },
  { id: 'yellow', hex: '#fdd835' },
  { id: 'purple', hex: '#8e24aa' },
  { id: 'orange', hex: '#fb8c00' },
];

export const SHAPES = [
  { id: 'circle' }, { id: 'square' }, { id: 'triangle' }, { id: 'star' },
];

export function makeColorShapeRound(rng) {
  const seen = new Set();
  const options = [];
  while (options.length < 4) {
    const color = pick(rng, COLORS).id;
    const shape = pick(rng, SHAPES).id;
    const key = `${color}|${shape}`;
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ color, shape });
  }
  return { target: pick(rng, options), options: shuffle(rng, options) };
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function makeLetterRound(rng, mastered = new Set()) {
  const fresh = ALPHABET.filter(l => !mastered.has(l));
  const pool = fresh.length > 0 ? fresh : ALPHABET;
  const target = pick(rng, pool);
  const options = new Set([target]);
  while (options.size < 4) {
    options.add(pick(rng, ALPHABET));
  }
  return { target, options: shuffle(rng, [...options]) };
}
