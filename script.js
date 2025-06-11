let flags = [];
let currentFlag = {};
let mcCorrectIndex = 0;

// Entry Mode scoring
let entryScore = 0;
let entryTotal = 0;
let entryHighScore = 0;
let entryHighTotal = 0;
let usedHint = false;

// MC Mode scoring
let mcScore = 0;
let mcTotal = 0;
let mcHighScore = 0;
let mcHighTotal = 0;
let mcAttempts = 0;
let mcTried = [];

function loadHighScores() {
  entryHighScore = parseFloat(localStorage.getItem('flagellum_entry_highscore')) || 0;
  entryHighTotal = parseInt(localStorage.getItem('flagellum_entry_hightotal')) || 0;
  mcHighScore = parseFloat(localStorage.getItem('flagellum_mc_highscore')) || 0;
  mcHighTotal = parseInt(localStorage.getItem('flagellum_mc_hightotal')) || 0;
}

function saveHighScores(showCongrats) {
  let congratsMsg = null;
  // Entry mode
  if (
    (entryScore > entryHighScore || (entryScore === entryHighScore && entryTotal > entryHighTotal)) &&
    entryHighScore > 0
  ) {
    congratsMsg = '🎉 New Entry Mode High Score!';
  }
  if (entryScore > entryHighScore || (entryScore === entryHighScore && entryTotal > entryHighTotal)) {
    localStorage.setItem('flagellum_entry_highscore', entryScore);
    localStorage.setItem('flagellum_entry_hightotal', entryTotal);
    entryHighScore = entryScore;
    entryHighTotal = entryTotal;
  }
  // MC mode
  if (
    (mcScore > mcHighScore || (mcScore === mcHighScore && mcTotal > mcHighTotal)) &&
    mcHighScore > 0
  ) {
    congratsMsg = '🎉 New Multiple Choice High Score!';
  }
  if (mcScore > mcHighScore || (mcScore === mcHighScore && mcTotal > mcHighTotal)) {
    localStorage.setItem('flagellum_mc_highscore', mcScore);
    localStorage.setItem('flagellum_mc_hightotal', mcTotal);
    mcHighScore = mcScore;
    mcHighTotal = mcTotal;
  }
  if (showCongrats && congratsMsg) {
    showMainMenu(congratsMsg);
  } else if (showCongrats) {
    showMainMenu();
  }
}

function updateScoreDisplays() {
  // Entry mode
  document.getElementById('score-entry').innerHTML = `Score: ${formatScore(entryScore)} of ${entryTotal}`;
  document.getElementById('highscore-entry').innerHTML = `High Score: ${formatScore(entryHighScore)} of ${entryHighTotal}`;
  // Show 'New High Score!' if actively above high score
  let nhs = '';
  if (entryScore > entryHighScore || (entryScore === entryHighScore && entryTotal > entryHighTotal && entryHighScore > 0)) {
    nhs = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-entry').innerHTML += nhs;
  // MC mode
  document.getElementById('score-mc').innerHTML = `Score: ${formatScore(mcScore)} of ${mcTotal}`;
  document.getElementById('highscore-mc').innerHTML = `High Score: ${formatScore(mcHighScore)} of ${mcHighTotal}`;
  let nhsMC = '';
  if (mcScore > mcHighScore || (mcScore === mcHighScore && mcTotal > mcHighTotal && mcHighScore > 0)) {
    nhsMC = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-mc').innerHTML += nhsMC;
}

function formatScore(score) {
  // Show as integer if whole, else as fraction (e.g. 1 2/3)
  if (Number.isInteger(score)) return score === 0 ? '0' : score;
  let intPart = Math.floor(score);
  let frac = score - intPart;
  let fracStr = '';
  if (Math.abs(frac - 2/3) < 0.01) fracStr = '<span class="fraction">2/3</span>';
  else if (Math.abs(frac - 1/3) < 0.01) fracStr = '<span class="fraction">1/3</span>';
  else if (Math.abs(frac - 0.5) < 0.01) fracStr = '<span class="fraction">1/2</span>';
  else fracStr = score.toFixed(2);
  if (intPart === 0 && fracStr) return fracStr;
  if (fracStr && intPart > 0) return `${intPart} ${fracStr}`;
  return score.toFixed(2);
}

function updateMainMenuHighscores() {
  const mainHigh = document.getElementById('main-highscores');
  mainHigh.innerHTML =
    `<h2>Personal High Scores</h2>` +
    `<div class="main-highscore-row">Entry Mode: <b>${formatScore(entryHighScore)} of ${entryHighTotal}</b></div>` +
    `<div class="main-highscore-row">Multiple Choice: <b>${formatScore(mcHighScore)} of ${mcHighTotal}</b></div>`;
}

function showMainMenu(congratsMsg) {
  updateMainMenuHighscores();
  document.getElementById('main-menu').style.display = 'flex';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('study-page').style.display = 'none';
  document.getElementById('congrats').style.display = 'none';
}

function showEntryMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'block';
  document.getElementById('game-mc').style.display = 'none';
  usedHint = false;
  updateScoreDisplays();
  pickRandomFlag();
  document.getElementById('guess').focus();
  setupAutocomplete();
  addFlagClickHandlers();
}

function showMCMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'block';
  mcAttempts = 0;
  mcTried = [];
  updateScoreDisplays();
  pickRandomFlagMC();
  addFlagClickHandlers();
}

