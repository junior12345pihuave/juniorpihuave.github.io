const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 500;

const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const finalScoreEl = document.getElementById("finalScore");

const drawSound = new Audio("sonidos/draw.mp3");

let player, bars, score, gameRunning, speedMultiplier, record;

// Cargar récord desde localStorage
record = localStorage.getItem("neonRecord") || 0;

// ⚡ Jugador
function createPlayer() {
  return {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    color: "#0ff",
    speed: 10,
  };
}

// ⚡ Barra enemiga
function createBar() {
  const barWidth = Math.random() * 80 + 40;
  return {
    x: Math.random() * (canvas.width - barWidth),
    y: -20,
    width: barWidth,
    height: 20,
    color: "#f0f", // celeste/magenta
    speed: Math.random() * 2 + 2 + speedMultiplier, // 🔹 aumento de velocidad base
  };
}

// 🎮 Reiniciar juego
function resetGame() {
  player = createPlayer();
  bars = [];
  score = 0;
  speedMultiplier = 0;
  gameRunning = true;
  gameOverEl.classList.add("hidden");
  updateScore();
  requestAnimationFrame(gameLoop);
}

// ⌨️ Movimiento
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft" && player.x > 0) {
    player.x -= player.speed;
  }
  if (e.key === "ArrowRight" && player.x + player.width < canvas.width) {
    player.x += player.speed;
  }
});

// 📝 Actualizar marcador
function updateScore() {
  scoreEl.textContent = `Puntaje: ${score} | Récord: ${record}`;
}

// 🔄 Bucle principal
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar jugador
  ctx.fillStyle = player.color;
  ctx.shadowBlur = 20;
  ctx.shadowColor = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Crear barras
  if (Math.random() < 0.03) {
    bars.push(createBar());
  }

  // Dibujar y mover barras
  for (let i = bars.length - 1; i >= 0; i--) {
    let b = bars[i];
    b.y += b.speed;

    ctx.fillStyle = b.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);

    // Colisión
    if (
      player.x < b.x + b.width &&
      player.x + player.width > b.x &&
      player.y < b.y + b.height &&
      player.y + player.height > b.y
    ) {
      gameOver();
    }

    // Quitar barras que salieron
    if (b.y > canvas.height) {
      bars.splice(i, 1);
      score++;
      if (score > record) {
        record = score;
        localStorage.setItem("neonRecord", record);
      }
      updateScore();

      // aumentar dificultad cada 10 puntos
      if (score % 10 === 0) {
        speedMultiplier += 0.3;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

// 🚨 Game Over
function gameOver() {
  gameRunning = false;
  finalScoreEl.textContent = `Tu puntaje fue: ${score}`;
  gameOverEl.classList.remove("hidden");
  drawSound.play();
}

// 🔄 Reiniciar con botón
restartBtn.addEventListener("click", resetGame);

// Iniciar
resetGame();
