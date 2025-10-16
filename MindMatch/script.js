// ======== Lógica del juego ========
const gameBoard = document.getElementById("gameBoard");
const statusEl = document.getElementById("status");
const winOverlay = document.getElementById("winOverlay");
const newGameBtn = document.getElementById("newGameBtn");
const drawSound = new Audio("sonidos/draw.mp3");

// Conjunto ampliado de símbolos (12 pares = 24 cartas)
const baseSymbols = [
  "♠",
  "♣",
  "♥",
  "♦",
  "★",
  "☂",
  "♫",
  "⚽",
  "🐱",
  "🍀",
  "🌙",
  "⚡",
];

let deck = [];
let flipped = [];
let matched = 0;
let lockBoard = false;

function buildDeck() {
  deck = [...baseSymbols, ...baseSymbols]
    .map((symbol) => ({ symbol, id: crypto.randomUUID() }))
    .sort(() => Math.random() - 0.5);
}

function updateStatus() {
  const totalPairs = deck.length / 2;
  statusEl.textContent = `Pares: ${matched}/${totalPairs}`;
}

function createCard(cardData, index) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.setAttribute("data-index", index);
  card.setAttribute("aria-pressed", "false");
  card.setAttribute("aria-label", "Carta oculta");
  card.addEventListener("click", onCardClick);
  card.textContent = cardData.symbol;
  gameBoard.appendChild(card);
}

function drawBoard() {
  gameBoard.innerHTML = "";
  deck.forEach((c, i) => createCard(c, i));
  updateStatus();
}

function onCardClick(e) {
  if (lockBoard) return;
  const cardEl = e.currentTarget;
  const idx = Number(cardEl.getAttribute("data-index"));

  if (flipped.includes(idx) || cardEl.classList.contains("matched")) return;

  flipCard(cardEl);
  flipped.push(idx);

  if (flipped.length === 2) checkPair();
}

function flipCard(cardEl) {
  cardEl.classList.add("flipped");
  cardEl.setAttribute("aria-pressed", "true");
  cardEl.setAttribute("aria-label", `Carta: ${cardEl.textContent}`);
}

function unflipCard(cardEl) {
  cardEl.classList.remove("flipped");
  cardEl.setAttribute("aria-pressed", "false");
  cardEl.setAttribute("aria-label", "Carta oculta");
}

function checkPair() {
  lockBoard = true;
  const [i1, i2] = flipped;
  const c1 = gameBoard.querySelector(`.card[data-index="${i1}"]`);
  const c2 = gameBoard.querySelector(`.card[data-index="${i2}"]`);
  const s1 = deck[i1].symbol;
  const s2 = deck[i2].symbol;

  if (s1 === s2) {
    c1.classList.add("matched");
    c2.classList.add("matched");
    matched++;
    updateStatus();

    if (matched === deck.length / 2) {
      drawSound.currentTime = 0;
      drawSound
        .play()
        .catch((err) => console.log("Error al reproducir audio:", err));
      setTimeout(() => {
        winOverlay.classList.add("show");
      }, 400);
    }

    flipped = [];
    lockBoard = false;
  } else {
    setTimeout(() => {
      unflipCard(c1);
      unflipCard(c2);
      flipped = [];
      lockBoard = false;
    }, 800);
  }
}

function newGame() {
  matched = 0;
  flipped = [];
  lockBoard = false;
  buildDeck();
  drawBoard();
  winOverlay.classList.remove("show");
}

newGameBtn.addEventListener("click", newGame);

// Iniciar el juego
newGame();
