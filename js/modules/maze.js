import { runPlan } from '../engine/maze-engine.js';
import { MAZE_LEVELS } from '../engine/maze-levels.js';

const TILE_EMOJI = { U: '⬆️', D: '⬇️', L: '⬅️', R: '➡️', X2: '🔁' };
const STEP_MS = 450;

export default {
  id: 'maze',
  titleKey: 'maze_title',
  icon: '🐰',

  start(root, api) {
    let levelIdx = Math.min(api.progress.get('maze-level', 0), MAZE_LEVELS.length - 1);
    let plan = [];
    let fails = 0;
    let running = false;

    function level() { return MAZE_LEVELS[levelIdx]; }

    function cellKey(c, r) { return `${c},${r}`; }

    function render(bunnyAt = level().start, hop = false) {
      const lv = level();
      const obstacles = new Set(lv.obstacles.map(([c, r]) => cellKey(c, r)));
      root.innerHTML = '';

      const board = document.createElement('div');
      board.className = 'maze-board';
      board.style.gridTemplateColumns = `repeat(${lv.cols}, 1fr)`;
      for (let r = 0; r < lv.rows; r++) {
        for (let c = 0; c < lv.cols; c++) {
          const cell = document.createElement('div');
          cell.className = 'maze-cell';
          const k = cellKey(c, r);
          if (obstacles.has(k)) cell.textContent = '🌳';
          if (k === cellKey(...lv.goal)) cell.textContent = '🥕';
          if (k === cellKey(...bunnyAt)) {
            cell.textContent = '🐰';
            if (hop) cell.classList.add('hop');
          }
          board.appendChild(cell);
        }
      }
      root.appendChild(board);

      const planBar = document.createElement('div');
      planBar.className = 'maze-plan';
      for (let i = 0; i < lv.slots; i++) {
        const slot = document.createElement('button');
        slot.className = 'maze-slot';
        if (plan[i]) {
          slot.textContent = TILE_EMOJI[plan[i]];
          slot.addEventListener('click', () => {
            if (running) return;
            plan.splice(i, 1);
            render();
          });
        }
        planBar.appendChild(slot);
      }
      root.appendChild(planBar);

      const palette = document.createElement('div');
      palette.className = 'maze-palette';
      for (const tile of lv.tiles) {
        const b = document.createElement('button');
        b.className = 'maze-tile';
        b.textContent = TILE_EMOJI[tile];
        b.addEventListener('click', () => {
          if (running || plan.length >= lv.slots) return;
          plan.push(tile);
          render();
        });
        palette.appendChild(b);
      }
      const go = document.createElement('button');
      go.className = 'go-btn';
      go.textContent = '▶';
      go.addEventListener('click', () => run(plan));
      palette.appendChild(go);
      root.appendChild(palette);

      if (fails >= 3) {
        const help = document.createElement('button');
        help.className = 'help-btn';
        help.textContent = '💡';
        help.addEventListener('click', () => {
          api.say('watch_me');
          run([...level().solution], true);
        });
        root.appendChild(help);
      }
    }

    async function run(activePlan, isDemo = false) {
      if (running || activePlan.length === 0) return;
      running = true;
      const result = runPlan(level(), activePlan);
      let pos = level().start;
      for (const step of result.steps) {
        if (!step.ok) {
          render(step.from);
          root.querySelector('.maze-board').classList.add('shake');
          break;
        }
        pos = step.to;
        render(pos, true);
        await sleep(STEP_MS);
      }
      running = false;

      if (result.outcome === 'goal' && !isDemo) {
        fails = 0;
        if (levelIdx === MAZE_LEVELS.length - 1) {
          api.bigWin();
          levelIdx = 0;
        } else {
          api.smallWin();
          levelIdx += 1;
        }
        api.progress.set('maze-level', levelIdx);
        plan = [];
        await sleep(1600);
        render();
        api.say('maze_intro');
      } else if (result.outcome === 'goal' && isDemo) {
        plan = [];
        await sleep(1200);
        render();
      } else {
        if (!isDemo) {
          fails += 1;
          api.chime('sad');
          api.say(result.outcome === 'blocked' ? 'maze_blocked' : 'maze_short');
        }
        await sleep(1200);
        render();
      }
    }

    render();
    api.say('maze_intro');
  },
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
