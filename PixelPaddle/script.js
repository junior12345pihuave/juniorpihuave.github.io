// Variables del canvas y contexto
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Medidas
const paddleWidth = 10,
  paddleHeight = 80;
const ballSize = 10;
const paddleSpeed = 6;
const ballSpeed = 5;

// Jugadores
let paddle1Y = canvas.height / 2 - paddleHeight / 2;
let paddle2Y = canvas.height / 2 - paddleHeight / 2;
let player1Score = 0,
  player2Score = 0;
const maxScore = 5;

// Bola
let ballX = canvas.width / 2,
  ballY = canvas.height / 2;
let ballSpeedX = ballSpeed,
  ballSpeedY = ballSpeed;

// Estados
let gameOver = false;
let winnerText = "";

// 🔊 Sonido de victoria
const winSound = new Audio("sonidos/win.mp3");

// Botón de reinicio
const restartBtn = document.createElement("button");
restartBtn.innerText = "Reiniciar Juego";
restartBtn.style.position = "absolute";
restartBtn.style.top = "60%"; // más abajo que el texto
restartBtn.style.left = "50%";
restartBtn.style.transform = "translate(-50%, -50%)";
restartBtn.style.padding = "10px 20px";
restartBtn.style.fontSize = "18px";
restartBtn.style.display = "none"; // inicialmente oculto
document.body.appendChild(restartBtn);

restartBtn.addEventListener("click", () => {
  restartGame();
  restartBtn.style.display = "none";
});

// Eventos teclado
let keys = {};
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// Mover paletas
function movePaddles() {
  if (keys["w"] && paddle1Y > 0) paddle1Y -= paddleSpeed;
  if (keys["s"] && paddle1Y < canvas.height - paddleHeight)
    paddle1Y += paddleSpeed;

  if (keys["ArrowUp"] && paddle2Y > 0) paddle2Y -= paddleSpeed;
  if (keys["ArrowDown"] && paddle2Y < canvas.height - paddleHeight)
    paddle2Y += paddleSpeed;
}

// Dibujar
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fondo
  ctx.fillStyle = "#111"; // fondo oscuro
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Paletas (nuevo color que combina)
  ctx.fillStyle = "#ffcc00"; // dorado para destacar con fondo y pelota
  ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight);
  ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);

  // Bola
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4d4d"; // rojo para la pelota
  ctx.fill();

  // Rebotes visuales
  ctx.fillStyle = "#00ccff";
  ctx.fillRect(ballX - ballSize / 2, 0, ballSize, 5); // superior
  ctx.fillRect(ballX - ballSize / 2, canvas.height - 5, ballSize, 5); // inferior

  // Marcador
  ctx.fillStyle = "#00ccff";
  ctx.font = "20px Segoe UI";
  ctx.fillText("Jugador 1: " + player1Score, 50, 30);
  ctx.fillText("Jugador 2: " + player2Score, canvas.width - 170, 30);

  // Mensaje de victoria
  if (gameOver) {
    ctx.fillStyle = "#ffcc00";
    ctx.font = "40px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2 - 50);
    ctx.textAlign = "left";
    restartBtn.style.display = "block"; // mostrar botón más abajo
  }
}

// Mover bola
function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Rebote arriba/abajo
  if (ballY - ballSize < 0 || ballY + ballSize > canvas.height) {
    ballSpeedY = -ballSpeedY;
  }

  // Rebote paleta izquierda
  if (
    ballX - ballSize < paddleWidth &&
    ballY > paddle1Y &&
    ballY < paddle1Y + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX;
  }

  // Rebote paleta derecha
  if (
    ballX + ballSize > canvas.width - paddleWidth &&
    ballY > paddle2Y &&
    ballY < paddle2Y + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX;
  }

  // Punto para jugador 2
  if (ballX < 0) {
    player2Score++;
    resetBall();
  }

  // Punto para jugador 1
  if (ballX > canvas.width) {
    player1Score++;
    resetBall();
  }
}

// Reiniciar bola
function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
}

// Revisar ganador
function checkWinner() {
  if (!gameOver && (player1Score >= maxScore || player2Score >= maxScore)) {
    gameOver = true;
    winnerText =
      player1Score >= maxScore
        ? "¡Jugador 1 ha ganado!"
        : "¡Jugador 2 ha ganado!";
    winSound.currentTime = 0;
    winSound.play();
  }
}

// Reiniciar juego
function restartGame() {
  player1Score = 0;
  player2Score = 0;
  gameOver = false;
  winnerText = "";
  resetBall();
}

function gameLoop() {
  if (!gameOver) {
    movePaddles();
    moveBall();
  }
  checkWinner();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
