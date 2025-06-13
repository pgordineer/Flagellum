let flags = [];
let currentFlag = {};
let mcCorrectIndex = 0;

// Entry Mode scoring
let entryScore = 0;
let entryTotal = 0;
let entryHighScore = 0;
let entryHighTotal = 0;
let entryStreak = 0;
let entryLongestStreak = 0;
let usedHint = false;

// MC Mode scoring
let mcScore = 0;
let mcTotal = 0;
let mcHighScore = 0;
let mcHighTotal = 0;
let mcStreak = 0;
let mcLongestStreak = 0;
let mcAttempts = 0;
let mcTried = [];

// Reverse Choice Mode scoring
let rcScore = 0;
let rcTotal = 0;
let rcHighScore = 0;
let rcHighTotal = 0;
let rcStreak = 0;
let rcLongestStreak = 0;
let rcAttempts = 0;
let rcTried = [];
let rcCorrectIndex = 0;
let rcOptions = [];
let rcCurrentFlag = {};

// --- Saviour Mode ---
let saviourScore = 0;
let saviourTotal = 0;
let saviourHighScore = 0;
let saviourHighTotal = 0;
let saviourStreak = 0;
let saviourLongestStreak = 0;
let saviourGrid = [];
let saviourHighlightIndex = 12; // Center of 5x5 grid
let saviourActive = [];
const SAVIOUR_GRID_SIZE = 5;
const SAVIOUR_ACTIONS = [
  { name: 'Freeze Ray', icon: '❄️' },
  { name: 'Shrink Ray', icon: '🔬' },
  { name: 'Heat Ray', icon: '🔥' },
  { name: 'Gamma Burst', icon: '☢️' },
  { name: 'Tailor', icon: '✂️' },
  { name: 'Penny Pincher', icon: '🪙' },
  { name: 'Money Bags', icon: '💰' },
  { name: 'Baby Boomer', icon: '👶' },
  { name: 'Tidal Force', icon: '🌊' },
  { name: 'Landlocked', icon: '🏜️' }
];

// --- Saviour Mode Undo/Redo State ---
let saviourActionHistory = [];
let saviourActionPointer = -1;
let saviourUsedActions = [];
let saviourGameOver = false;

// --- Saviour Mode Undo/Redo Implementation ---
function saveSaviourActionState(actionName) {
  // If we are not at the end, slice off redo history
  if (saviourActionPointer < saviourActionHistory.length - 1) {
    saviourActionHistory = saviourActionHistory.slice(0, saviourActionPointer + 1);
  }
  saviourActionHistory.push({
    saviourActive: JSON.parse(JSON.stringify(saviourActive)),
    saviourUsedActions: JSON.parse(JSON.stringify(saviourUsedActions)),
    saviourScore,
    saviourGameOver,
    actionName,
    grid: JSON.parse(JSON.stringify(saviourGrid)),
    highlight: saviourHighlightIndex,
    streak: saviourStreak,
    total: saviourTotal,
    longestStreak: saviourLongestStreak
  });
  saviourActionPointer = saviourActionHistory.length - 1;
  renderSaviourUndoRedo();
}

function undoSaviourAction() {
  if (saviourActionPointer <= 0) return;
  saviourActionPointer--;
  restoreSaviourActionState(saviourActionHistory[saviourActionPointer]);
}

function redoSaviourAction() {
  if (saviourActionPointer >= saviourActionHistory.length - 1) return;
  saviourActionPointer++;
  restoreSaviourActionState(saviourActionHistory[saviourActionPointer]);
}

function restoreSaviourActionState(state) {
  saviourActive = JSON.parse(JSON.stringify(state.saviourActive));
  saviourUsedActions = JSON.parse(JSON.stringify(state.saviourUsedActions));
  saviourScore = state.saviourScore;
  saviourGameOver = state.saviourGameOver;
  saviourGrid = JSON.parse(JSON.stringify(state.grid));
  saviourHighlightIndex = state.highlight;
  saviourStreak = state.streak;
  saviourTotal = state.total;
  saviourLongestStreak = state.longestStreak;
  renderSaviourGrid(saviourGameOver);
  updateSaviourScoreDisplays();
  renderSaviourActions();
  renderSaviourUndoRedo();
  if (saviourGameOver) showSaviourGameOver();
  else document.getElementById('result-saviour').innerHTML = '';
}

