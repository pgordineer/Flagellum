let flags = [];
let currentFlag = {};
let mcCorrectIndex = 0;

function showMainMenu() {
  document.getElementById('main-menu').style.display = 'flex';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
}

function showEntryMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'block';
  document.getElementById('game-mc').style.display = 'none';
  pickRandomFlag();
  document.getElementById('guess').focus();
}

function showMCMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'block';
  pickRandomFlagMC();
}

function pickRandomFlag() {
  if (!flags.length) return;
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
  document.getElementById('hint').disabled = false;
  document.getElementById('hint-text').textContent = '';
  // Restore Guess button event
  document.getElementById('submit').onclick = checkGuess;
}

function showHint() {
  document.getElementById('hint').textContent = `Country code: ${currentFlag.code}`;
  document.getElementById('hint').disabled = true;
  document.getElementById('hint').style.display = 'block';
  document.getElementById('hint-text').textContent = '';
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
    document.getElementById('submit').onclick = function() {
      pickRandomFlag();
      document.getElementById('guess').focus();
    };
    document.getElementById('hint').style.display = 'none';
    document.getElementById('hint-text').textContent = '';
  } else {
    document.getElementById('result').textContent = '❌ Try again!';
    document.getElementById('result').style.color = '#c62828';
    document.getElementById('hint').style.display = 'block';
    document.getElementById('hint').textContent = 'Hint';
    document.getElementById('hint').disabled = false;
    document.getElementById('hint-text').textContent = '';
    document.getElementById('submit').onclick = checkGuess;
  }
}

function pickRandomFlagMC() {
  if (!flags.length) return;
  // Pick correct flag
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
  // Pick 3 other random, unique countries
  let options = [currentFlag];
  let used = new Set([currentFlag.country]);
  while (options.length < 4) {
    let f = flags[Math.floor(Math.random() * flags.length)];
    if (!used.has(f.country)) {
      options.push(f);
      used.add(f.country);
    }
  }
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  mcCorrectIndex = options.findIndex(f => f.country === currentFlag.country);
  // Show flag and options
  const isMobile = window.innerWidth < 700;
  document.getElementById('flag-emoji-mc').innerHTML = `<img src="${currentFlag.img}" alt="Flag of ${currentFlag.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;">` + (isMobile ? ` <span style="font-size:2.2rem;">${currentFlag.emoji}</span>` : '');
  const mcOptionsDiv = document.getElementById('mc-options');
  mcOptionsDiv.innerHTML = '';
  options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'mc-option-btn';
    btn.textContent = `${opt.country} (${opt.code})`;
    btn.onclick = () => checkMCAnswer(idx, options);
    mcOptionsDiv.appendChild(btn);
  });
  document.getElementById('result-mc').textContent = '';
  document.getElementById('wiki-link-mc').innerHTML = '';
  document.getElementById('hint-mc').style.display = 'block';
  document.getElementById('hint-mc').textContent = 'Hint';
  document.getElementById('hint-mc').disabled = false;
  document.getElementById('hint-text-mc').textContent = '';
  document.getElementById('next-mc').style.display = 'none';
}

function showHintMC() {
  document.getElementById('hint-mc').textContent = `Country code: ${currentFlag.code}`;
  document.getElementById('hint-mc').disabled = true;
  document.getElementById('hint-mc').style.display = 'block';
  document.getElementById('hint-text-mc').textContent = '';
}

function checkMCAnswer(idx, options) {
  const btns = document.querySelectorAll('.mc-option-btn');
  btns.forEach(b => b.disabled = true);
  if (idx === mcCorrectIndex) {
    document.getElementById('result-mc').textContent = `✅ Correct! ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result-mc').style.color = '#2e7d32';
    document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
  } else {
    document.getElementById('result-mc').textContent = `❌ Wrong! Correct: ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result-mc').style.color = '#c62828';
    document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
  }
  document.getElementById('hint-mc').style.display = 'none';
  document.getElementById('hint-text-mc').textContent = '';
  document.getElementById('next-mc').style.display = 'block';
}

function startGame() {
  fetch('flags.json')
    .then(res => res.json())
    .then(data => {
      flags = data;
      // Main menu event listeners
      document.getElementById('entry-mode-btn').onclick = showEntryMode;
      document.getElementById('mc-mode-btn').onclick = showMCMode;
      document.getElementById('back-to-menu-entry').onclick = showMainMenu;
      document.getElementById('back-to-menu-mc').onclick = showMainMenu;
      // Entry mode events
      document.getElementById('submit').onclick = checkGuess;
      document.getElementById('guess').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          if (document.getElementById('submit').textContent === 'Next Flag') {
            pickRandomFlag();
            document.getElementById('guess').focus();
          } else if (!document.getElementById('guess').disabled) {
            checkGuess();
          }
        }
      });
      document.getElementById('hint').onclick = showHint;
      document.getElementById('skip').onclick = function() {
        pickRandomFlag();
        document.getElementById('guess').focus();
      };
      // MC mode events
      document.getElementById('hint-mc').onclick = showHintMC;
      document.getElementById('skip-mc').onclick = function() {
        pickRandomFlagMC();
      };
      document.getElementById('next-mc').onclick = function() {
        pickRandomFlagMC();
      };
      showMainMenu();
    });
}

window.onload = startGame;
