const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let dropCounter = 0;
let dropInterval = 300;
let lastTime = 0;

const blockSize = 30;
const boardWidth = 10;
const boardHeight = 20;
const emptyBlockColor = "#1f1f2e";

let board = [];
let currentPiece = null;
let isGameOver = false;
let score = 0;
let linesCleared = 0;

const tetrominoes = [
  { shape: [[1, 1, 1, 1]], color: "#00ffc8" }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#ffcc00",
  }, // O
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#ff0066",
  }, // T
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#00ccff",
  }, // J
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#ff3300",
  }, // L
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#33ff00",
  }, // S
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#cc00ff",
  }, // Z
];

function initBoard() {
  board = [];
  for (let y = 0; y < boardHeight; y++) {
    const row = Array(boardWidth).fill(emptyBlockColor);
    board.push(row);
  }
}

function drawBoard() {
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      ctx.fillStyle = board[y][x];
      ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }
}

// Sonidos
const drawSound = new Audio("sonidos/draw.mp3");

function drawPiece(piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        ctx.fillStyle = piece.color;
        ctx.fillRect(
          (piece.x + x) * blockSize,
          (piece.y + y) * blockSize,
          blockSize,
          blockSize
        );
        ctx.strokeStyle = "#000";
        ctx.strokeRect(
          (piece.x + x) * blockSize,
          (piece.y + y) * blockSize,
          blockSize,
          blockSize
        );
      }
    }
  }
}

function spawnPiece() {
  const index = Math.floor(Math.random() * tetrominoes.length);
  const shape = tetrominoes[index].shape;
  const color = tetrominoes[index].color;

  currentPiece = {
    shape,
    color,
    x: Math.floor(boardWidth / 2) - Math.floor(shape[0].length / 2),
    y: 0,
  };
  if (collides(currentPiece, 0, 0)) {
    gameOver();
  }
}

function collides(piece, offsetX, offsetY) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;
        if (
          newX < 0 ||
          newX >= boardWidth ||
          newY >= boardHeight ||
          (newY >= 0 && board[newY][newX] !== emptyBlockColor)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function mergePiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
      }
    }
  }
}

function clearLines() {
  let lines = 0;

  for (let y = boardHeight - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell !== emptyBlockColor)) {
      board.splice(y, 1);
      board.unshift(Array(boardWidth).fill(emptyBlockColor));
      lines++;
      y++; // repetir línea nueva
    }
  }

  if (lines > 0) {
    score += lines * 100;
    linesCleared += lines;
    document.getElementById("score").textContent = score;
    document.getElementById("lines").textContent = linesCleared;
    drawSound.play().catch(() => {});
  }
}

function dropPiece() {
  if (!collides(currentPiece, 0, 1)) {
    currentPiece.y++;
  } else {
    mergePiece();
    clearLines();
    spawnPiece();
  }
}

function rotatePiece() {
  const newShape = currentPiece.shape[0].map((_, i) =>
    currentPiece.shape.map((row) => row[i]).reverse()
  );

  const rotatedPiece = {
    ...currentPiece,
    shape: newShape,
  };

  if (!collides(rotatedPiece, 0, 0)) {
    currentPiece.shape = newShape;
  }
}

function gameOver() {
  isGameOver = true;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOverModal").classList.remove("hidden");
  drawSound.play().catch(() => {});
}

function updateGame(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    dropPiece();
    dropCounter = 0;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPiece(currentPiece);

  if (!isGameOver) {
    requestAnimationFrame(updateGame);
  }
}

document.addEventListener("keydown", (e) => {
  if (isGameOver) return;

  switch (e.key) {
    case "ArrowLeft":
      if (!collides(currentPiece, -1, 0)) currentPiece.x--;
      break;
    case "ArrowRight":
      if (!collides(currentPiece, 1, 0)) currentPiece.x++;
      break;
    case "ArrowDown":
      if (!collides(currentPiece, 0, 1)) currentPiece.y++;
      break;
    case "ArrowUp":
      rotatePiece();
      break;
    case " ":
      while (!collides(currentPiece, 0, 1)) {
        currentPiece.y++;
      }
      dropPiece();
      break;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPiece(currentPiece);
});

document.getElementById("restartBtn").addEventListener("click", () => {
  document.getElementById("gameOverModal").classList.add("hidden");
  score = 0;
  linesCleared = 0;
  isGameOver = false;

  document.getElementById("score").textContent = score;
  document.getElementById("lines").textContent = linesCleared;

  initBoard();
  spawnPiece();
  requestAnimationFrame(updateGame);
});

// Iniciar el juego
initBoard();
spawnPiece();
requestAnimationFrame(updateGame);
