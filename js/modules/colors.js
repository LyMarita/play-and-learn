import { makeColorShapeRound, seededRng, COLORS } from '../engine/rounds.js';
import { t } from '../i18n.js';

const ROUNDS_PER_SESSION = 5;
const HEX = Object.fromEntries(COLORS.map(c => [c.id, c.hex]));

export default {
  id: 'colors',
  titleKey: 'colors_title',
  icon: '🎨',

  start(root, api) {
    const rng = seededRng(Date.now() % 2147483647);
    let roundNo = 0;

    function nextRound() {
      roundNo += 1;
      if (roundNo > ROUNDS_PER_SESSION) {
        api.bigWin();
        roundNo = 1;
      }
      playRound(makeColorShapeRound(rng));
    }

    function speakPrompt(round) {
      api.say('find_it', {
        color: colorWord(round.target.color),
        shape: shapeWord(round.target.shape),
      }, `find_it_${round.target.color}_${round.target.shape}`);
    }

    function playRound(round) {
      root.innerHTML = '';
      let answered = false;

      const replay = document.createElement('button');
      replay.className = 'replay-btn';
      replay.textContent = '🔊';
      replay.addEventListener('click', () => speakPrompt(round));
      root.appendChild(replay);

      const grid = document.createElement('div');
      grid.className = 'shape-grid';
      for (const opt of round.options) {
        const card = document.createElement('button');
        card.className = 'shape-card';
        const shape = document.createElement('div');
        shape.className = `shape shape-${opt.shape}`;
        shape.style.background = HEX[opt.color];
        card.appendChild(shape);
        card.addEventListener('click', () => {
          if (answered) return;
          const hit = opt.color === round.target.color && opt.shape === round.target.shape;
          if (hit) {
            answered = true;
            card.classList.add('right');
            api.smallWin();
            setTimeout(nextRound, 1800);
          } else {
            card.classList.add('wrong');
            api.oops();
            setTimeout(() => card.classList.remove('wrong'), 700);
          }
        });
        grid.appendChild(card);
      }
      root.appendChild(grid);
      speakPrompt(round);
    }

    nextRound();
  },
};

function colorWord(id) { return t(`color_${id}`); }
function shapeWord(id) { return t(`shape_${id}`); }
