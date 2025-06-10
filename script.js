// List of countries and their flag emojis
const flags = [
  { country: "United States", emoji: "🇺🇸", wiki: "United_States" },
  { country: "United Kingdom", emoji: "🇬🇧", wiki: "United_Kingdom" },
  { country: "France", emoji: "🇫🇷", wiki: "France" },
  { country: "Germany", emoji: "🇩🇪", wiki: "Germany" },
  { country: "Italy", emoji: "🇮🇹", wiki: "Italy" },
  { country: "Spain", emoji: "🇪🇸", wiki: "Spain" },
  { country: "Japan", emoji: "🇯🇵", wiki: "Japan" },
  { country: "Brazil", emoji: "🇧🇷", wiki: "Brazil" },
  { country: "Canada", emoji: "🇨🇦", wiki: "Canada" },
  { country: "Australia", emoji: "🇦🇺", wiki: "Australia" },
  { country: "India", emoji: "🇮🇳", wiki: "India" },
  { country: "South Korea", emoji: "🇰🇷", wiki: "South_Korea" },
  { country: "Mexico", emoji: "🇲🇽", wiki: "Mexico" },
  { country: "Russia", emoji: "🇷🇺", wiki: "Russia" },
  { country: "China", emoji: "🇨🇳", wiki: "China" },
  { country: "Sweden", emoji: "🇸🇪", wiki: "Sweden" },
  { country: "Norway", emoji: "🇳🇴", wiki: "Norway" },
  { country: "Finland", emoji: "🇫🇮", wiki: "Finland" },
  { country: "Denmark", emoji: "🇩🇰", wiki: "Denmark" },
  { country: "Argentina", emoji: "🇦🇷", wiki: "Argentina" },
  { country: "South Africa", emoji: "🇿🇦", wiki: "South_Africa" },
  { country: "Turkey", emoji: "🇹🇷", wiki: "Turkey" },
  { country: "Greece", emoji: "🇬🇷", wiki: "Greece" },
  { country: "Switzerland", emoji: "🇨🇭", wiki: "Switzerland" },
  { country: "Netherlands", emoji: "🇳🇱", wiki: "Netherlands" },
  { country: "Belgium", emoji: "🇧🇪", wiki: "Belgium" },
  { country: "Portugal", emoji: "🇵🇹", wiki: "Portugal" },
  { country: "Poland", emoji: "🇵🇱", wiki: "Poland" },
  { country: "Ukraine", emoji: "🇺🇦", wiki: "Ukraine" },
  { country: "Egypt", emoji: "🇪🇬", wiki: "Egypt" }
];

let currentFlag = {};

function pickRandomFlag() {
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
  document.getElementById('flag-emoji').textContent = currentFlag.emoji;
  document.getElementById('guess').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('wiki-link').innerHTML = '';
  document.getElementById('next').style.display = 'none';
  document.getElementById('guess').disabled = false;
  document.getElementById('submit').disabled = false;
}

function checkGuess() {
  const guess = document.getElementById('guess').value.trim().toLowerCase();
  const answer = currentFlag.country.toLowerCase();
  if (guess === answer) {
    document.getElementById('result').textContent = '✅ Correct!';
    document.getElementById('result').style.color = '#2e7d32';
    document.getElementById('wiki-link').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    document.getElementById('next').style.display = 'block';
    document.getElementById('guess').disabled = true;
    document.getElementById('submit').disabled = true;
  } else {
    document.getElementById('result').textContent = '❌ Try again!';
    document.getElementById('result').style.color = '#c62828';
  }
}

document.getElementById('submit').addEventListener('click', checkGuess);
document.getElementById('guess').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') checkGuess();
});
document.getElementById('next').addEventListener('click', pickRandomFlag);

// Start game on load
window.onload = pickRandomFlag;
