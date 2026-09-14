import { makeLetterRound, seededRng } from '../engine/rounds.js';

const ROUNDS_PER_SESSION = 5;

export default {
  id: 'letters',
  titleKey: 'letters_title',
  icon: '🔤',

  start(root, api) {
    const rng = seededRng(Date.now() % 2147483647);
    const mastered = new Set(api.progress.get('letters-mastered', []));
    let roundNo = 0;

    function nextRound() {
      roundNo += 1;
      if (roundNo > ROUNDS_PER_SESSION) {
        api.bigWin();
        roundNo = 1;
      }
      playRound(makeLetterRound(rng, mastered));
    }

    function playRound(round) {
      root.innerHTML = '';
      let answered = false;

      const replay = document.createElement('button');
      replay.className = 'replay-btn';
      replay.textContent = '🔊';
      replay.addEventListener('click', () =>
        api.say('tap_letter', { letter: round.target }, `tap_letter_${round.target}`));
      root.appendChild(replay);

      const grid = document.createElement('div');
      grid.className = 'letter-grid';
      for (const letter of round.options) {
        const card = document.createElement('button');
        card.className = 'letter-card';
        card.textContent = letter;
        card.addEventListener('click', () => {
          if (answered) return;
          if (letter === round.target) {
            answered = true;
            card.classList.add('right');
            mastered.add(letter);
            api.progress.set('letters-mastered', [...mastered]);
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
      api.say('tap_letter', { letter: round.target }, `tap_letter_${round.target}`);
    }

    nextRound();
  },
};
