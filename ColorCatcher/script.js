const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let playerColor = "red";
let playerSize;
let playerX;
let playerY;
let playerSpeed;
let blockSize;

const drawSound = new Audio("sonidos/draw.mp3");

let fallingBlocks = [];
const colors = ["red", "green", "blue", "yellow"];

let missedBlocks = 0; // ✅ ahora solo contamos los bloques perdidos en total
const maxMissedBlocks = 3; // ✅ perder al dejar caer 3 en total
let gameOver = false;

const gameOverMenu = document.getElementById("gameOverMenu");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

function resizeCanvas() {
  canvas.width = 300;
  canvas.height = 450;

  playerSize = canvas.width * 0.15;
  blockSize = canvas.width * 0.1;
  playerSpeed = canvas.width * 0.05;

  playerX = canvas.width / 2 - playerSize / 2;
  playerY = canvas.height - playerSize - 15;
}
resizeCanvas();

// Controles
document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  if (e.key === "ArrowLeft") playerX -= playerSpeed;
  if (e.key === "ArrowRight") playerX += playerSpeed;
  if (playerX < 0) playerX = 0;
  if (playerX + playerSize > canvas.width) playerX = canvas.width - playerSize;
});

// Bloques
function spawnBlock() {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * (canvas.width - blockSize);
  fallingBlocks.push({ x, y: 0, color });
}

// Game Over
function showGameOver() {
  gameOver = true;

  // Reproducir sonido de derrota
  drawSound.currentTime = 0;
  drawSound.play();

  finalScore.innerText = `Puntaje final: ${score}`;
  document.getElementById(
    "endMessage"
  ).innerText = `¡Perdiste! Dejaste caer ${maxMissedBlocks} bloques en total`;
  gameOverMenu.classList.remove("hidden");
}

// Reinicio
restartBtn.addEventListener("click", () => {
  score = 0;
  missedBlocks = 0; // ✅ reiniciar contador de perdidos
  fallingBlocks = [];
  playerX = canvas.width / 2 - playerSize / 2;
  gameOver = false;
  gameOverMenu.classList.add("hidden");
  update();
});

// Bucle
function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jugador
  ctx.fillStyle = playerColor;
  ctx.fillRect(playerX, playerY, playerSize, playerSize);

  // Bloques
  fallingBlocks.forEach((block, i) => {
    block.y += 3 + Math.floor(score / 5);
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, blockSize, blockSize);

    // Colisión -> ahora da puntos con cualquier color
    if (
      block.y + blockSize >= playerY &&
      block.x + blockSize >= playerX &&
      block.x <= playerX + playerSize
    ) {
      score++;
      fallingBlocks.splice(i, 1);
    }

    // Perdido
    if (block.y > canvas.height) {
      missedBlocks++; // ✅ aumenta el total de perdidos
      if (missedBlocks >= maxMissedBlocks) {
        showGameOver();
      }
      fallingBlocks.splice(i, 1);
    }
  });

  document.getElementById("score").innerText = score;

  if (!gameOver) requestAnimationFrame(update);
}

setInterval(spawnBlock, 1000);
update();
