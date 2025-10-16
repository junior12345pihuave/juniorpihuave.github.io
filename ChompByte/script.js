const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const tileSize = 16;

let score = 0;
let ghosts = [];
let gameLoopId;
let lastTime = 0;
const gameSpeed = 150;
let gameStarted = false;

// ===== DOM =====
const scoreDisplay = document.getElementById("score");
const gameOverMenu = document.getElementById("gameOverMenu");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

// ===== Sonido =====
const deathSound = new Audio("sonidos/draw.mp3");

// ===== Estado =====
let isDying = false;

// ===== Mapa =====
const WALL = "#",
  DOT = ".",
  POWER_PELLET = "o",
  EMPTY = " ";
const level = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "     #.## ###--### ##.#     ",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "     #.## ######## ##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##................##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
];

let map = [];
function initMap() {
  map = level.map((row) => row.split(""));
}

// ===== ChompByte (Pac-Man) =====
let chomp = { x: 13, y: 23, dir: "left", nextDir: "left" };

// ===== Movimiento teclado =====
document.addEventListener("keydown", (e) => {
  if (!gameStarted || isDying) return;
  switch (e.key) {
    case "ArrowUp":
    case "w":
      chomp.nextDir = "up";
      break;
    case "ArrowDown":
    case "s":
      chomp.nextDir = "down";
      break;
    case "ArrowLeft":
    case "a":
      chomp.nextDir = "left";
      break;
    case "ArrowRight":
    case "d":
      chomp.nextDir = "right";
      break;
  }
});

// ===== Funciones =====
function canMove(x, y) {
  return (
    !(y < 0 || y >= map.length || x < 0 || x >= map[0].length) &&
    map[y][x] !== WALL
  );
}

function moveGhost(g) {
  const dirs = ["up", "down", "left", "right"];
  const possible = dirs.filter((d) => {
    let nx = g.x,
      ny = g.y;
    if (d === "up") ny--;
    if (d === "down") ny++;
    if (d === "left") nx--;
    if (d === "right") nx++;
    return canMove(nx, ny);
  });
  if (!possible.length) return;
  g.dir = possible[Math.floor(Math.random() * possible.length)];
  if (g.dir === "up") g.y--;
  if (g.dir === "down") g.y++;
  if (g.dir === "left") g.x--;
  if (g.dir === "right") g.x++;
}

function playDeathSound() {
  deathSound.pause();
  deathSound.currentTime = 0;
  deathSound
    .play()
    .catch((err) => console.log("Error al reproducir sonido:", err));
}

function checkCollisions() {
  if (!gameStarted || isDying) return;
  for (const g of [...ghosts]) {
    if (chomp.x === g.x && chomp.y === g.y) {
      if (g.state === "normal") {
        // Muerte
        isDying = true;
        playDeathSound();
        canvas.classList.add("shake");
        setTimeout(() => canvas.classList.remove("shake"), 500);

        setTimeout(() => {
          gameStarted = false;
          finalScore.textContent = "Puntaje final: " + score;
          gameOverMenu.classList.add("show");
          isDying = false;
        }, 600);
      } else if (g.state === "scared") {
        score += 200;
        ghosts = ghosts.filter((f) => f !== g);
        setTimeout(() => {
          ghosts.push({ x: 13, y: 11, dir: "left", state: "normal" });
        }, 2000);
      }
    }
  }
}

// ===== Update y Draw =====
function update() {
  if (!gameStarted || isDying) return;

  let nx = chomp.x,
    ny = chomp.y;
  switch (chomp.nextDir) {
    case "up":
      ny--;
      break;
    case "down":
      ny++;
      break;
    case "left":
      nx--;
      break;
    case "right":
      nx++;
      break;
  }

  if (canMove(nx, ny)) {
    chomp.x = nx;
    chomp.y = ny;
    chomp.dir = chomp.nextDir;
  } else {
    nx = chomp.x;
    ny = chomp.y;
    switch (chomp.dir) {
      case "up":
        ny--;
        break;
      case "down":
        ny++;
        break;
      case "left":
        nx--;
        break;
      case "right":
        nx++;
        break;
    }
    if (canMove(nx, ny)) {
      chomp.x = nx;
      chomp.y = ny;
    }
  }

  const tile = map[chomp.y][chomp.x];
  if (tile === DOT) {
    map[chomp.y][chomp.x] = EMPTY;
    score += 10;
  } else if (tile === POWER_PELLET) {
    map[chomp.y][chomp.x] = EMPTY;
    score += 50;
    ghosts.forEach((g) => (g.state = "scared"));
    setTimeout(
      () =>
        ghosts.forEach((g) =>
          g.state === "scared" ? (g.state = "normal") : null
        ),
      6000
    );
  }

  ghosts.forEach(moveGhost);
  checkCollisions();
  scoreDisplay.textContent = "Puntaje: " + score;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mapa
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      const tile = map[r][c],
        x = c * tileSize,
        y = r * tileSize;
      if (tile === WALL) {
        ctx.fillStyle = "blue";
        ctx.fillRect(x, y, tileSize, tileSize);
      } else if (tile === DOT) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, 3, 0, 2 * Math.PI);
        ctx.fill();
      } else if (tile === POWER_PELLET) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  // ChompByte
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(
    chomp.x * tileSize + tileSize / 2,
    chomp.y * tileSize + tileSize / 2,
    tileSize / 2 - 2,
    0,
    2 * Math.PI
  );
  ctx.fill();

  // Fantasmas
  ghosts.forEach((g) => {
    ctx.fillStyle =
      g.state === "normal" ? "red" : g.state === "scared" ? "blue" : "gray";
    ctx.beginPath();
    ctx.arc(
      g.x * tileSize + tileSize / 2,
      g.y * tileSize + tileSize / 2,
      tileSize / 2 - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  });
}

// ===== Game Loop =====
function gameLoop(timestamp) {
  if (timestamp - lastTime >= gameSpeed) {
    update();
    draw();
    lastTime = timestamp;
  }
  if (gameStarted) gameLoopId = requestAnimationFrame(gameLoop);
}

// ===== Iniciar Juego =====
function startGame() {
  score = 0;
  initMap();
  chomp = { x: 13, y: 23, dir: "left", nextDir: "left" };
  ghosts = [
    { x: 11, y: 11, dir: "left", state: "normal" },
    { x: 15, y: 11, dir: "left", state: "normal" },
    { x: 13, y: 9, dir: "left", state: "normal" },
  ];
  gameStarted = true;
  lastTime = 0;
  isDying = false;
  gameOverMenu.classList.remove("show");
  cancelAnimationFrame(gameLoopId);
  gameLoopId = requestAnimationFrame(gameLoop);
}

restartBtn.addEventListener("click", startGame);
window.onload = startGame;
