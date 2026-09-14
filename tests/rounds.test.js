import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seededRng, makeCountingRound, makeColorShapeRound, makeLetterRound,
  COLORS, SHAPES,
} from '../js/engine/rounds.js';

function rngAt(seed) { return seededRng(seed); }

test('seededRng is deterministic and in [0,1)', () => {
  const a = rngAt(42), b = rngAt(42);
  for (let i = 0; i < 100; i++) {
    const va = a(), vb = b();
    assert.equal(va, vb);
    assert.ok(va >= 0 && va < 1);
  }
});

test('counting round: count in 1..10, scaled up by stage', () => {
  for (let i = 0; i < 50; i++) {
    const early = makeCountingRound(rngAt(i), 0);
    assert.ok(early.count >= 1 && early.count <= 3, `stage 0 got ${early.count}`);
    const late = makeCountingRound(rngAt(i), 3);
    assert.ok(late.count >= 1 && late.count <= 10);
  }
});

test('counting round: 3 unique number choices including the answer', () => {
  for (let i = 0; i < 50; i++) {
    const r = makeCountingRound(rngAt(i), 2);
    assert.equal(r.choices.length, 3);
    assert.equal(new Set(r.choices).size, 3);
    assert.ok(r.choices.includes(r.count));
    assert.ok(r.choices.every(n => n >= 1 && n <= 10));
    assert.ok(r.emoji.length > 0);
  }
});

test('color-shape round: 4 unique options, target exactly once', () => {
  for (let i = 0; i < 50; i++) {
    const r = makeColorShapeRound(rngAt(i));
    assert.equal(r.options.length, 4);
    const keys = r.options.map(o => `${o.color}|${o.shape}`);
    assert.equal(new Set(keys).size, 4);
    const hits = r.options.filter(
      o => o.color === r.target.color && o.shape === r.target.shape);
    assert.equal(hits.length, 1);
    assert.ok(COLORS.some(c => c.id === r.target.color));
    assert.ok(SHAPES.some(s => s.id === r.target.shape));
  }
});

test('letter round: 4 unique uppercase options including the target', () => {
  for (let i = 0; i < 50; i++) {
    const r = makeLetterRound(rngAt(i));
    assert.equal(r.options.length, 4);
    assert.equal(new Set(r.options).size, 4);
    assert.ok(r.options.includes(r.target));
    assert.ok(r.options.every(l => /^[A-Z]$/.test(l)));
  }
});

test('letter round avoids letters already mastered when possible', () => {
  const done = new Set('ABCDEFGHIJKLMNOPQRSTUVW'.split(''));
  for (let i = 0; i < 20; i++) {
    const r = makeLetterRound(rngAt(i), done);
    assert.ok(['X', 'Y', 'Z'].includes(r.target), `got ${r.target}`);
  }
});
