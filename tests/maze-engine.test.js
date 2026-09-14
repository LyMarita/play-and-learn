import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runPlan, expandPlan } from '../js/engine/maze-engine.js';
import { MAZE_LEVELS } from '../js/engine/maze-levels.js';

// A tiny 3x3 test level: bunny at left, carrot two cells right, tree below start.
const level = {
  cols: 3, rows: 3,
  start: [0, 1], goal: [2, 1],
  obstacles: [[0, 2]],
  slots: 4,
  tiles: ['U', 'D', 'L', 'R'],
};

test('plan reaching the goal wins', () => {
  const r = runPlan(level, ['R', 'R']);
  assert.equal(r.outcome, 'goal');
  assert.deepEqual(r.pos, [2, 1]);
  assert.equal(r.steps.length, 2);
  assert.ok(r.steps.every(s => s.ok));
});

test('plan that ends before the goal is short', () => {
  const r = runPlan(level, ['R']);
  assert.equal(r.outcome, 'short');
  assert.deepEqual(r.pos, [1, 1]);
});

test('empty plan is short', () => {
  assert.equal(runPlan(level, []).outcome, 'short');
});

test('walking off the grid blocks at that step', () => {
  const r = runPlan(level, ['L']);
  assert.equal(r.outcome, 'blocked');
  assert.deepEqual(r.pos, [0, 1]); // bunny stays put on a blocked step
  assert.equal(r.steps[0].ok, false);
});

test('walking into an obstacle blocks at that step', () => {
  const r = runPlan(level, ['D']);
  assert.equal(r.outcome, 'blocked');
  assert.deepEqual(r.pos, [0, 1]);
});

test('reaching the goal mid-plan wins immediately, extra tiles ignored', () => {
  const r = runPlan(level, ['R', 'R', 'U', 'U']);
  assert.equal(r.outcome, 'goal');
  assert.equal(r.steps.length, 2);
});

test('simulation stops at the blocking step', () => {
  const r = runPlan(level, ['L', 'R', 'R']);
  assert.equal(r.outcome, 'blocked');
  assert.equal(r.steps.length, 1);
});

test('X2 repeats the previous move', () => {
  assert.deepEqual(expandPlan(['R', 'X2']), ['R', 'R']);
  const r = runPlan(level, ['R', 'X2']);
  assert.equal(r.outcome, 'goal');
});

test('X2 with no previous move is ignored', () => {
  assert.deepEqual(expandPlan(['X2', 'R']), ['R']);
});

test('chained X2 keeps repeating the same move', () => {
  assert.deepEqual(expandPlan(['U', 'X2', 'X2']), ['U', 'U', 'U']);
});

test('every shipped level is solvable by its stored solution', () => {
  assert.ok(MAZE_LEVELS.length >= 10);
  for (const lv of MAZE_LEVELS) {
    const r = runPlan(lv, lv.solution);
    assert.equal(r.outcome, 'goal', `level ${lv.id} solution must reach the goal`);
    assert.ok(lv.solution.length <= lv.slots,
      `level ${lv.id} solution must fit its ${lv.slots} slots`);
  }
});

test('every shipped level starts off its goal and off its obstacles', () => {
  for (const lv of MAZE_LEVELS) {
    assert.notDeepEqual(lv.start, lv.goal, `level ${lv.id}`);
    for (const o of lv.obstacles) {
      assert.notDeepEqual(o, lv.start, `level ${lv.id} obstacle on start`);
      assert.notDeepEqual(o, lv.goal, `level ${lv.id} obstacle on goal`);
    }
  }
});
