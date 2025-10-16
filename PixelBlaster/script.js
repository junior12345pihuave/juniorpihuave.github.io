const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔊 Sonidos
const drawSound = new Audio("sonidos/draw.mp3");
const shootSound = new Audio("sonidos/shoot.mp3");

canvas.width = 360; // 🔹 Más pequeño
canvas.height = 480;

let gameRunning = false;
let score = 0;
let lives = 3; // 🔹 3 vidas en forma de corazones
let bullets = [];
let enemies = [];
let keys = {};
let player;

// 🔹 Recuperar puntaje máximo guardado
let highScore = localStorage.getItem("highScore")
  ? parseInt(localStorage.getItem("highScore"))
  : 0;

// ====== CLASES ======
class Player {
  constructor() {
    this.x = canvas.width / 2 - 15;
    this.y = canvas.height - 60;
    this.size = 30;
    this.speed = 5;
  }
  draw() {
    ctx.fillStyle = "#0ff";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
  move() {
    if (keys["ArrowLeft"] && this.x > 0) this.x -= this.speed;
    if (keys["ArrowRight"] && this.x + this.size < canvas.width)
      this.x += this.speed;
    if (keys["ArrowUp"] && this.y > 0) this.y -= this.speed;
    if (keys["ArrowDown"] && this.y + this.size < canvas.height)
      this.y += this.speed;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 5;
    this.speed = 7;
  }
  draw() {
    ctx.fillStyle = "#ff0";
    ctx.fillRect(this.x, this.y, this.size, this.size * 2);
  }
  update() {
    this.y -= this.speed;
  }
}

class Enemy {
  constructor() {
    this.size = 20 + Math.random() * 15;
    this.x = Math.random() * (canvas.width - this.size);
    this.y = -this.size;
    this.speed = 1 + Math.random() * 2;
    this.shape = ["circle", "square", "triangle"][
      Math.floor(Math.random() * 3)
    ];
    this.color = ["#f00", "#0f0", "#f0f", "#0ff", "#ff8800"][
      Math.floor(Math.random() * 5)
    ];
  }
  draw() {
    ctx.fillStyle = this.color;
    if (this.shape === "circle") {
      ctx.beginPath();
      ctx.arc(
        this.x + this.size / 2,
        this.y + this.size / 2,
        this.size / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else if (this.shape === "square") {
      ctx.fillRect(this.x, this.y, this.size, this.size);
    } else if (this.shape === "triangle") {
      ctx.beginPath();
      ctx.moveTo(this.x + this.size / 2, this.y);
      ctx.lineTo(this.x, this.y + this.size);
      ctx.lineTo(this.x + this.size, this.y + this.size);
      ctx.closePath();
      ctx.fill();
    }
  }
  update() {
    this.y += this.speed;
  }
}

// ====== JUEGO ======
function startGame() {
  document.getElementById("menu").classList.remove("active");
  document.getElementById("gameOver").classList.remove("active");
  score = 0;
  lives = 3; // 🔹 Reinicia vidas
  bullets = [];
  enemies = [];
  player = new Player();
  gameRunning = true;
  gameLoop();
}

function gameOver() {
  gameRunning = false;

  let msg = `Puntaje final: ${score}`;

  // 🔹 Guardar récord
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    msg += "\n🎉 ¡Nuevo récord!";
  }

  // 🔊 Reproducir sonido de derrota
  drawSound.currentTime = 0;
  drawSound.play().catch((err) => console.log("Error de audio:", err));

  document.getElementById("finalScore").innerText = msg;
  document.getElementById("gameOver").classList.add("active");
}

function spawnEnemy() {
  if (Math.random() < 0.03) {
    enemies.push(new Enemy());
  }
}

function handleCollisions() {
  // Balas vs Enemigos
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (
        b.x < e.x + e.size &&
        b.x + b.size > e.x &&
        b.y < e.y + e.size &&
        b.y + b.size * 2 > e.y
      ) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score += 10;
      }
    });
  });

  // Enemigos vs Jugador
  enemies.forEach((e, ei) => {
    if (
      player.x < e.x + e.size &&
      player.x + player.size > e.x &&
      player.y < e.y + e.size &&
      player.y + player.size > e.y
    ) {
      enemies.splice(ei, 1); // 🔹 Elimina enemigo que tocó
      lives--; // 🔹 Pierde una vida
      if (lives <= 0) {
        gameOver();
      }
    }
  });

  // Enemigos que pasan
  enemies.forEach((e, i) => {
    if (e.y > canvas.height) {
      enemies.splice(i, 1);
      lives--; // 🔹 Pierde una vida si se escapa
      if (lives <= 0) {
        gameOver();
      }
    }
  });
}

function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText(`Puntaje: ${score}`, 10, 20);
  ctx.fillText(`Mejor puntaje: ${highScore}`, 10, 45);

  // 🔹 Dibujar corazones llenos y vacíos
  for (let i = 0; i < 3; i++) {
    if (i < lives) {
      ctx.fillText("❤️", canvas.width - 90 + i * 25, 20); // Vida llena
    } else {
      ctx.fillText("🖤", canvas.width - 90 + i * 25, 20); // Vida perdida
    }
  }
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.move();
  player.draw();

  bullets.forEach((b, i) => {
    b.update();
    b.draw();
    if (b.y < 0) bullets.splice(i, 1);
  });

  enemies.forEach((e) => {
    e.update();
    e.draw();
  });

  handleCollisions();
  drawHUD();
  spawnEnemy();

  requestAnimationFrame(gameLoop);
}

// ====== EVENTOS ======
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    bullets.push(new Bullet(player.x + player.size / 2 - 2, player.y));

    // 🔊 Reproducir sonido de disparo
    shootSound.currentTime = 0;
    shootSound.play().catch((err) => console.log("Error de audio:", err));
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

document
  .getElementById("startBtn")
  .addEventListener("click", () => startGame());
document
  .getElementById("restartBtn")
  .addEventListener("click", () => startGame());

// Mostrar menú al inicio
document.getElementById("menu").classList.add("active");
