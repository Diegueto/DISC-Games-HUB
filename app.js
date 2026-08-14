let games = [];

let selectedGameIndex = 0;


/* =========================================
   CARGAR JUEGOS
========================================= */

async function loadGames() {

    try {

        const response =
            await fetch("data/games.json");

        if (!response.ok) {

            throw new Error(
                "No se pudo cargar games.json"
            );

        }

        const data =
            await response.json();

        games = data.projects;

        renderGames();

        selectGame(0);

    }

    catch (error) {

        console.error(
            "Error cargando los juegos:",
            error
        );

    }

}


/* =========================================
   RENDERIZAR TARJETAS
========================================= */

function renderGames() {

    const container =
        document.getElementById(
            "games-container"
        );

    container.innerHTML = "";

    document.getElementById(
        "game-count"
    ).textContent =
        `${games.length} juegos`;


    games.forEach((game, index) => {

        const card =
            document.createElement("article");

        card.className = "game-card";

        card.innerHTML = `

            <img
                class="game-card-image"
                src="${game.images[0]}"
                alt="${game.name}"
            >

            <div class="game-card-content">

                <h3 class="game-card-title">
                    ${game.name}
                </h3>

                <p class="game-card-description">
                    ${game.description}
                </p>

                <div class="game-card-meta">

                    <span>
                        ${game.engine}
                    </span>

                    <span>
                        ${game.platform}
                    </span>

                </div>

            </div>

        `;


        card.addEventListener(
            "click",
            () => selectGame(index)
        );


        container.appendChild(card);

    });

}


/* =========================================
   SELECCIONAR JUEGO
========================================= */

function selectGame(index) {

    if (!games[index]) {
        return;
    }

    selectedGameIndex = index;

    const game =
        games[index];


    /* Fondo */

    const heroBackground =
        document.querySelector(
            ".hero-background"
        );

    heroBackground.style.backgroundImage =
        `url("${game.images[0]}")`;


    /* Título */

    document.getElementById(
        "hero-title"
    ).textContent =
        game.name;


    /* Descripción */

    document.getElementById(
        "hero-description"
    ).textContent =
        game.description;


    /* Motor */

    document.getElementById(
        "hero-engine"
    ).textContent =
        game.engine;


    /* Plataforma */

    document.getElementById(
        "hero-platform"
    ).textContent =
        game.platform;


    /* Botón */

    const downloadButton =
        document.getElementById(
            "download-button"
        );


    if (game.link && game.link.trim() !== "") {

        downloadButton.href =
            game.link;

        downloadButton.classList.remove(
            "disabled"
        );

        downloadButton.textContent =
            "Descargar juego";

    }

    else {

        downloadButton.href = "#";

        downloadButton.classList.add(
            "disabled"
        );

        downloadButton.textContent =
            "Descarga próximamente";

    }

}


/* =========================================
   INICIAR
========================================= */

loadGames();