function renderSaviourUndoRedo() {
  const gridDiv = document.getElementById('saviour-grid');
  let undoRedoDiv = document.getElementById('saviour-undo-redo');
  if (!undoRedoDiv) {
    undoRedoDiv = document.createElement('div');
    undoRedoDiv.id = 'saviour-undo-redo';
    undoRedoDiv.style.display = 'flex';
    undoRedoDiv.style.justifyContent = 'center';
    undoRedoDiv.style.gap = '0.7em';
    undoRedoDiv.style.marginBottom = '0.7em';
    gridDiv.parentNode.insertBefore(undoRedoDiv, gridDiv);
  }
  undoRedoDiv.innerHTML = '';
  const undoBtn = document.createElement('button');
  undoBtn.className = 'main-btn saviour-btn';
  undoBtn.textContent = 'Undo';
  undoBtn.disabled = saviourActionPointer <= 0;
  undoBtn.onclick = undoSaviourAction;
  const redoBtn = document.createElement('button');
  redoBtn.className = 'main-btn saviour-btn';
  redoBtn.textContent = 'Redo';
  redoBtn.disabled = saviourActionPointer >= saviourActionHistory.length - 1;
  redoBtn.onclick = redoSaviourAction;
  undoRedoDiv.appendChild(undoBtn);
  undoRedoDiv.appendChild(redoBtn);
}

function loadHighScores() {
  entryHighScore = parseFloat(localStorage.getItem('flagellum_entry_highscore')) || 0;
  entryHighTotal = parseInt(localStorage.getItem('flagellum_entry_hightotal')) || 0;
  entryLongestStreak = parseInt(localStorage.getItem('flagellum_entry_longeststreak')) || 0;
  mcHighScore = parseFloat(localStorage.getItem('flagellum_mc_highscore')) || 0;
  mcHighTotal = parseInt(localStorage.getItem('flagellum_mc_hightotal')) || 0;
  mcLongestStreak = parseInt(localStorage.getItem('flagellum_mc_longeststreak')) || 0;
  rcHighScore = parseFloat(localStorage.getItem('flagellum_rc_highscore')) || 0;
  rcHighTotal = parseInt(localStorage.getItem('flagellum_rc_hightotal')) || 0;
  rcLongestStreak = parseInt(localStorage.getItem('flagellum_rc_longeststreak')) || 0;
}

function saveHighScores() {
  // Entry mode
  if (
    entryScore > entryHighScore ||
    (entryScore === entryHighScore && entryTotal < entryHighTotal)
  ) {
    // Only update if this is a better score (higher score, or same score but fewer total)
    localStorage.setItem('flagellum_entry_highscore', entryScore);
    localStorage.setItem('flagellum_entry_hightotal', entryTotal);
    entryHighScore = entryScore;
    entryHighTotal = entryTotal;
  }
  if (entryStreak > entryLongestStreak) {
    entryLongestStreak = entryStreak;
    localStorage.setItem('flagellum_entry_longeststreak', entryLongestStreak);
  }
  // MC mode
  if (
    mcScore > mcHighScore ||
    (mcScore === mcHighScore && mcTotal < mcHighTotal)
  ) {
    localStorage.setItem('flagellum_mc_highscore', mcScore);
    localStorage.setItem('flagellum_mc_hightotal', mcTotal);
    mcHighScore = mcScore;
    mcHighTotal = mcTotal;
  }
  if (mcStreak > mcLongestStreak) {
    mcLongestStreak = mcStreak;
    localStorage.setItem('flagellum_mc_longeststreak', mcLongestStreak);
  }
  // Reverse Choice mode
  if (
    rcScore > rcHighScore ||
    (rcScore === rcHighScore && rcTotal < rcHighTotal)
  ) {
    localStorage.setItem('flagellum_rc_highscore', rcScore);
    localStorage.setItem('flagellum_rc_hightotal', rcTotal);
    rcHighScore = rcScore;
    rcHighTotal = rcTotal;
  }
  if (rcStreak > rcLongestStreak) {
    rcLongestStreak = rcStreak;
    localStorage.setItem('flagellum_rc_longeststreak', rcLongestStreak);
  }
  // Saviour mode
  if (
    saviourScore > saviourHighScore ||
    (saviourScore === saviourHighScore && saviourTotal < saviourHighTotal)
  ) {
    localStorage.setItem('flagellum_saviour_highscore', saviourScore);
    localStorage.setItem('flagellum_saviour_hightotal', saviourTotal);
    saviourHighScore = saviourScore;
    saviourHighTotal = saviourTotal;
  }
  if (saviourStreak > saviourLongestStreak) {
    saviourLongestStreak = saviourStreak;
    localStorage.setItem('flagellum_saviour_longeststreak', saviourLongestStreak);
  }
}

