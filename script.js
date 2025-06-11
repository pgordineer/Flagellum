let currentFlag = {};

function pickRandomFlag() {
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
  // Show flag image and emoji (emoji only on mobile)
  const isMobile = window.innerWidth < 700;
  document.getElementById('flag-emoji').innerHTML = `<img src="${currentFlag.img}" alt="Flag of ${currentFlag.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;">` + (isMobile ? ` <span style="font-size:2.2rem;">${currentFlag.emoji}</span>` : '');
  document.getElementById('guess').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('wiki-link').innerHTML = '';
  document.getElementById('submit').textContent = 'Guess';
  document.getElementById('submit').disabled = false;
  document.getElementById('guess').disabled = false;
  document.getElementById('hint').style.display = 'block';
  document.getElementById('hint').textContent = 'Hint';
  document.getElementById('hint-text').textContent = '';
  // Restore Guess button event
  document.getElementById('submit').onclick = checkGuess;
}

function checkGuess() {
  const guess = document.getElementById('guess').value.trim().toLowerCase();
  const answer = currentFlag.country.toLowerCase();
  const code = currentFlag.code.toLowerCase();
  if (guess === answer || guess === code) {
    document.getElementById('result').textContent = `✅ Correct! ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result').style.color = '#2e7d32';
    document.getElementById('wiki-link').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    document.getElementById('submit').textContent = 'Next Flag';
    document.getElementById('guess').disabled = true;
    document.getElementById('submit').onclick = pickRandomFlag;
    document.getElementById('hint').style.display = 'none';
    document.getElementById('hint-text').textContent = '';
  } else {
    document.getElementById('result').textContent = '❌ Try again!';
    document.getElementById('result').style.color = '#c62828';
    document.getElementById('hint').style.display = 'block';
    document.getElementById('hint').textContent = 'Hint';
    document.getElementById('hint-text').textContent = '';
    document.getElementById('submit').onclick = checkGuess;
  }
}

function showHint() {
  document.getElementById('hint').textContent = `Country code: ${currentFlag.code}`;
  document.getElementById('hint').disabled = true;
  document.getElementById('hint').style.display = 'block';
  document.getElementById('hint-text').textContent = '';
}

function skipFlag() {
  pickRandomFlag();
}

// List of countries and their flag emojis is now in flags.js

// Wait for flags.js to load before running the game logic
function startGame() {
  pickRandomFlag();
  document.getElementById('submit').onclick = checkGuess;
  document.getElementById('guess').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      if (document.getElementById('submit').textContent === 'Next Flag') {
        pickRandomFlag();
      } else if (!document.getElementById('guess').disabled) {
        checkGuess();
      }
    }
  });
  document.getElementById('hint').onclick = showHint;
  document.getElementById('skip').onclick = skipFlag;
}

if (typeof flags !== 'undefined') {
  startGame();
} else {
  window.addEventListener('DOMContentLoaded', function() {
    if (typeof flags !== 'undefined') {
      startGame();
    } else {
      // Wait for flags.js to load
      const script = document.querySelector('script[src="flags.js"]');
      if (script) {
        script.addEventListener('load', startGame);
      }
    }
  });
}