function showStudyPage() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('study-page').style.display = 'block';
  renderStudyTable('country');
  addFlagClickHandlers();
}

function renderStudyTable(sortKey, sortDir = 'asc') {
  let sorted = [...flags];
  sorted.sort((a, b) => {
    let vA = a[sortKey] ? a[sortKey].toString().toLowerCase() : '';
    let vB = b[sortKey] ? b[sortKey].toString().toLowerCase() : '';
    if (vA < vB) return sortDir === 'asc' ? -1 : 1;
    if (vA > vB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const tbody = document.getElementById('study-tbody');
  tbody.innerHTML = '';
  for (const flag of sorted) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${flag.country}</td>
      <td>${flag.code}</td>
      <td style="font-size:1.5em;">${flag.emoji}</td>
      <td><a href="https://en.wikipedia.org/wiki/${flag.wiki}" target="_blank">Wiki</a></td>
      <td><img src="${flag.img}" alt="Flag of ${flag.country}" /></td>
    `;
    tbody.appendChild(tr);
  }
  // Set up sorting buttons
  const ths = document.querySelectorAll('.sort-btn');
  ths.forEach(btn => {
    btn.onclick = () => {
      let newDir = sortKey === btn.dataset.sort && sortDir === 'asc' ? 'desc' : 'asc';
      renderStudyTable(btn.dataset.sort, newDir);
    };
  });
}

function pickRandomFlag() {
  if (!flags.length) return;
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
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
  document.getElementById('skip').style.display = 'inline-block';
  document.getElementById('hint-text').textContent = '';
  document.getElementById('submit').onclick = checkGuess;
}

function showHint() {
  usedHint = true;
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
    let addScore = usedHint ? 0.5 : 1;
    entryScore += addScore;
    entryTotal++;
    updateScoreDisplays();
    saveHighScores();
    const pointStr = addScore === 1 ? '1 Point!' : (addScore === 0.5 ? '1/2 Point!' : `${addScore} Point!`);
    document.getElementById('result').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result').style.color = '#2e7d32';
    document.getElementById('wiki-link').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    document.getElementById('submit').textContent = 'Next Flag';
    document.getElementById('guess').disabled = true;
    document.getElementById('submit').onclick = function() {
      usedHint = false;
      pickRandomFlag();
      document.getElementById('guess').focus();
    };
    document.getElementById('hint').style.display = 'none';
    document.getElementById('skip').style.display = 'none';
    document.getElementById('hint-text').textContent = '';
  } else {
    document.getElementById('result').textContent = '❌ Try again!';
    document.getElementById('result').style.color = '#c62828';
    document.getElementById('hint').style.display = 'block';
    document.getElementById('hint').textContent = 'Hint';
    document.getElementById('hint').disabled = false;
    document.getElementById('skip').style.display = 'inline-block';
    document.getElementById('hint-text').textContent = '';
    document.getElementById('submit').onclick = checkGuess;
  }
}

function skipEntryFlag() {
  entryTotal++;
  updateScoreDisplays();
  saveHighScores();
  pickRandomFlag();
  document.getElementById('guess').focus();
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
  mcAttempts = 0;
  mcTried = [false, false, false, false];
  // Show flag and options
  const isMobile = window.innerWidth < 700;
  document.getElementById('flag-emoji-mc').innerHTML = `<img src="${currentFlag.img}" alt="Flag of ${currentFlag.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;">` + (isMobile ? ` <span style="font-size:2.2rem;">${currentFlag.emoji}</span>` : '');
  const mcOptionsDiv = document.getElementById('mc-options');
  mcOptionsDiv.innerHTML = '';
  options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'mc-option-btn';
    btn.textContent = `${opt.country} (${opt.code})`;
    btn.disabled = false;
    btn.onclick = () => checkMCAnswer(idx, options, btns);
    mcOptionsDiv.appendChild(btn);
  });
  // Store buttons for disabling
  let btns = Array.from(mcOptionsDiv.children);
  btns.forEach((btn, idx) => {
    btn.onclick = () => checkMCAnswer(idx, options, btns);
  });
  document.getElementById('result-mc').textContent = '';
  document.getElementById('wiki-link-mc').innerHTML = '';
  document.getElementById('hint-text-mc').textContent = '';
  document.getElementById('next-mc').style.display = 'none';
}

function checkMCAnswer(idx, options, btns) {
  if (mcTried[idx]) return;
  mcTried[idx] = true;
  btns[idx].disabled = true;
  mcAttempts++;
  let addScore = 0;
  if (idx === mcCorrectIndex) {
    if (mcAttempts === 1) addScore = 1;
    else if (mcAttempts === 2) addScore = 2/3;
    else if (mcAttempts === 3) addScore = 1/3;
    else addScore = 0;
    mcScore += addScore;
    mcTotal++;
    updateScoreDisplays();
    saveHighScores();
    let pointStr = addScore === 1 ? '1 Point!' : (addScore === 2/3 ? '2/3 Point!' : (addScore === 1/3 ? '1/3 Point!' : '0 Point!'));
    document.getElementById('result-mc').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result-mc').style.color = '#2e7d32';
    document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    btns.forEach(b => b.disabled = true);
    document.getElementById('next-mc').style.display = 'block';
  } else {
    // If this was the last possible attempt, finish the round
    if (mcAttempts >= 4 || mcTried.filter(Boolean).length === 4) {
      mcScore += 0;
      mcTotal++;
      updateScoreDisplays();
      saveHighScores();
      document.getElementById('result-mc').textContent = `❌ Out of tries! Correct: ${currentFlag.country} (${currentFlag.code})`;
      document.getElementById('result-mc').style.color = '#c62828';
      document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
      btns.forEach(b => b.disabled = true);
      document.getElementById('next-mc').style.display = 'block';
    }
  }
}

function nextMCFlag() {
  pickRandomFlagMC();
}

function setupAutocomplete() {
  const guessInput = document.getElementById('guess');
  const listDiv = document.getElementById('autocomplete-list');
  let currentFocus = -1;
  let lastFiltered = [];

  function closeList() {
    listDiv.style.display = 'none';
    listDiv.innerHTML = '';
    currentFocus = -1;
  }

  function filterFlags(val) {
    if (!val) return [];
    // Respect spaces: match substring with exact spacing
    const lowerVal = val.toLowerCase();
    return flags.filter(f =>
      (`${f.country} (${f.code})`).toLowerCase().includes(lowerVal)
    ).slice(0, 15);
  }

  function renderList(filtered) {
    lastFiltered = filtered;
    if (!filtered.length) {
      closeList();
      return;
    }
    listDiv.innerHTML = '';
    filtered.forEach((flag, idx) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `${flag.country} <span style='color:#888;'>(${flag.code})</span>`;
      item.onclick = function() {
        guessInput.value = `${flag.country}`;
        closeList();
        guessInput.focus();
      };
      listDiv.appendChild(item);
    });
    // Position below input
    const rect = guessInput.getBoundingClientRect();
    const parentRect = guessInput.parentElement.getBoundingClientRect();
    listDiv.style.top = (guessInput.offsetTop + guessInput.offsetHeight + 2) + 'px';
    listDiv.style.left = guessInput.offsetLeft + 'px';
    listDiv.style.width = guessInput.offsetWidth + 'px';
    listDiv.style.display = 'block';
  }

  guessInput.addEventListener('input', function() {
    if (!document.getElementById('autocomplete-toggle').checked) {
      closeList();
      return;
    }
    const val = this.value;
    const filtered = filterFlags(val);
    renderList(filtered);
  });

  guessInput.addEventListener('focus', function() {
    if (!document.getElementById('autocomplete-toggle').checked) return;
    const val = this.value;
    const filtered = filterFlags(val);
    renderList(filtered);
  });

  guessInput.addEventListener('keydown', function(e) {
    const items = listDiv.querySelectorAll('.autocomplete-item');
    if (!items.length || listDiv.style.display === 'none') return;
    if (e.key === 'ArrowDown') {
      currentFocus++;
      if (currentFocus >= items.length) currentFocus = 0;
      setActive(items, currentFocus);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      currentFocus--;
      if (currentFocus < 0) currentFocus = items.length - 1;
      setActive(items, currentFocus);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (currentFocus > -1) {
        items[currentFocus].click();
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      closeList();
    }
  });

  function setActive(items, idx) {
    items.forEach(i => i.classList.remove('active'));
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('active');
      items[idx].scrollIntoView({block:'nearest'});
    }
  }

  document.addEventListener('click', function(e) {
    if (e.target !== guessInput && e.target.parentNode !== listDiv) {
      closeList();
    }
  });

  // Hide autocomplete if toggle is off
  document.getElementById('autocomplete-toggle').addEventListener('change', function() {
    if (!this.checked) closeList();
    else {
      // If toggled on and input has value, show list
      if (guessInput.value) {
        const filtered = filterFlags(guessInput.value);
        renderList(filtered);
      }
    }
  });
}

// --- Flag Image Modal ---
function setupFlagImageModal() {
  // Create modal if not present
  if (!document.getElementById('flag-modal')) {
    const modal = document.createElement('div');
    modal.id = 'flag-modal';
    modal.innerHTML = `
      <div id="flag-modal-bg"></div>
      <div id="flag-modal-content">
        <img id="flag-modal-img" src="" alt="Flag" />
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('flag-modal-bg').onclick = closeFlagModal;
    modal.onclick = function(e) { if (e.target === modal) closeFlagModal(); };
  }
}
function showFlagModal(imgUrl, alt) {
  setupFlagImageModal();
  const modal = document.getElementById('flag-modal');
  const img = document.getElementById('flag-modal-img');
  img.src = imgUrl;
  img.alt = alt || 'Flag';
  modal.style.display = 'flex';
}
function closeFlagModal() {
  const modal = document.getElementById('flag-modal');
  if (modal) modal.style.display = 'none';
}
// --- Add click handlers for all modes ---
function addFlagClickHandlers() {
  // Entry mode
  const entryFlag = document.getElementById('flag-emoji');
  if (entryFlag) {
    entryFlag.onclick = function() {
      if (currentFlag && currentFlag.img) {
        showFlagModal(currentFlag.img, `Flag of ${currentFlag.country}`);
      }
    };
  }
  // MC mode
  const mcFlag = document.getElementById('flag-emoji-mc');
  if (mcFlag) {
    mcFlag.onclick = function() {
      if (currentFlag && currentFlag.img) {
        showFlagModal(currentFlag.img, `Flag of ${currentFlag.country}`);
      }
    };
  }
  // Study mode: delegate to table
  const studyTable = document.getElementById('study-tbody');
  if (studyTable) {
    studyTable.onclick = function(e) {
      if (e.target && e.target.tagName === 'IMG') {
        showFlagModal(e.target.src, e.target.alt);
      }
    };
  }
}

function showEntryMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'block';
  document.getElementById('game-mc').style.display = 'none';
  usedHint = false;
  updateScoreDisplays();
  pickRandomFlag();
  document.getElementById('guess').focus();
  setupAutocomplete();
  addFlagClickHandlers();
}

function showMCMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'block';
  mcAttempts = 0;
  mcTried = [];
  updateScoreDisplays();
  pickRandomFlagMC();
  addFlagClickHandlers();
}