function updateScoreDisplays() {
  // Entry mode
  document.getElementById('score-entry').innerHTML = `Score: ${formatScore(entryScore)} of ${entryTotal}<br>Streak: ${entryStreak} <span class="score-streak">(Longest: ${entryLongestStreak})</span>`;
  let entryHS = `High Score: ${formatScore(entryHighScore)} of ${entryHighTotal}`;
  let nhs = '';
  if (
    entryScore > entryHighScore ||
    (entryScore === entryHighScore && entryTotal < entryHighTotal && entryHighScore > 0)
  ) {
    nhs = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-entry').innerHTML = entryHS + nhs;
  // MC mode
  document.getElementById('score-mc').innerHTML = `Score: ${formatScore(mcScore)} of ${mcTotal}<br>Streak: ${mcStreak} <span class="score-streak">(Longest: ${mcLongestStreak})</span>`;
  let mcHS = `High Score: ${formatScore(mcHighScore)} of ${mcHighTotal}`;
  let nhsMC = '';
  if (
    mcScore > mcHighScore ||
    (mcScore === mcHighScore && mcTotal < mcHighTotal && mcHighScore > 0)
  ) {
    nhsMC = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-mc').innerHTML = mcHS + nhsMC;
  // Reverse Choice mode
  document.getElementById('score-rc').innerHTML = `Score: ${formatScore(rcScore)} of ${rcTotal}<br>Streak: ${rcStreak} <span class="score-streak">(Longest: ${rcLongestStreak})</span>`;
  let rcHS = `High Score: ${formatScore(rcHighScore)} of ${rcHighTotal}`;
  let nhsRC = '';
  if (
    rcScore > rcHighScore ||
    (rcScore === rcHighScore && rcTotal < rcHighTotal && rcHighScore > 0)
  ) {
    nhsRC = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-rc').innerHTML = rcHS + nhsRC;
  // Saviour mode
  document.getElementById('score-saviour').innerHTML = `Actions: ${saviourScore} of ${saviourTotal}<br>Streak: ${saviourStreak} <span class="score-streak">(Longest: ${saviourLongestStreak})</span>`;
  let savHS = `High Score: ${saviourHighScore} of ${saviourHighTotal}`;
  let nhsSaviour = '';
  if (
    saviourScore > saviourHighScore ||
    (saviourScore === saviourHighScore && saviourTotal < saviourHighTotal && saviourHighScore > 0)
  ) {
    nhsSaviour = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-saviour').innerHTML = savHS + nhsSaviour;
}

function formatScore(score) {
  // Show as integer if whole, else as fraction (e.g. 1 2/3)
  if (Number.isInteger(score)) return score === 0 ? '0' : score;
  let intPart = Math.floor(score);
  let frac = score - intPart;
  let fracStr = '';
  // Use normal font size for fractions
  if (Math.abs(frac - 2/3) < 0.01) fracStr = '2/3';
  else if (Math.abs(frac - 1/3) < 0.01) fracStr = '1/3';
  else if (Math.abs(frac - 0.5) < 0.01) fracStr = '1/2';
  else fracStr = score.toFixed(2);
  if (intPart === 0 && fracStr) return fracStr;
  if (fracStr && intPart > 0) return `${intPart} ${fracStr}`;
  return score.toFixed(2);
}

function updateMainMenuHighscores() {
  const mainHigh = document.getElementById('main-highscores');
  mainHigh.innerHTML =
    `<h2>Personal High Scores</h2>` +
    `<div class="main-highscore-row">Entry Mode: <b>${formatScore(entryHighScore)} of ${entryHighTotal}</b> <span class="score-streak">Longest Streak: ${entryLongestStreak}</span></div>` +
    `<div class="main-highscore-row">Multiple Choice: <b>${formatScore(mcHighScore)} of ${mcHighTotal}</b> <span class="score-streak">Longest Streak: ${mcLongestStreak}</span></div>` +
    `<div class="main-highscore-row">Reverse Choice: <b>${formatScore(rcHighScore)} of ${rcHighTotal}</b> <span class="score-streak">Longest Streak: ${rcLongestStreak}</span></div>` +
    `<div class="main-highscore-row">Saviour Mode: <b>${formatScore(saviourHighScore)} of ${saviourHighTotal}</b> <span class="score-streak">Longest Streak: ${saviourLongestStreak}</span></div>`;
}

function showMainMenu() {
  updateMainMenuHighscores();
  document.getElementById('main-menu').style.display = 'flex';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'none';
  document.getElementById('study-page').style.display = 'none';
  document.getElementById('congrats').style.display = 'none';
  document.getElementById('game-saviour').style.display = 'none'; // Hide Saviour mode when returning to menu
}

function showEntryMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'block';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'none';
  usedHint = false;
  entryStreak = 0;
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
  document.getElementById('game-rc').style.display = 'none';
  mcAttempts = 0;
  mcTried = [];
  mcStreak = 0;
  updateScoreDisplays();
  pickRandomFlagMC();
  addFlagClickHandlers();
}

function showRCMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'block';
  rcAttempts = 0;
  rcTried = [];
  rcStreak = 0;
  updateScoreDisplays();
  pickRandomFlagRC();
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
  // Determine if the column is numeric
  const numericCols = ['gdp', 'area', 'coastline_km', 'min_lat', 'max_lat', 'min_lng', 'max_lng'];
  sorted.sort((a, b) => {
    let vA = a[sortKey];
    let vB = b[sortKey];
    if (numericCols.includes(sortKey)) {
      vA = vA !== undefined && vA !== null ? Number(vA) : -Infinity;
      vB = vB !== undefined && vB !== null ? Number(vB) : -Infinity;
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    } else if (sortKey === 'nuclear_arms') {
      // Sort 'Yes' before 'No' in ascending
      vA = a.nuclear_arms ? 1 : 0;
      vB = b.nuclear_arms ? 1 : 0;
      if (vA < vB) return sortDir === 'asc' ? 1 : -1;
      if (vA > vB) return sortDir === 'asc' ? -1 : 1;
      return 0;
    } else {
      vA = vA ? vA.toString().toLowerCase() : '';
      vB = vB ? vB.toString().toLowerCase() : '';
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    }
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
      <td>${flag.gdp ? (flag.gdp/1e6).toLocaleString(undefined, {maximumFractionDigits:0}) : ''}</td>
      <td>${flag.area ? flag.area.toLocaleString() : ''}</td>
      <td>${flag.coastline_km !== undefined ? flag.coastline_km.toLocaleString() : ''}</td>
      <td>${flag.nuclear_arms ? 'Yes' : 'No'}</td>
      <td>${flag.min_lat !== undefined ? flag.min_lat : ''}</td>
      <td>${flag.max_lat !== undefined ? flag.max_lat : ''}</td>
      <td>${flag.min_lng !== undefined ? flag.min_lng : ''}</td>
      <td>${flag.max_lng !== undefined ? flag.max_lng : ''}</td>
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
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
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
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
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
    // Streak logic
    if (!usedHint && addScore === 1) {
      entryStreak++;
      if (entryStreak > entryLongestStreak) entryLongestStreak = entryStreak;
    } else {
      entryStreak = 0;
    }
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
    entryStreak = 0;
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
  entryStreak = 0;
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
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
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
    // Streak logic
    if (mcAttempts === 1 && addScore === 1) {
      mcStreak++;
      if (mcStreak > mcLongestStreak) mcLongestStreak = mcStreak;
    } else {
      mcStreak = 0;
    }
    updateScoreDisplays();
    saveHighScores();
    let pointStr = addScore === 1 ? '1 Point!' : (addScore === 2/3 ? '2/3 Point!' : (addScore === 1/3 ? '1/3 Point!' : '0 Point!'));
    document.getElementById('result-mc').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result-mc').style.color = '#2e7d32';
    document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    btns.forEach(b => b.disabled = true);
    document.getElementById('next-mc').style.display = 'block';
  } else {
    mcStreak = 0;
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

function pickRandomFlagRC() {
  if (!flags.length) return;
  rcCurrentFlag = flags[Math.floor(Math.random() * flags.length)];
  // Pick 3 other random, unique countries
  rcOptions = [rcCurrentFlag];
  let used = new Set([rcCurrentFlag.country]);
  while (rcOptions.length < 4) {
    let f = flags[Math.floor(Math.random() * flags.length)];
    if (!used.has(f.country)) {
      rcOptions.push(f);
      used.add(f.country);
    }
  }
  // Shuffle options
  for (let i = rcOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rcOptions[i], rcOptions[j]] = [rcOptions[j], rcOptions[i]];
  }
  rcCorrectIndex = rcOptions.findIndex(f => f.country === rcCurrentFlag.country);
  rcAttempts = 0;
  rcTried = [false, false, false, false];
  // Show country and code
  document.getElementById('rc-country').innerHTML = `${rcCurrentFlag.country} <span style="color:#888;">(${rcCurrentFlag.code})</span>`;
  // Show flag image options in a 2x2 grid with zoom button
  const rcOptionsDiv = document.getElementById('rc-options');
  rcOptionsDiv.innerHTML = '';
  rcOptions.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'rc-option-btn';
    btn.disabled = false;
    btn.tabIndex = 0;
    btn.innerHTML = `
      <img src="${opt.img}" alt="Flag of ${opt.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;" />
      <span class="rc-zoom-btn" title="Enlarge flag" tabindex="-1">+</span>
    `;
    btn.onclick = (e) => {
      // Only trigger answer if not clicking zoom
      if (e.target.classList.contains('rc-zoom-btn')) return;
      checkRCAnswer(idx, rcOptions, btns);
    };
    // Zoom button event
    btn.querySelector('.rc-zoom-btn').onclick = (e) => {
      e.stopPropagation();
      showFlagModal(opt.img, `Flag of ${opt.country}`);
    };
    rcOptionsDiv.appendChild(btn);
  });
  // Store buttons for disabling
  let btns = Array.from(rcOptionsDiv.children);
  document.getElementById('result-rc').textContent = '';
  document.getElementById('wiki-link-rc').innerHTML = '';
  document.getElementById('next-rc').style.display = 'none';
  addFlagClickHandlers();
}

function checkRCAnswer(idx, options, btns) {
  if (rcTried[idx]) return;
  rcTried[idx] = true;
  btns[idx].disabled = true;
  rcAttempts++;
  let addScore = 0;
  if (idx === rcCorrectIndex) {
    if (rcAttempts === 1) addScore = 1;
    else if (rcAttempts === 2) addScore = 2/3;
    else if (rcAttempts === 3) addScore = 1/3;
    else addScore = 0;
    rcScore += addScore;
    rcTotal++;
    // Streak logic
    if (rcAttempts === 1 && addScore === 1) {
      rcStreak++;
      if (rcStreak > rcLongestStreak) rcLongestStreak = rcStreak;
    } else {
      rcStreak = 0;
    }
    updateScoreDisplays();
    saveHighScores();
    let pointStr = addScore === 1 ? '1 Point!' : (addScore === 2/3 ? '2/3 Point!' : (addScore === 1/3 ? '1/3 Point!' : '0 Point!'));
    document.getElementById('result-rc').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${rcCurrentFlag.country} (${rcCurrentFlag.code})`;
    document.getElementById('result-rc').style.color = '#2e7d32';
    document.getElementById('wiki-link-rc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${rcCurrentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    btns.forEach(b => b.disabled = true);
    document.getElementById('next-rc').style.display = 'block';
  } else {
    rcStreak = 0;
    // If this was the last possible attempt, finish the round
    if (rcAttempts >= 4 || rcTried.filter(Boolean).length === 4) {
      rcScore += 0;
      rcTotal++;
      updateScoreDisplays();
      saveHighScores();
      document.getElementById('result-rc').textContent = `❌ Out of tries! Correct: ${rcCurrentFlag.country} (${rcCurrentFlag.code})`;
      document.getElementById('result-rc').style.color = '#c62828';
      document.getElementById('wiki-link-rc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${rcCurrentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
      btns.forEach(b => b.disabled = true);
      document.getElementById('next-rc').style.display = 'block';
    }
  }
}

function nextMCFlag() {
  pickRandomFlagMC();
}

function nextRCFlag() {
  pickRandomFlagRC();
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
  if (!document.getElementById('flag-modal')) {
    const modal = document.createElement('div');
    modal.id = 'flag-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div id="flag-modal-bg" style="position:fixed;left:0;top:0;right:0;bottom:0;width:100vw;height:100vh;background:rgba(0,0,0,0.55);"></div>
      <div id="flag-modal-content" style="position:relative;z-index:2;display:flex;align-items:center;justify-content:center;max-width:95vw;max-height:90vh;margin:auto;">
        <img id="flag-modal-img" src="" alt="Flag" style="max-width:80vw;max-height:70vh;border-radius:0.5rem;box-shadow:0 2px 16px #0003;border:1px solid #ccc;background:#fff;" />
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('flag-modal-bg').onclick = closeFlagModal;
    document.getElementById('flag-modal-content').onclick = function(e) { e.stopPropagation(); };
    modal.onclick = function(e) { if (e.target === modal) closeFlagModal(); };
  }
}
function showFlagModal(imgUrl, alt) {
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

function addFlagClickHandlers() {
  // Entry mode
  const entryFlag = document.getElementById('flag-emoji');
  if (entryFlag) {
    const img = entryFlag.querySelector('img');
    if (img) {
      img.style.cursor = 'zoom-in';
      img.title = 'Click to enlarge';
      img.onclick = function(e) {
        e.stopPropagation();
        if (currentFlag && currentFlag.img) {
          showFlagModal(currentFlag.img, `Flag of ${currentFlag.country}`);
        }
      };
    }
  }
  // MC mode
  const mcFlag = document.getElementById('flag-emoji-mc');
  if (mcFlag) {
    const img = mcFlag.querySelector('img');
    if (img) {
      img.style.cursor = 'zoom-in';
      img.title = 'Click to enlarge';
      img.onclick = function(e) {
        e.stopPropagation();
        if (currentFlag && currentFlag.img) {
          showFlagModal(currentFlag.img, `Flag of ${currentFlag.country}`);
        }
      };
    }
  }
  // Study mode: delegate to table
  const studyTable = document.getElementById('study-tbody');
  if (studyTable) {
    studyTable.onclick = function(e) {
      if (e.target && e.target.tagName === 'IMG') {
        e.stopPropagation();
        showFlagModal(e.target.src, e.target.alt);
      }
    };
  }
  // Modal close events
  const modal = document.getElementById('flag-modal');
  if (modal) {
    modal.onclick = function(e) {
      if (e.target === modal) closeFlagModal();
    };
    const closeBtn = document.getElementById('flag-modal-close');
    if (closeBtn) closeBtn.onclick = closeFlagModal;
  }
}

// Ensure addFlagClickHandlers is called after every DOM update that changes flag images:
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
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
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
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
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
      document.getElementById('rc-mode-btn').addEventListener('click', showRCMode);
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
      // RC mode events
      document.getElementById('next-rc').onclick = nextRCFlag;
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
      // End game: reset all game state for RC mode
      document.getElementById('back-to-menu-rc').onclick = function() {
        rcScore = 0;
        rcTotal = 0;
        rcAttempts = 0;
        rcTried = [];
        updateScoreDisplays();
        saveHighScores();
        showMainMenu();
      };
      // End game: reset all game state for Saviour mode
      document.getElementById('back-to-menu-saviour').onclick = function() {
        saviourScore = 0;
        saviourTotal = 0;
        saviourStreak = 0;
        updateSaviourScoreDisplays();
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
  addFlagClickHandlers();
  // Saviour mode button event
  const savBtn = document.getElementById('saviour-mode-btn');
  if (savBtn) savBtn.onclick = showSaviourMode;
  const backSavBtn = document.getElementById('back-to-menu-saviour');
  if (backSavBtn) backSavBtn.onclick = showMainMenu;
};

window.showSaviourMode = showSaviourMode;

// --- Saviour Mode ---
function showSaviourMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'none';
  document.getElementById('study-page').style.display = 'none';
  document.getElementById('game-saviour').style.display = 'flex';
  saviourStreak = 0;
  updateSaviourScoreDisplays();
  setupSaviourGrid();
  setupSaviourActions();
}

function updateSaviourScoreDisplays() {
  document.getElementById('score-saviour').innerHTML = `Actions: ${saviourScore} of ${saviourTotal}<br>Streak: ${saviourStreak} <span class="score-streak">(Longest: ${saviourLongestStreak})</span>`;
  let savHS = `High Score: ${saviourHighScore} of ${saviourHighTotal}`;
  let nhs = '';
  if (
    saviourScore > saviourHighScore ||
    (saviourScore === saviourHighScore && saviourTotal < saviourHighTotal && saviourHighScore > 0)
  ) {
    nhs = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-saviour').innerHTML = savHS + nhs;
}

function setupSaviourGrid() {
  if (flags.length < 25) return;
  let shuffled = [...flags].sort(() => Math.random() - 0.5);
  saviourGrid = shuffled.slice(0, 25);
  saviourActive = Array(25).fill(true);
  saviourUsedActions = Array(SAVIOUR_ACTIONS.length).fill(false);
  saviourScore = 0;
  saviourGameOver = false;
  saviourActionHistory = [];
  saviourActionPointer = -1;
  saveSaviourActionState('Start');
  renderSaviourGrid();
}

function renderSaviourGrid(gameOver = false) {
  const gridDiv = document.getElementById('saviour-grid');
  gridDiv.innerHTML = '';
  for (let i = 0; i < saviourGrid.length; i++) {
    const flag = saviourGrid[i];
    const btn = document.createElement('button');
    btn.className = 'saviour-flag-btn' + (i === saviourHighlightIndex ? ' saviour-highlight' : '');
    btn.disabled = !saviourActive[i] || gameOver;
    if (!saviourActive[i]) {
      btn.style.filter = 'grayscale(1)';
      btn.style.opacity = '0.5';
    }
    if (gameOver) {
      btn.style.background = '#ffdddd';
      btn.style.borderColor = '#c62828';
    }
    btn.innerHTML = `<img src="${flag.img}" alt="Flag of ${flag.country}" title="${flag.country}" />`;
    gridDiv.appendChild(btn);
  }
}

function setupSaviourActions() {
  renderSaviourActions();
  renderSaviourUndoRedo();
}

function renderSaviourActions() {
  const actionsDiv = document.getElementById('saviour-actions');
  actionsDiv.innerHTML = '';
  SAVIOUR_ACTIONS.forEach((action, idx) => {
    const btn = document.createElement('button');
    btn.className = 'saviour-action-btn';
    btn.innerHTML = `${action.icon} <span style="font-size:0.95em;">${action.name}</span>`;
    btn.disabled = !!saviourUsedActions[idx] || saviourGameOver;
    // Action handlers
    if (action.name === 'Gamma Burst') {
      btn.onclick = gammaBurstAction;
    } else if (action.name === 'Freeze Ray') {
      btn.onclick = freezeRayAction;
    } else if (action.name === 'Heat Ray') {
      btn.onclick = heatRayAction;
    } else if (action.name === 'Tidal Force') {
      btn.onclick = tidalForceAction;
    } else if (action.name === 'Landlocked') {
      btn.onclick = landlockedAction;
    } else if (action.name === 'Tailor') {
      btn.onclick = tailorAction;
    } else if (action.name === 'Penny Pincher') {
      btn.onclick = pennyPincherAction;
    } else if (action.name === 'Money Bags') {
      btn.onclick = moneyBagsAction;
    } else if (action.name === 'Shrink Ray') {
      btn.onclick = shrinkRayAction;
    } else {
      btn.onclick = () => { /* Placeholder for other actions */ };
    }
    actionsDiv.appendChild(btn);
  });
}

// --- Saviour Mode Action Implementations ---
function gammaBurstAction() {
  if (saviourUsedActions[3] || saviourGameOver) return;
  // Save state for undo
  saveSaviourActionState('Gamma Burst');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && saviourGrid[i].nuclear_arms) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[3] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function freezeRayAction() {
  if (saviourUsedActions[0] || saviourGameOver) return;
  saveSaviourActionState('Freeze Ray');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && (saviourGrid[i].max_lat > 66.5 || saviourGrid[i].min_lat < -66.5)) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[0] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function heatRayAction() {
  if (saviourUsedActions[2] || saviourGameOver) return;
  saveSaviourActionState('Heat Ray');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && (saviourGrid[i].min_lat > 23.5 || saviourGrid[i].max_lat < -23.5)) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[2] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function tidalForceAction() {
  if (saviourUsedActions[7] || saviourGameOver) return;
  saveSaviourActionState('Tidal Force');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && saviourGrid[i].coastline_km > 0) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[7] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function landlockedAction() {
  if (saviourUsedActions[8] || saviourGameOver) return;
  saveSaviourActionState('Landlocked');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && saviourGrid[i].coastline_km === 0) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[8] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function tailorAction() {
  // Eliminates all countries with area >= 83879
  if (saviourUsedActions[4] || saviourGameOver) return;
  saveSaviourActionState('Tailor');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && saviourGrid[i].area >= 83879) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[4] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function pennyPincherAction() {
  // Eliminates all countries with GDP < 25000000000
  if (saviourUsedActions[5] || saviourGameOver) return;
  saveSaviourActionState('Penny Pincher');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && saviourGrid[i].gdp < 25000000000) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[5] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function moneyBagsAction() {
  // Eliminates all countries with GDP >= 25000000000
  if (saviourUsedActions[6] || saviourGameOver) return;
  saveSaviourActionState('Money Bags');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && saviourGrid[i].gdp >= 25000000000) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[6] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function shrinkRayAction() {
  if (saviourUsedActions[1] || saviourGameOver) return;
  saveSaviourActionState('Shrink Ray');
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && saviourGrid[i].area < 83879) { // Shrink Ray effect: area < 83,879 km²
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[1] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    showSaviourGameOver();
  } else {
    renderSaviourGrid();
    updateSaviourScoreDisplays();
    renderSaviourActions();
  }
}

function saveSaviourActionState(actionName) {
  // If we are not at the end, slice off redo history
  if (saviourActionPointer < saviourActionHistory.length - 1) {
    saviourActionHistory = saviourActionHistory.slice(0, saviourActionPointer + 1);
  }
  saviourActionHistory.push({
    saviourActive: JSON.parse(JSON.stringify(saviourActive)),
    saviourUsedActions: JSON.parse(JSON.stringify(saviourUsedActions)),
    saviourScore,
    saviourGameOver,
    actionName,
    grid: JSON.parse(JSON.stringify(saviourGrid)),
    highlight: saviourHighlightIndex,
    streak: saviourStreak,
    total: saviourTotal,
    longestStreak: saviourLongestStreak
  });
  saviourActionPointer = saviourActionHistory.length - 1;
  renderSaviourUndoRedo();
}

function undoSaviourAction() {
  if (saviourActionPointer <= 0) return;
  saviourActionPointer--;
  restoreSaviourActionState(saviourActionHistory[saviourActionPointer]);
}

function redoSaviourAction() {
  if (saviourActionPointer >= saviourActionHistory.length - 1) return;
  saviourActionPointer++;
  restoreSaviourActionState(saviourActionHistory[saviourActionPointer]);
}

function restoreSaviourActionState(state) {
  saviourActive = JSON.parse(JSON.stringify(state.saviourActive));
  saviourUsedActions = JSON.parse(JSON.stringify(state.saviourUsedActions));
  saviourScore = state.saviourScore;
  saviourGameOver = state.saviourGameOver;
  saviourGrid = JSON.parse(JSON.stringify(state.grid));
  saviourHighlightIndex = state.highlight;
  saviourStreak = state.streak;
  saviourTotal = state.total;
  saviourLongestStreak = state.longestStreak;
  renderSaviourGrid(saviourGameOver);
  updateSaviourScoreDisplays();
  renderSaviourActions();
  renderSaviourUndoRedo();
  if (saviourGameOver) showSaviourGameOver();
  else document.getElementById('result-saviour').innerHTML = '';
}

function showSaviourGameOver() {
  renderSaviourGrid(true);
  const flag = saviourGrid[saviourHighlightIndex];
  document.getElementById('result-saviour').innerHTML = `<span style="color:#c62828;font-weight:bold;">❌ You failed to save ${flag.country} (${flag.code})</span>`;
}
