// Pure maze simulation — no DOM. The UI replays `steps` as animation.

const DELTAS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };

// Flatten the plan: 'X2' means "do the previous move again".
// An X2 with no move before it does nothing.
export function expandPlan(plan) {
  const out = [];
  let last = null;
  for (const tile of plan) {
    if (tile === 'X2') {
      if (last) out.push(last);
    } else {
      out.push(tile);
      last = tile;
    }
  }
  return out;
}

// Simulate a plan against a level.
// Returns { outcome: 'goal'|'blocked'|'short', pos, steps }.
// A blocked step keeps the bunny in place and stops the run.
// Reaching the goal wins immediately; leftover tiles are ignored.
export function runPlan(level, plan) {
  const moves = expandPlan(plan);
  const blocked = new Set(level.obstacles.map(([c, r]) => `${c},${r}`));
  let pos = [...level.start];
  const steps = [];
  for (const move of moves) {
    const [dc, dr] = DELTAS[move];
    const to = [pos[0] + dc, pos[1] + dr];
    const inGrid = to[0] >= 0 && to[0] < level.cols && to[1] >= 0 && to[1] < level.rows;
    const ok = inGrid && !blocked.has(`${to[0]},${to[1]}`);
    steps.push({ from: [...pos], to, move, ok });
    if (!ok) return { outcome: 'blocked', pos, steps };
    pos = to;
    if (pos[0] === level.goal[0] && pos[1] === level.goal[1]) {
      return { outcome: 'goal', pos, steps };
    }
  }
  return { outcome: 'short', pos, steps };
}
