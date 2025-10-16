const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const startBtn = document.getElementById("startBtn");
const levelComplete = document.getElementById("levelComplete");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const gameOver = document.getElementById("gameOver");
const retryBtn = document.getElementById("retryBtn");
const menuBtn = document.getElementById("menuBtn");
const levelDisplay = document.getElementById("levelDisplay");
const timerDisplay = document.getElementById("timerDisplay");

const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

let level = 1;
let player, enemies, obstacles, goal;
let keys = {};
let gameRunning = false;
let timeElapsed = 0;
let timerInterval;
let timeLimit = 30;

function createLevel() {
  const baseSpeed = 2 + level * 0.3; // jugador más rápido
  const enemySpeed = 1 + level * 0.4; // enemigos más rápidos
  const numObstacles = 2 + level;
  const numEnemies = Math.min(1 + Math.floor(level / 2), 6);

  player = { x: 50, y: 180, size: 25, color: "#00aaff", speed: baseSpeed };
  goal = { x: 550, y: 180, size: 30, color: "lime" };

  obstacles = [];
  for (let i = 0; i < numObstacles; i++) {
    obstacles.push({
      x: 100 + Math.random() * 400,
      y: 50 + Math.random() * 300,
      w: 100,
      h: 15,
      color: "#ff4444",
    });
  }

  enemies = [];
  for (let i = 0; i < numEnemies; i++) {
    enemies.push({
      x: 300 + i * 40,
      y: 100 + Math.random() * 200,
      size: 22,
      color: "red",
      speed: enemySpeed,
    });
  }

  // Tiempo límite más difícil en niveles altos
  timeLimit = Math.max(10, 30 - level * 2);
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawEnemy(e) {
  ctx.beginPath();
  ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI * 2);
  ctx.fillStyle = e.color;
  ctx.fill();
  ctx.closePath();

  // ojos animados
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(e.x - 4, e.y - 3, 3, 0, Math.PI * 2);
  ctx.arc(e.x + 4, e.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(e.x - 4, e.y - 3, 1, 0, Math.PI * 2);
  ctx.arc(e.x + 4, e.y - 3, 1, 0, Math.PI * 2);
  ctx.fill();
}

function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.w || obj.size, obj.h || obj.size);
}

// colisiones
function collisionRect(a, b) {
  return (
    a.x < b.x + (b.w || b.size) &&
    a.x + a.size > b.x &&
    a.y < b.y + (b.h || b.size) &&
    a.y + a.size > b.y
  );
}

function collisionCircle(player, enemy) {
  const dx = player.x + player.size / 2 - enemy.x;
  const dy = player.y + player.size / 2 - enemy.y;
  const distance = Math.hypot(dx, dy);
  return distance < player.size / 2 + enemy.size / 2;
}

function update() {
  if (!gameRunning) return;

  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  for (let o of obstacles) {
    if (collisionRect(player, o)) {
      if (keys["ArrowUp"]) player.y += player.speed;
      if (keys["ArrowDown"]) player.y -= player.speed;
      if (keys["ArrowLeft"]) player.x += player.speed;
      if (keys["ArrowRight"]) player.x -= player.speed;
    }
  }

  for (let e of enemies) {
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let dist = Math.hypot(dx, dy);
    e.x += (dx / dist) * e.speed;
    e.y += (dy / dist) * e.speed;

    if (collisionCircle(player, e)) {
      loseSound.play();
      endGame(false);
    }
  }

  if (collisionRect(player, goal)) {
    winSound.play();
    endGame(true);
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(goal);
  obstacles.forEach(drawRect);
  enemies.forEach(drawEnemy);
  drawPlayer();
}

// cronómetro regresivo
function startTimer() {
  timeElapsed = 0;
  timerDisplay.textContent = `Tiempo: ${timeLimit}s`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    const timeLeft = Math.max(0, timeLimit - timeElapsed);
    timerDisplay.textContent = `Tiempo: ${timeLeft}s`;
    if (timeLeft <= 0) {
      loseSound.play();
      endGame(false);
    }
  }, 1000);
}

function endGame(won) {
  gameRunning = false;
  clearInterval(timerInterval);
  if (won) {
    levelComplete.style.display = "block";
    levelComplete.classList.add("show");
  } else {
    gameOver.style.display = "block";
    gameOver.classList.add("show");
  }
}

function startGame() {
  menu.style.display = "none";
  levelComplete.style.display = "none";
  gameOver.style.display = "none";
  canvas.style.display = "block";
  hud.classList.remove("hidden");
  levelDisplay.textContent = `Nivel: ${level}`;
  createLevel();
  startTimer();
  gameRunning = true;
  update();
}

// eventos
startBtn.addEventListener("click", () => {
  level = 1;
  startGame();
});

nextLevelBtn.addEventListener("click", () => {
  level++;
  startGame();
});

retryBtn.addEventListener("click", () => {
  startGame();
});

menuBtn.addEventListener("click", () => {
  hud.classList.add("hidden");
  canvas.style.display = "none";
  menu.style.display = "block";
  clearInterval(timerInterval);
  gameRunning = false;
});

document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));
