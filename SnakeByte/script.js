const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const currentScoreText = document.getElementById("currentScore");
const highScoreText = document.getElementById("highScore");
const timeText = document.getElementById("timeSurvived");
const finalScoreText = document.getElementById("finalScore");
const finalTimeText = document.getElementById("finalTime");
const newRecordMessage = document.getElementById("newRecordMessage");
const gameOverModal = document.getElementById("gameOverModal");

const gridSize = 18;
const tileCount = Math.floor(canvas.width / gridSize);
const drawSound = new Audio("sonidos/draw.mp3");

const foodColors = ["#ff4f4f", "#ffae4f", "#4fff7b", "#4f7bff", "#d14fff"];
let foodColor;

let snake,
  food,
  dx,
  dy,
  score,
  highScore,
  gameInterval,
  timeInterval,
  timeElapsed;

highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreText.textContent = highScore;

function initGame() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  dx = 0;
  dy = 0;
  score = 0;
  timeElapsed = 0;

  currentScoreText.textContent = score;
  timeText.textContent = "00:00";
  newRecordMessage.classList.add("hidden");

  clearInterval(gameInterval);
  clearInterval(timeInterval);

  gameInterval = setInterval(draw, 100);
  timeInterval = setInterval(updateTime, 1000);

  gameOverModal.classList.add("hidden");
}

function updateTime() {
  timeElapsed++;
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  timeText.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function generateFood() {
  foodColor = foodColors[Math.floor(Math.random() * foodColors.length)];
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };
}

function drawSnakePart(part) {
  ctx.fillStyle = "#aaff00";
  ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
  ctx.strokeStyle = "#ffffff55";
  ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
}

function drawSnakeHead(part) {
  const x = part.x * gridSize;
  const y = part.y * gridSize;

  ctx.fillStyle = "#66ff00";
  ctx.fillRect(x, y, gridSize, gridSize);
  ctx.strokeStyle = "#ffffff55";
  ctx.strokeRect(x, y, gridSize, gridSize);

  const eyeRadius = 2;
  let eye1 = { x: 0, y: 0 };
  let eye2 = { x: 0, y: 0 };
  const offset = 4;

  if (dx === 1) {
    eye1 = { x: x + gridSize - offset, y: y + offset };
    eye2 = { x: x + gridSize - offset, y: y + gridSize - offset };
  } else if (dx === -1) {
    eye1 = { x: x + offset, y: y + offset };
    eye2 = { x: x + offset, y: y + gridSize - offset };
  } else if (dy === 1) {
    eye1 = { x: x + offset, y: y + gridSize - offset };
    eye2 = { x: x + gridSize - offset, y: y + gridSize - offset };
  } else if (dy === -1) {
    eye1 = { x: x + offset, y: y + offset };
    eye2 = { x: x + gridSize - offset, y: y + offset };
  } else {
    eye1 = { x: x + offset, y: y + offset };
    eye2 = { x: x + gridSize - offset, y: y + offset };
  }

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, eyeRadius, 0, 2 * Math.PI);
  ctx.arc(eye2.x, eye2.y, eyeRadius, 0, 2 * Math.PI);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((part, index) => {
    index === 0 ? drawSnakeHead(part) : drawSnakePart(part);
  });
}

function drawFood() {
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;
  const radius = (gridSize / 2) * 0.8;

  ctx.fillStyle = foodColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = "#ffffff88";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function moveSnake() {
  let newX = snake[0].x + dx;
  let newY = snake[0].y + dy;

  if (newX < 0) newX = tileCount - 1;
  if (newX >= tileCount) newX = 0;
  if (newY < 0) newY = tileCount - 1;
  if (newY >= tileCount) newY = 0;

  const head = { x: newX, y: newY };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    currentScoreText.textContent = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
      highScoreText.textContent = highScore;
      newRecordMessage.classList.remove("hidden");
    }

    food = generateFood();
  } else {
    snake.pop();
  }
}

function checkCollisions() {
  const head = snake[0];
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true;
  }
  return false;
}

function animateDeath(callback) {
  let i = snake.length - 1;
  const interval = setInterval(() => {
    snake.splice(i, 1);
    draw();
    i--;
    if (i < 0) {
      clearInterval(interval);
      callback();
    }
  }, 150);
}

let isGameOver = false; // Variable para evitar que siga moviendo o detectando después de morir

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isGameOver) {
    drawSnake();
    drawFood();
    return; // No mover ni dibujar más nada mientras animación termina
  }

  if (dx !== 0 || dy !== 0) moveSnake();
  drawSnake();
  drawFood();

  if (checkCollisions()) {
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    drawSound.play();

    isGameOver = true; // bloquea el movimiento y la actualización

    animateDeath(() => {
      finalScoreText.textContent = `Tus puntos fueron: ${score}`;
      const min = Math.floor(timeElapsed / 60);
      const sec = timeElapsed % 60;
      finalTimeText.textContent = `Sobreviviste: ${String(min).padStart(
        2,
        "0"
      )}:${String(sec).padStart(2, "0")}`;
      gameOverModal.classList.remove("hidden");
    });

    return;
  }
}

function handleKeyDown(event) {
  const key = event.key;
  if (key === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -1;
  } else if (key === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = 1;
  } else if (key === "ArrowLeft" && dx === 0) {
    dx = -1;
    dy = 0;
  } else if (key === "ArrowRight" && dx === 0) {
    dx = 1;
    dy = 0;
  }
}

function restartGame() {
  isGameOver = false; // reinicia el flag
  initGame();
}
document.addEventListener("keydown", handleKeyDown);
initGame();
