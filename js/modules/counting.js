import { makeCountingRound, seededRng } from '../engine/rounds.js';
import { sayNumber } from '../audio.js';

const ROUNDS_PER_SESSION = 5;

export default {
  id: 'counting',
  titleKey: 'count_title',
  icon: '🔢',

  start(root, api) {
    const rng = seededRng(Date.now() % 2147483647);
    let stage = api.progress.get('count-stage', 0);
    let roundNo = 0;

    function nextRound() {
      roundNo += 1;
      if (roundNo > ROUNDS_PER_SESSION) {
        stage = Math.min(stage + 1, 3);
        api.progress.set('count-stage', stage);
        api.bigWin();
        roundNo = 1;
      }
      playRound(makeCountingRound(rng, stage));
    }

    function playRound(round) {
      root.innerHTML = '';
      let counted = 0;
      let answered = false;

      const field = document.createElement('div');
      field.className = 'count-field';
      for (let i = 0; i < round.count; i++) {
        const item = document.createElement('button');
        item.className = 'count-item';
        item.textContent = round.emoji;
        item.addEventListener('click', () => {
          if (item.classList.contains('counted')) return;
          item.classList.add('counted');
          counted += 1;
          sayNumber(counted);
          if (counted === round.count) setTimeout(askHowMany, 900);
        });
        field.appendChild(item);
      }
      root.appendChild(field);

      const choicesBar = document.createElement('div');
      choicesBar.className = 'count-choices';
      root.appendChild(choicesBar);

      function askHowMany() {
        api.say('how_many');
        choicesBar.innerHTML = '';
        for (const n of round.choices) {
          const b = document.createElement('button');
          b.className = 'choice-btn';
          b.textContent = n;
          b.addEventListener('click', () => {
            if (answered) return;
            if (n === round.count) {
              answered = true;
              b.classList.add('right');
              api.smallWin();
              setTimeout(nextRound, 1800);
            } else {
              b.classList.add('wrong');
              api.oops();
            }
          });
          choicesBar.appendChild(b);
        }
      }

      api.say('count_intro');
    }

    nextRound();
  },
};