function showStudyPage() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('study-page').style.display = 'block';
  renderStudyTable('country');
  addFlagClickHandlers();
}

function renderStudyTable(sortKey, sortDir = 'asc') {
  let sorted = [...flags];
  sorted.sort((a, b) => {
    let vA = a[sortKey] ? a[sortKey].toString().toLowerCase() : '';
    let vB = b[sortKey] ? b[sortKey].toString().toLowerCase() : '';
    if (vA < vB) return sortDir === 'asc' ? -1 : 1;
    if (vA > vB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const tbody = document.getElementById('study-tbody');
  tbody.innerHTML = '';
  for (const flag of sorted) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${flag.country}</td>
      <td>${flag.code}</td>
      <td style="font-size:1.5em;">${flag.emoji}</td>
      <td><a href="https://en.wikipedia.org/wiki/${flag.wiki}" target="_blank">Wiki</a></td>
      <td><img src="${flag.img}" alt="Flag of ${flag.country}" /></td>
    `;
    tbody.appendChild(tr);
  }
  // Set up sorting buttons
  const ths = document.querySelectorAll('.sort-btn');
  ths.forEach(btn => {
    btn.onclick = () => {
      let newDir = sortKey === btn.dataset.sort && sortDir === 'asc' ? 'desc' : 'asc';
      renderStudyTable(btn.dataset.sort, newDir);
    };
  });
}

function pickRandomFlag() {
  if (!flags.length) return;
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
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
  document.getElementById('skip').style.display = 'inline-block';
  document.getElementById('hint-text').textContent = '';
  document.getElementById('submit').onclick = checkGuess;
}

function showHint() {
  usedHint = true;
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
    let addScore = usedHint ? 0.5 : 1;
    entryScore += addScore;
    entryTotal++;
    updateScoreDisplays();
    saveHighScores();
    const pointStr = addScore === 1 ? '1 Point!' : (addScore === 0.5 ? '1/2 Point!' : `${addScore} Point!`);
    document.getElementById('result').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result').style.color = '#2e7d32';
    document.getElementById('wiki-link').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    document.getElementById('submit').textContent = 'Next Flag';
    document.getElementById('guess').disabled = true;
    document.getElementById('submit').onclick = function() {
      usedHint = false;
      pickRandomFlag();
      document.getElementById('guess').focus();
    };
    document.getElementById('hint').style.display = 'none';
    document.getElementById('skip').style.display = 'none';
    document.getElementById('hint-text').textContent = '';
  } else {
    document.getElementById('result').textContent = '❌ Try again!';
    document.getElementById('result').style.color = '#c62828';
    document.getElementById('hint').style.display = 'block';
    document.getElementById('hint').textContent = 'Hint';
    document.getElementById('hint').disabled = false;
    document.getElementById('skip').style.display = 'inline-block';
    document.getElementById('hint-text').textContent = '';
    document.getElementById('submit').onclick = checkGuess;
  }
}

function skipEntryFlag() {
  entryTotal++;
  updateScoreDisplays();
  saveHighScores();
  pickRandomFlag();
  document.getElementById('guess').focus();
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
  mcAttempts = 0;
  mcTried = [false, false, false, false];
  // Show flag and options
  const isMobile = window.innerWidth < 700;
  document.getElementById('flag-emoji-mc').innerHTML = `<img src="${currentFlag.img}" alt="Flag of ${currentFlag.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;">` + (isMobile ? ` <span style="font-size:2.2rem;">${currentFlag.emoji}</span>` : '');
  const mcOptionsDiv = document.getElementById('mc-options');
  mcOptionsDiv.innerHTML = '';
  options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'mc-option-btn';
    btn.textContent = `${opt.country} (${opt.code})`;
    btn.disabled = false;
    btn.onclick = () => checkMCAnswer(idx, options, btns);
    mcOptionsDiv.appendChild(btn);
  });
  // Store buttons for disabling
  let btns = Array.from(mcOptionsDiv.children);
  btns.forEach((btn, idx) => {
    btn.onclick = () => checkMCAnswer(idx, options, btns);
  });
  document.getElementById('result-mc').textContent = '';
  document.getElementById('wiki-link-mc').innerHTML = '';
  document.getElementById('hint-text-mc').textContent = '';
  document.getElementById('next-mc').style.display = 'none';
}

function checkMCAnswer(idx, options, btns) {
  if (mcTried[idx]) return;
  mcTried[idx] = true;
  btns[idx].disabled = true;
  mcAttempts++;
  let addScore = 0;
  if (idx === mcCorrectIndex) {
    if (mcAttempts === 1) addScore = 1;
    else if (mcAttempts === 2) addScore = 2/3;
    else if (mcAttempts === 3) addScore = 1/3;
    else addScore = 0;
    mcScore += addScore;
    mcTotal++;
    updateScoreDisplays();
    saveHighScores();
    let pointStr = addScore === 1 ? '1 Point!' : (addScore === 2/3 ? '2/3 Point!' : (addScore === 1/3 ? '1/3 Point!' : '0 Point!'));
    document.getElementById('result-mc').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result-mc').style.color = '#2e7d32';
    document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    btns.forEach(b => b.disabled = true);
    document.getElementById('next-mc').style.display = 'block';
  } else {
    // If this was the last possible attempt, finish the round
    if (mcAttempts >= 4 || mcTried.filter(Boolean).length === 4) {
      mcScore += 0;
      mcTotal++;
      updateScoreDisplays();
      saveHighScores();
      document.getElementById('result-mc').textContent = `❌ Out of tries! Correct: ${currentFlag.country} (${currentFlag.code})`;
      document.getElementById('result-mc').style.color = '#c62828';
      document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
      btns.forEach(b => b.disabled = true);
      document.getElementById('next-mc').style.display = 'block';
    }
  }
}

function nextMCFlag() {
  pickRandomFlagMC();
}

function setupAutocomplete() {
  const guessInput = document.getElementById('guess');
  const listDiv = document.getElementById('autocomplete-list');
  let currentFocus = -1;
  let lastFiltered = [];

  function closeList() {
    listDiv.style.display = 'none';
    listDiv.innerHTML = '';
    currentFocus = -1;
  }

  function filterFlags(val) {
    if (!val) return [];
    // Respect spaces: match substring with exact spacing
    const lowerVal = val.toLowerCase();
    return flags.filter(f =>
      (`${f.country} (${f.code})`).toLowerCase().includes(lowerVal)
    ).slice(0, 15);
  }

  function renderList(filtered) {
    lastFiltered = filtered;
    if (!filtered.length) {
      closeList();
      return;
    }
    listDiv.innerHTML = '';
    filtered.forEach((flag, idx) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `${flag.country} <span style='color:#888;'>(${flag.code})</span>`;
      item.onclick = function() {
        guessInput.value = `${flag.country}`;
        closeList();
        guessInput.focus();
      };
      listDiv.appendChild(item);
    });
    // Position below input
    const rect = guessInput.getBoundingClientRect();
    const parentRect = guessInput.parentElement.getBoundingClientRect();
    listDiv.style.top = (guessInput.offsetTop + guessInput.offsetHeight + 2) + 'px';
    listDiv.style.left = guessInput.offsetLeft + 'px';
    listDiv.style.width = guessInput.offsetWidth + 'px';
    listDiv.style.display = 'block';
  }

  guessInput.addEventListener('input', function() {
    if (!document.getElementById('autocomplete-toggle').checked) {
      closeList();
      return;
    }
    const val = this.value;
    const filtered = filterFlags(val);
    renderList(filtered);
  });

  guessInput.addEventListener('focus', function() {
    if (!document.getElementById('autocomplete-toggle').checked) return;
    const val = this.value;
    const filtered = filterFlags(val);
    renderList(filtered);
  });

  guessInput.addEventListener('keydown', function(e) {
    const items = listDiv.querySelectorAll('.autocomplete-item');
    if (!items.length || listDiv.style.display === 'none') return;
    if (e.key === 'ArrowDown') {
      currentFocus++;
      if (currentFocus >= items.length) currentFocus = 0;
      setActive(items, currentFocus);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      currentFocus--;
      if (currentFocus < 0) currentFocus = items.length - 1;
      setActive(items, currentFocus);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (currentFocus > -1) {
        items[currentFocus].click();
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      closeList();
    }
  });

  function setActive(items, idx) {
    items.forEach(i => i.classList.remove('active'));
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('active');
      items[idx].scrollIntoView({block:'nearest'});
    }
  }

  document.addEventListener('click', function(e) {
    if (e.target !== guessInput && e.target.parentNode !== listDiv) {
      closeList();
    }
  });

  // Hide autocomplete if toggle is off
  document.getElementById('autocomplete-toggle').addEventListener('change', function() {
    if (!this.checked) closeList();
    else {
      // If toggled on and input has value, show list
      if (guessInput.value) {
        const filtered = filterFlags(guessInput.value);
        renderList(filtered);
      }
    }
  });
}

// --- Flag Image Modal ---
function setupFlagImageModal() {
  // Create modal if not present
  if (!document.getElementById('flag-modal')) {
    const modal = document.createElement('div');
    modal.id = 'flag-modal';
    modal.innerHTML = `
      <div id="flag-modal-bg"></div>
      <div id="flag-modal-content">
        <img id="flag-modal-img" src="" alt="Flag" />
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('flag-modal-bg').onclick = closeFlagModal;
    modal.onclick = function(e) { if (e.target === modal) closeFlagModal(); };
  }
}
function showFlagModal(imgUrl, alt) {
  setupFlagImageModal();
  const modal = document.getElementById('flag-modal');
  const img = document.getElementById('flag-modal-img');
  img.src = imgUrl;
  img.alt = alt || 'Flag';
  modal.style.display = 'flex';
}
function closeFlagModal() {
  const modal = document.getElementById('flag-modal');
  if (modal) modal.style.display = 'none';
}
// --- Add click handlers for all modes ---
function addFlagClickHandlers() {
  // Entry mode
  const entryFlag = document.getElementById('flag-emoji');
  if (entryFlag) {
    entryFlag.onclick = function() {
      if (currentFlag && currentFlag.img) {
        showFlagModal(currentFlag.img, `Flag of ${currentFlag.country}`);
      }
    };
  }
  // MC mode
  const mcFlag = document.getElementById('flag-emoji-mc');
  if (mcFlag) {
    mcFlag.onclick = function() {
      if (currentFlag && currentFlag.img) {
        showFlagModal(currentFlag.img, `Flag of ${currentFlag.country}`);
      }
    };
  }
  // Study mode: delegate to table
  const studyTable = document.getElementById('study-tbody');
  if (studyTable) {
    studyTable.onclick = function(e) {
      if (e.target && e.target.tagName === 'IMG') {
        showFlagModal(e.target.src, e.target.alt);
      }
    };
  }
}

function startGame() {
  loadHighScores();
  fetch('flags.json')
    .then(res => res.json())
    .then(data => {
      flags = data;
      // Main menu event listeners
      document.getElementById('entry-mode-btn').addEventListener('click', showEntryMode);
      document.getElementById('mc-mode-btn').addEventListener('click', showMCMode);
      document.getElementById('study-btn').addEventListener('click', showStudyPage);
      document.getElementById('back-to-menu-study').onclick = showMainMenu;
      document.getElementById('back-to-menu-study-top').onclick = showMainMenu;
      // Entry mode events
      document.getElementById('submit').onclick = checkGuess;
      document.getElementById('guess').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          if (document.getElementById('submit').textContent === 'Next Flag') {
            usedHint = false;
            pickRandomFlag();
            document.getElementById('guess').focus();
          } else if (!document.getElementById('guess').disabled) {
            checkGuess();
          }
        }
      });
      document.getElementById('hint').onclick = showHint;
      document.getElementById('skip').onclick = skipEntryFlag;
      // MC mode events
      document.getElementById('next-mc').onclick = nextMCFlag;
      // Study mode events
      document.getElementById('back-to-menu-study-top').onclick = showMainMenu;
      // Autocomplete toggle
      const autocompleteToggle = document.getElementById('autocomplete-toggle');
      if (autocompleteToggle) {
        autocompleteToggle.addEventListener('change', function() {
          document.getElementById('guess').setAttribute('autocomplete', this.checked ? 'on' : 'off');
        });
      }
      // End game: reset all game state for entry mode
      document.getElementById('back-to-menu-entry').onclick = function() {
        usedHint = false;
        pickRandomFlag();
        entryScore = 0;
        entryTotal = 0;
        updateScoreDisplays();
        saveHighScores();
        showMainMenu();
      };
      // End game: reset all game state for MC mode
      document.getElementById('back-to-menu-mc').onclick = function() {
        mcScore = 0;
        mcTotal = 0;
        mcAttempts = 0;
        mcTried = [];
        updateScoreDisplays();
        saveHighScores();
        showMainMenu();
      };
      showMainMenu();
      updateScoreDisplays();
      updateMainMenuHighscores();
    });
}

window.onload = function() {
  startGame();
  setupFlagImageModal();
  addFlagClickHandlers();
};
