document.addEventListener("DOMContentLoaded", function () {
  // Elementos
  const hangmanParts = document.querySelectorAll(".body-part");
  const guessForm = document.getElementById("guessForm");
  const letterInput = document.getElementById("letterInput");
  const wordToGuessElement = document.getElementById("wordToGuess");
  const hintElement = document.getElementById("hint");

  const endMenu = document.getElementById("endMenu");
  const endMessage = document.getElementById("endMessage");
  const finalWord = document.getElementById("finalWord");
  const restartBtn = document.getElementById("restartBtn");
  // Sonidos
  const winSound = new Audio("sonidos/win.mp3");
  const drawSound = new Audio("sonidos/draw.mp3");

  // Palabras con pistas
  const words = [
    { word: "futbol", hint: "Deporte más popular del mundo" },
    { word: "egipto", hint: "Civilización famosa por sus pirámides" },
    { word: "oxigeno", hint: "Gas esencial para respirar" },
    { word: "amazonas", hint: "Río más caudaloso del mundo" },
    { word: "murcielago", hint: "Único mamífero que vuela" },
    { word: "coliseo", hint: "Monumento romano en Italia" },
    { word: "leon", hint: "Animal conocido como el rey de la selva" },
    { word: "atlantico", hint: "Océano que separa América de Europa" },
    { word: "pintura", hint: "Arte que se hace con pinceles y colores" },
    { word: "volcan", hint: "Montaña que expulsa lava" },
    { word: "cerebro", hint: "Órgano principal del sistema nervioso" },
    { word: "quimica", hint: "Ciencia que estudia la materia" },
    { word: "guitarra", hint: "Instrumento musical de cuerdas" },
    { word: "colon", hint: "Explorador que llegó a América en 1492" },
    { word: "everest", hint: "Montaña más alta del mundo" },
  ];

  // Variables
  let wordToGuess = "";
  let guessedLetters = [];
  const maxIncorrectGuesses = hangmanParts.length;
  let incorrectGuesses = 0;

  // Escoger palabra
  function chooseWord() {
    const randomObj = words[Math.floor(Math.random() * words.length)];
    wordToGuess = randomObj.word;
    hintElement.textContent = "Pista: " + randomObj.hint;
    guessedLetters = [];
    incorrectGuesses = 0;
    resetHangman();
    renderWordToGuess();
  }

  // Mostrar palabra con guiones
  function renderWordToGuess() {
    wordToGuessElement.textContent = wordToGuess
      .split("")
      .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
      .join(" ");
  }

  // Resetear dibujo
  function resetHangman() {
    hangmanParts.forEach((part) => {
      part.style.opacity = 0;
      part.style.animation = "none";
    });
  }

  // Mostrar parte del ahorcado
  function revealHangmanPart() {
    if (incorrectGuesses < maxIncorrectGuesses) {
      hangmanParts[incorrectGuesses].style.opacity = 1;
      hangmanParts[incorrectGuesses].style.animation =
        "reveal 0.5s ease-in-out";
      incorrectGuesses++;
    }
  }

  // Mostrar menú de final
  function showEndMenu(win) {
    endMenu.classList.remove("hidden");
    if (win) {
      winSound.currentTime = 0; // Reinicia el audio
      winSound.play(); // ▶️ Reproduce sonido de victoria
      endMessage.textContent = "🎉 ¡Ganaste!";
      finalWord.textContent = "La palabra era: " + wordToGuess;
    } else {
      drawSound.currentTime = 0; // Reinicia el audio
      drawSound.play(); // ▶️ Reproduce sonido de derrota
      endMessage.textContent = "😢 ¡Perdiste!";
      finalWord.textContent = "La palabra era: " + wordToGuess;
    }
  }

  // Adivinar letra
  function handleGuess(event) {
    event.preventDefault();
    const guessedLetter = letterInput.value.toLowerCase();

    if (!guessedLetter.match(/[a-zñ]/i)) {
      letterInput.value = "";
      return; // Solo letras válidas
    }

    if (!wordToGuess.includes(guessedLetter)) {
      revealHangmanPart();
      if (incorrectGuesses === maxIncorrectGuesses) {
        setTimeout(() => showEndMenu(false), 500);
      }
    } else {
      if (!guessedLetters.includes(guessedLetter)) {
        guessedLetters.push(guessedLetter);
      }
    }

    renderWordToGuess();

    if (!wordToGuess.split("").some((l) => !guessedLetters.includes(l))) {
      setTimeout(() => showEndMenu(true), 500);
    }

    letterInput.value = "";
  }

  // Eventos
  guessForm.addEventListener("submit", handleGuess);

  restartBtn.addEventListener("click", () => {
    endMenu.classList.add("hidden");
    chooseWord();
  });

  // Iniciar
  chooseWord();
});
