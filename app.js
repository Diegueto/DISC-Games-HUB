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


        renderHomeGames();

        renderAllGames();

        selectGame(0);


    } catch (error) {

        console.error(
            "Error cargando los juegos:",
            error
        );

    }

}



/* =========================================
   TARJETAS DEL INICIO
========================================= */

function renderHomeGames() {

    const container =
        document.getElementById(
            "home-games-container"
        );


    container.innerHTML = "";


    document.getElementById(
        "game-count"
    ).textContent =
        `${games.length} juegos`;


    games.forEach(
        (game, index) => {

            const card =
                createGameCard(
                    game,
                    index
                );


            container.appendChild(card);

        }
    );

}



/* =========================================
   TODOS LOS JUEGOS
========================================= */

function renderAllGames(
    filter = "all"
) {

    const container =
        document.getElementById(
            "all-games-container"
        );


    container.innerHTML = "";


    const filteredGames =
        games.filter(
            game => {

                if (
                    filter === "all"
                ) {
                    return true;
                }


                return game.platform
                    .toLowerCase()
                    .includes(
                        filter.toLowerCase()
                    );

            }
        );


    filteredGames.forEach(
        game => {

            const index =
                games.indexOf(game);


            const card =
                createGameCard(
                    game,
                    index
                );


            container.appendChild(card);

        }
    );

}



/* =========================================
   CREAR TARJETA
========================================= */

function createGameCard(
    game,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "game-card";


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
        () => {

            showGameDetail(index);

        }
    );


    return card;

}



/* =========================================
   SELECCIONAR JUEGO
========================================= */

function selectGame(index) {

    if (!games[index]) {
        return;
    }


    selectedGameIndex =
        index;


    const game =
        games[index];


    const heroBackground =
        document.querySelector(
            ".hero-background"
        );


    heroBackground.style.backgroundImage =
        `url("${game.images[0]}")`;


    document.getElementById(
        "hero-title"
    ).textContent =
        game.name;


    document.getElementById(
        "hero-description"
    ).textContent =
        game.description;


    document.getElementById(
        "hero-engine"
    ).textContent =
        game.engine;


    document.getElementById(
        "hero-platform"
    ).textContent =
        game.platform;

    document.getElementById(
        "detail-version"
    ).textContent =
        game.version || "Por definir";


    document.getElementById(
        "detail-semester"
    ).textContent =
        game.semester || "Por definir";


    document.getElementById(
        "detail-size"
    ).textContent =
        game.size || "Por definir";
    

    const downloadButton =
        document.getElementById(
            "download-button"
        );


    if (
        game.link &&
        game.link.trim() !== ""
    ) {

        downloadButton.href =
            game.link;


        downloadButton.classList.remove(
            "disabled"
        );


        downloadButton.textContent =
            "Descargar juego";

    } else {

        downloadButton.href =
            "#";


        downloadButton.classList.add(
            "disabled"
        );


        downloadButton.textContent =
            "Descarga próximamente";

    }

}

/* =========================================
   DETALLE DEL JUEGO
========================================= */

function showGameDetail(index) {


    const game =
        games[index];


    if (!game) {
        return;
    }


    /* Título */

    document.getElementById(
        "detail-title"
    ).textContent =
        game.name;


    /* Descripción */

    document.getElementById(
        "detail-description"
    ).textContent =
        game.description;


    /* Motor */

    document.getElementById(
        "detail-engine"
    ).textContent =
        game.engine;


    /* Plataforma */

    document.getElementById(
        "detail-platform"
    ).textContent =
        game.platform;


    /* =====================================
       IMAGEN PRINCIPAL
    ====================================== */

    const mainImage =
        document.getElementById(
            "detail-main-image"
        );


    mainImage.src =
        game.images[0];


    mainImage.alt =
        game.name;


    /* =====================================
       MINIATURAS
    ====================================== */

    const thumbnails =
        document.getElementById(
            "gallery-thumbnails"
        );


    thumbnails.innerHTML = "";


    game.images.forEach(
        (image, imageIndex) => {

            const thumbnail =
                document.createElement(
                    "img"
                );


            thumbnail.src =
                image;


            thumbnail.alt =
                `${game.name} imagen ${imageIndex + 1}`;


            thumbnail.className =
                "gallery-thumbnail";


            if (imageIndex === 0) {

                thumbnail.classList.add(
                    "active"
                );

            }


            thumbnail.addEventListener(
                "click",
                () => {

                    mainImage.src =
                        image;


                    document
                        .querySelectorAll(
                            ".gallery-thumbnail"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    thumbnail.classList.add(
                        "active"
                    );

                }
            );


            thumbnails.appendChild(
                thumbnail
            );

        }
    );


    /* =====================================
       AUTORES
    ====================================== */

    const authors =
        document.getElementById(
            "detail-authors"
        );


    authors.innerHTML = "";


    game.authors.forEach(
        author => {

            const element =
                document.createElement(
                    "span"
                );


            element.className =
                "author";


            element.textContent =
                author;


            authors.appendChild(
                element
            );

        }
    );


    /* =====================================
       DESCARGA
    ====================================== */

    const downloadButton =
        document.getElementById(
            "detail-download-button"
        );


    if (
        game.link &&
        game.link.trim() !== ""
    ) {

        downloadButton.href =
            game.link;


        downloadButton.classList.remove(
            "disabled"
        );


        downloadButton.textContent =
            "Descargar juego";

    } else {

        downloadButton.href =
            "#";


        downloadButton.classList.add(
            "disabled"
        );


        downloadButton.textContent =
            "Descarga próximamente";

    }


    /* =====================================
       MOSTRAR VISTA
    ====================================== */

    showView(
        "game-detail"
    );

}

/* =========================================
   NAVEGACIÓN
========================================= */

function showView(
    viewName
) {

    const views =
        document.querySelectorAll(
            ".view"
        );


    views.forEach(
        view => {

            view.classList.remove(
                "active-view"
            );

        }
    );


    const selectedView =
        document.getElementById(
            `view-${viewName}`
        );


    if (selectedView) {

        selectedView.classList.add(
            "active-view"
        );

    }


    const navButtons =
        document.querySelectorAll(
            ".nav-button"
        );


    navButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.view ===
                viewName
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



/* =========================================
   EVENTOS DE NAVEGACIÓN
========================================= */

document
    .querySelectorAll(
        "[data-view]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showView(
                        button.dataset.view
                    );

                }
            );

        }
    );



/* =========================================
   FILTROS
========================================= */

document
    .querySelectorAll(
        ".filter-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".filter-button"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    renderAllGames(
                        button.dataset.filter
                    );

                }
            );

        }
    );


document
    .getElementById("back-to-games")
    .addEventListener(
        "click",
        () => {

            showView("games");

        }
    );



/* =========================================
   INICIAR
========================================= */

loadGames();