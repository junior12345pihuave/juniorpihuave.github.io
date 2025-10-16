const cells = document.querySelectorAll(".cell");
const statusMessage = document.getElementById("statusMessage");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modalText");

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;

// Sonidos
const winSound = new Audio("sonidos/win.mp3");
const drawSound = new Audio("sonidos/draw.mp3");

// Clic en celda
function cellClicked(index) {
  if (!gameOver && board[index] === "") {
    board[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    if (checkForWinner(currentPlayer)) {
      gameOver = true;
      winSound.play();
      showModal(`¡Jugador ${currentPlayer} gana!`);
    } else if (board.every((cell) => cell !== "")) {
      gameOver = true;
      drawSound.play();
      showModal("¡Empate!");
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      updateStatus(`Turno del jugador ${currentPlayer}`);
    }
  }
}

// Combinaciones ganadoras
function checkForWinner(player) {
  const combos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return combos.some((combo) => combo.every((i) => board[i] === player));
}

// Mostrar mensaje en modal
function showModal(message) {
  modalText.textContent = message;
  modal.classList.remove("hidden");
}

// Actualizar mensaje de estado
function updateStatus(message) {
  statusMessage.textContent = message;
}

// Cerrar modal
function closeModal() {
  modal.classList.add("hidden");
}

// Reiniciar
function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameOver = false;
  currentPlayer = "X";
  cells.forEach((cell) => (cell.textContent = ""));
  updateStatus(`Turno del jugador ${currentPlayer}`);
  closeModal();
}

updateStatus(`Turno del jugador ${currentPlayer}`);
