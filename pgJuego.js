fetch("games.json")
  .then((res) => res.json())
  .then((games) => {
    const grid = document.getElementById("game-grid");

    games.forEach((game) => {
      const card = document.createElement("div");
      card.className = "game-card";

      card.innerHTML = `
        <img src="${game.thumbnail}" alt="${game.title}" />
        <h3>${game.title}</h3>
        <button class="play-button">Jugar</button>
      `;

      card.querySelector(".play-button").onclick = (e) => {
        e.stopPropagation(); // evita que se dispare el click del card
        window.open(game.path, "_blank");
      };

      grid.appendChild(card);
    });
  });
