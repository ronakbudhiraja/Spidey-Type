const words =
  'The neon sign flickered rhythmically, casting a rhythmic violet glow over the deserted alleyway where a stray cat sat perched on a stack of damp newspapers. Somewhere in the distance, the muffled hum of the citys late-night traffic harmonized with the soft rhythmic clicking of a loose vent cover. A single, forgotten umbrella leaned against a brick wall, its fabric torn as if it had surrendered to a storm that everyone else had already forgotten. Time seemed to stretch and thin in this narrow corridor, caught between the relentless forward motion of the digital clock and the ancient, quiet stillness of the shadows.'.split(
    ' ',
  );
const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;

// Fucntion to add class
function addClass(el, name) {
  el.className += ' ' + name;
}
// Function to Remove class
function removeClass(el, name) {
  el.className = el.className.replace(name, '');
}

// Function that create Random words
function randomWord() {
  const randomIndex = Math.floor(Math.random() * wordsCount);
  return words[randomIndex];
  // const randomIndex = Math.(Mathceil.random() * wordsCount);
  // return words[randomIndex - 1];
}

// function to format Word
function formatWord(word) {
  return `<div class='word'><span class = 'letter'>${word
    .split('')
    .join('</span><span class = "letter">')}</span></div>`;
}

// Function to start a new game
function newGame() {
  document.getElementById('words').innerHTML = '';
  for (let i = 0; i < 200; i++) {
    document.getElementById('words').innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'), 'current');
  document.getElementById('info').innerHTML = gameTime / 1000 + '';
  window.timer = null;
}

function getWpm() {
  const words = [...document.querySelectorAll('.word')];
  const lastTypedWord = document.querySelector('.word.current');
  const lastTypedWordIndex = words.indexOf(lastTypedWord);

  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter((word) => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter((letter) => letter.classList.contains('incorrect'));

    const correctLetters = letters.filter((letter) => letter.classList.contains('correct'));

    // const incorrectLetters = letters.filter((letter) => {
    //   return  letter.className.includes('incorrect');
    // });
    // const correctLetters = letters.filter((letter) => {
    //    return letter.className.includes('correct');
    // });
    return incorrectLetters.length === 0 && correctLetters.length === letters.length;
  });
  return (correctWords.length / gameTime) * 60000;
}

function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById('game'), 'over');
  const result = getWpm();
  document.getElementById('info').innerHTML = `WPM: ${result}`;
}

// newGame();

document.getElementById('game').addEventListener('keyup', (event) => {
  const key = event.key;
  const currentWord = document.querySelector('.word.current');

  const currentLetter = document.querySelector('.current.letter');
  // const expected = currentLetter.innerHTML;
  const expected = currentLetter?.textContent || ' '; // better than innerHTML
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector('#game.over')) {
    return;
  }

  console.log({ key, expected });
  if (!window.timer && isLetter) {
    window.timer = setInterval(() => {
      if (!window.gameStart) {
        window.gameStart = new Date().getTime();
      }
      const currentTime = new Date().getTime();
      const msPassed = currentTime - window.gameStart;
      const sPassed = Math.round(msPassed / 1000);
      const sLeft = gameTime / 1000 - sPassed;
      if (sLeft < 0) {
        gameOver();
        return;
      }
      document.getElementById('info').innerHTML = sLeft + '';
    }, 1000);
  }
  if (isLetter) {
    if (currentLetter) {
      addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
      removeClass(currentLetter, 'current');
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, 'current');
      }
      // addClass(currentLetter.nextElementSibling, 'current');
    } else {
      const incorrectLetter = document.createElement('span');
      incorrectLetter.textContent = key;
      incorrectLetter.className = 'letter incorrect extra';
      currentWord.appendChild(incorrectLetter);
    }
  }
  if (isSpace) {
    if (expected !== ' ') {
      const lettersToInvalidate = [
        ...document.querySelectorAll('.word.current .letter:not(.correct)'),
      ];
      lettersToInvalidate.forEach((letter) => {
        addClass(letter, 'incorrect');
      });
    }
    removeClass(currentWord, 'current');
    addClass(currentWord.nextElementSibling, 'current');
    if (currentLetter) {
      removeClass(currentLetter, 'current');
    }

    addClass(currentWord.nextSibling.firstChild, 'current');
  }

  if (isBackspace) {
    if (currentLetter && isFirstLetter) {
      //  Make previous word current , last letter current
      removeClass(currentWord, 'current');
      addClass(currentWord.previousSibling, 'current');
      removeClass(currentLetter, 'current');
      addClass(currentWord.previousSibling.lastChild, 'current');
      removeClass(currentWord.previousSibling.lastChild, 'incorrect');
      removeClass(currentWord.previousSibling.lastChild, 'correct');
    }
    if (currentLetter && !isFirstLetter) {
      // Monve back one letter , invalidate letter
      removeClass(currentLetter, 'current');
      addClass(currentLetter.previousSibling, 'current');
      removeClass(currentLetter.previousSibling, 'correct');
      removeClass(currentLetter.previousSibling, 'incorrect');
    }

    if (!currentLetter) {
      const lastLetter = currentWord.lastChild;

      if (lastLetter.classList.contains('extra')) {
        currentWord.removeChild(lastLetter); // 👈 REMOVE extra letter
      } else {
        addClass(lastLetter, 'current');
        removeClass(lastLetter, 'correct');
        removeClass(lastLetter, 'incorrect');
      }
    }
  }

  // Move lines / words
  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById('words');
    const margin = parseInt(words.style.marginTop || '0px');
    // words.style.marginTop = '-35px';
    words.style.marginTop = margin - 35 + 'px';
  }

  // Move cursor
  const nextLetter = document.querySelector('.letter.current');
  const cursor = document.getElementById('cursor');
  const nextWord = document.querySelector('.word.current');
  cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 1 + 'px';
  // console.log(currentLetter.getBoundingClientRect());
  cursor.style.left =
    (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';

  if (nextLetter) {
    console.log(nextLetter.getBoundingClientRect());
    // cursor.style.top = nextLetter.getBoundingClientRect().top + 1 + 'px';
    // cursor.style.left = nextLetter.getBoundingClientRect().left + 'px';
  } else {
    // cursor.style.top = nextWord.getBoundingClientRect().top + 1 + 'px';
    //  cursor.style.left = nextWord.getBoundingClientRect().right + 'px';
  }
});

// Temprory fix for new game button
document.getElementById('buttons').addEventListener('click', () => {
  location.reload;
});

// document.getElementById('buttons').addEventListener('click', () => {
//   gameOver();
//   newGame();
//   document.getElementById('game').focus();
// });
// document.getElementById('buttons').addEventListener('click', () => {
//   newGame();
//   document.getElementById('game').classList.remove('over');
//   document.getElementById('game').focus();
// });

newGame();
