// List of countries and their flag emojis
const flags = [
  { country: "United States", code: "US", emoji: "🇺🇸", wiki: "United_States", img: "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" },
  { country: "United Kingdom", code: "GB", emoji: "🇬🇧", wiki: "United_Kingdom", img: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" },
  { country: "France", code: "FR", emoji: "🇫🇷", wiki: "France", img: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg" },
  { country: "Germany", code: "DE", emoji: "🇩🇪", wiki: "Germany", img: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg" },
  { country: "Italy", code: "IT", emoji: "🇮🇹", wiki: "Italy", img: "https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg" },
  { country: "Spain", code: "ES", emoji: "🇪🇸", wiki: "Spain", img: "https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg" },
  { country: "Japan", code: "JP", emoji: "🇯🇵", wiki: "Japan", img: "https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg" },
  { country: "Brazil", code: "BR", emoji: "🇧🇷", wiki: "Brazil", img: "https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg" },
  { country: "Canada", code: "CA", emoji: "🇨🇦", wiki: "Canada", img: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg" },
  { country: "Australia", code: "AU", emoji: "🇦🇺", wiki: "Australia", img: "https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg" },
  { country: "India", code: "IN", emoji: "🇮🇳", wiki: "India", img: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" },
  { country: "South Korea", code: "KR", emoji: "🇰🇷", wiki: "South_Korea", img: "https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg" },
  { country: "Mexico", code: "MX", emoji: "🇲🇽", wiki: "Mexico", img: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg" },
  { country: "Russia", code: "RU", emoji: "🇷🇺", wiki: "Russia", img: "https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg" },
  { country: "China", code: "CN", emoji: "🇨🇳", wiki: "China", img: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg" },
  { country: "Sweden", code: "SE", emoji: "🇸🇪", wiki: "Sweden", img: "https://upload.wikimedia.org/wikipedia/en/4/4c/Flag_of_Sweden.svg" },
  { country: "Norway", code: "NO", emoji: "🇳🇴", wiki: "Norway", img: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg" },
  { country: "Finland", code: "FI", emoji: "🇫🇮", wiki: "Finland", img: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Finland.svg" },
  { country: "Denmark", code: "DK", emoji: "🇩🇰", wiki: "Denmark", img: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Denmark.svg" },
  { country: "Argentina", code: "AR", emoji: "🇦🇷", wiki: "Argentina", img: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg" },
  { country: "South Africa", code: "ZA", emoji: "🇿🇦", wiki: "South_Africa", img: "https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg" },
  { country: "Turkey", code: "TR", emoji: "🇹🇷", wiki: "Turkey", img: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg" },
  { country: "Greece", code: "GR", emoji: "🇬🇷", wiki: "Greece", img: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Greece.svg" },
  { country: "Switzerland", code: "CH", emoji: "🇨🇭", wiki: "Switzerland", img: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg" },
  { country: "Netherlands", code: "NL", emoji: "🇳🇱", wiki: "Netherlands", img: "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg" },
  { country: "Belgium", code: "BE", emoji: "🇧🇪", wiki: "Belgium", img: "https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg" },
  { country: "Portugal", code: "PT", emoji: "🇵🇹", wiki: "Portugal", img: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg" },
  { country: "Poland", code: "PL", emoji: "🇵🇱", wiki: "Poland", img: "https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg" },
  { country: "Ukraine", code: "UA", emoji: "🇺🇦", wiki: "Ukraine", img: "https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg" },
  { country: "Egypt", code: "EG", emoji: "🇪🇬", wiki: "Egypt", img: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Egypt.svg" }
];

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
  document.getElementById('hint').style.display = 'none';
  document.getElementById('hint-text').textContent = '';
}

function checkGuess() {
  const guess = document.getElementById('guess').value.trim().toLowerCase();
  const answer = currentFlag.country.toLowerCase();
  const code = currentFlag.code.toLowerCase();
  if (guess === answer || guess === code) {
    document.getElementById('result').textContent = '✅ Correct!';
    document.getElementById('result').style.color = '#2e7d32';
    document.getElementById('wiki-link').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    document.getElementById('submit').textContent = 'Next Flag';
    document.getElementById('guess').disabled = true;
    document.getElementById('submit').onclick = pickRandomFlag;
    document.getElementById('hint').style.display = 'none';
  } else {
    document.getElementById('result').textContent = '❌ Try again!';
    document.getElementById('result').style.color = '#c62828';
    document.getElementById('hint').style.display = 'block';
    document.getElementById('submit').onclick = checkGuess;
  }
}

function showHint() {
  document.getElementById('hint-text').textContent = `Country code: ${currentFlag.code}`;
  document.getElementById('hint').style.display = 'none';
}

document.getElementById('submit').onclick = checkGuess;
document.getElementById('guess').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !document.getElementById('guess').disabled) checkGuess();
});
document.getElementById('hint').onclick = showHint;

window.onload = pickRandomFlag;
