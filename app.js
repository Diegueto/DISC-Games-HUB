/* =========================================================
   DISC GAMES HUB
========================================================= */

let games = [];
let photos = [];
let currentGame = null;

/* CARGAR JUEGOS */
async function loadGames() {
    try {
        const response = await fetch("./data/games.json");
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        games = data.projects || [];
        if (games.length === 0) {
            console.warn("No se encontraron juegos en games.json.");
            return;
        }
        renderHomeGames();
        renderAllGames();
        initializeGotas();
        initializeFilters();
        selectGame(0);
    } catch (error) {
        console.error("No se pudieron cargar los juegos:", error);
    }
}

/* CARGAR FOTOS */
async function loadPhotos() {
    try {
        const response = await fetch("./data/photos.json");
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        photos = data.photos || [];
        renderPhotos();
        initializePhotoModal();
    } catch (error) {
        console.error("No se pudieron cargar las fotos:", error);
        renderEmptyPhotos();
    }
}

/* INICIO */
function renderHomeGames() {
    const container = document.getElementById("home-games-grid");
    const count = document.getElementById("home-game-count");
    container.innerHTML = "";
    games.forEach((game,index) => container.appendChild(createGameCard(game,index)));
    if (count) count.textContent = `${games.length} ${games.length === 1 ? "juego" : "juegos"}`;
}

/* TODOS LOS JUEGOS */
function renderAllGames(platform = "all") {
    const container = document.getElementById("all-games-grid");
    container.innerHTML = "";
    const filteredGames = platform === "all" ? games : games.filter(game => game.platform === platform);
    if (filteredGames.length === 0) {
        container.innerHTML = `<div class="empty-section"><span>🎮</span><h2>No hay juegos disponibles</h2><p>No encontramos juegos para esta plataforma.</p></div>`;
        return;
    }
    filteredGames.forEach(game => {
        const index = games.indexOf(game);
        container.appendChild(createGameCard(game,index));
    });
}

/* CREAR TARJETA */
function createGameCard(game,index) {
    const card = document.createElement("article");
    card.className = "game-card";
    const image = game.images && game.images.length > 0 ? game.images[0] : "";
    card.innerHTML = `<img class="game-card-image" src="${image}" alt="${game.name}"><div class="game-card-content"><h3 class="game-card-title">${game.name}</h3><p class="game-card-description">${game.description}</p><div class="game-card-meta"><span>${game.platform || "Plataforma"}</span><span>${game.engine || "Motor"}</span></div></div>`;
    card.addEventListener("click",() => showGameDetail(index));
    return card;
}

/* SELECCIONAR JUEGO */
function selectGame(index) {
    if (!games[index]) return;
    currentGame = games[index];
    updateHero(currentGame);
}

/* HERO */
function updateHero(game) {
    const background = document.getElementById("hero-background");
    const label = document.getElementById("hero-label");
    const title = document.getElementById("hero-title");
    const description = document.getElementById("hero-description");
    const meta = document.getElementById("hero-meta");
    const download = document.getElementById("hero-download");
    const image = game.images && game.images.length > 0 ? game.images[0] : "";
    background.style.backgroundImage = `url("${image}")`;
    label.textContent = game.gotas && game.gotas.enabled ? "🏆 G.O.T.A.S" : "JUEGO DESTACADO";
    title.textContent = game.name;
    description.textContent = game.description;
    meta.innerHTML = `<span>${game.platform || "Plataforma"}</span><span>${game.engine || "Motor"}</span><span>${game.semester || "Semestre"}</span>`;
    if (game.link && game.link.trim() !== "") {
        download.href = game.link;
        download.classList.remove("disabled");
        download.textContent = "Descargar juego";
    } else {
        download.href = "#";
        download.classList.add("disabled");
        download.textContent = "Descarga próximamente";
    }
}

/* FILTROS DE JUEGOS */
function initializeFilters() {
    const filters = document.querySelectorAll(".filter-button");
    filters.forEach(button => {
        button.addEventListener("click",() => {
            filters.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            renderAllGames(button.dataset.platform);
        });
    });
}

/* FICHA DEL JUEGO */
function showGameDetail(index) {
    const game = games[index];
    if (!game) return;
    currentGame = game;
    document.getElementById("detail-title").textContent = game.name;
    document.getElementById("detail-description").textContent = game.description;
    document.getElementById("detail-engine").textContent = game.engine || "Por definir";
    document.getElementById("detail-platform").textContent = game.platform || "Por definir";
    document.getElementById("detail-version").textContent = game.version || "Por definir";
    document.getElementById("detail-semester").textContent = game.semester || "Por definir";
    document.getElementById("detail-size").textContent = game.size || "Por definir";
    renderGameGallery(game);
    renderGameAuthors(game);
    updateDownloadButton(game);
    showView("game-detail");
}

/* GALERÍA DEL JUEGO */
function renderGameGallery(game) {
    const mainImage = document.getElementById("detail-main-image");
    const thumbnails = document.getElementById("gallery-thumbnails");
    thumbnails.innerHTML = "";
    if (!game.images || game.images.length === 0) {
        mainImage.src = "";
        mainImage.alt = game.name;
        return;
    }
    mainImage.src = game.images[0];
    mainImage.alt = game.name;
    game.images.forEach((image,index) => {
        const thumbnail = document.createElement("img");
        thumbnail.src = image;
        thumbnail.alt = `${game.name} imagen ${index + 1}`;
        thumbnail.className = "gallery-thumbnail";
        if (index === 0) thumbnail.classList.add("active");
        thumbnail.addEventListener("click",() => {
            mainImage.src = image;
            document.querySelectorAll(".gallery-thumbnail").forEach(item => item.classList.remove("active"));
            thumbnail.classList.add("active");
        });
        thumbnails.appendChild(thumbnail);
    });
}

/* AUTORES */
function renderGameAuthors(game) {
    const container = document.getElementById("detail-authors");
    container.innerHTML = "";
    if (!game.authors || game.authors.length === 0) {
        container.innerHTML = `<span class="author">Información no disponible</span>`;
        return;
    }
    game.authors.forEach(author => {
        const element = document.createElement("span");
        element.className = "author";
        element.textContent = author;
        container.appendChild(element);
    });
}

/* DESCARGA */
function updateDownloadButton(game) {
    const button = document.getElementById("detail-download-button");
    if (game.link && game.link.trim() !== "") {
        button.href = game.link;
        button.classList.remove("disabled");
        button.textContent = "↓ Descargar juego";
    } else {
        button.href = "#";
        button.classList.add("disabled");
        button.textContent = "Descarga próximamente";
    }
}

/* G.O.T.A.S */
function initializeGotas() {
    const semesterSelect = document.getElementById("gotas-semester");
    if (!semesterSelect) return;
    const gotasGames = games.filter(game => game.gotas && game.gotas.enabled === true && game.gotas.semester);
    semesterSelect.innerHTML = "";
    if (gotasGames.length === 0) {
        renderEmptyGotas();
        return;
    }
    const semesters = [...new Set(gotasGames.map(game => game.gotas.semester))];
    semesters.sort().reverse();
    semesters.forEach(semester => {
        const option = document.createElement("option");
        option.value = semester;
        option.textContent = semester;
        semesterSelect.appendChild(option);
    });
    semesterSelect.addEventListener("change",() => renderGotas(semesterSelect.value));
    renderGotas(semesters[0]);
}

/* MOSTRAR G.O.T.A.S */
function renderGotas(semester) {
    const winner = games.find(game => game.gotas && game.gotas.enabled === true && game.gotas.semester === semester);
    renderGotasWinner(winner,semester);
}

/* GANADOR G.O.T.A.S */
function renderGotasWinner(game,semester) {
    const container = document.getElementById("gotas-winner");
    container.innerHTML = "";
    if (!game) {
        container.innerHTML = `<div class="gotas-empty"><span class="gotas-empty-icon">🏆</span><h2>Aún no hay ganador</h2><p>Este semestre todavía no tiene un G.O.T.A.S.</p></div>`;
        return;
    }
    const authors = game.authors && game.authors.length > 0 ? game.authors.map(author => `<span class="gotas-author">${author}</span>`).join(" · ") : "Autores no disponibles";
    const image = game.images && game.images.length > 0 ? game.images[0] : "";
    container.innerHTML = `<div class="gotas-winner-image"><img src="${image}" alt="${game.name}"></div><div class="gotas-winner-info"><span class="gotas-trophy">🏆</span><span class="gotas-position">GANADOR G.O.T.A.S</span><h2>${game.name}</h2><span class="gotas-semester-label">Semestre ${semester}</span><div class="gotas-authors">${authors}</div><button class="gotas-winner-button" id="gotas-view-game">Ver juego →</button></div>`;
    document.getElementById("gotas-view-game").addEventListener("click",() => showGameDetail(games.indexOf(game)));
}

/* SIN G.O.T.A.S */
function renderEmptyGotas() {
    const container = document.getElementById("gotas-winner");
    container.innerHTML = `<div class="gotas-empty"><span class="gotas-empty-icon">🏆</span><h2>Aún no hay G.O.T.A.S</h2><p>Los reconocimientos aparecerán aquí cuando sean publicados.</p></div>`;
}

/* FOTOS */
function renderPhotos(semester = "all") {
    const container = document.getElementById("photos-grid");
    const filters = document.getElementById("photo-filters");
    container.innerHTML = "";
    filters.innerHTML = "";

    if (photos.length === 0) {
        renderEmptyPhotos();
        return;
    }

    const semesters = [...new Set(photos.map(photo => photo.semester).filter(Boolean))];
    const allButton = document.createElement("button");
    allButton.className = `photo-filter-button ${semester === "all" ? "active" : ""}`;
    allButton.textContent = "Todos";
    allButton.dataset.semester = "all";
    filters.appendChild(allButton);

    semesters.sort().reverse().forEach(item => {
        const button = document.createElement("button");
        button.className = `photo-filter-button ${semester === item ? "active" : ""}`;
        button.textContent = item;
        button.dataset.semester = item;
        filters.appendChild(button);
    });

    filters.querySelectorAll(".photo-filter-button").forEach(button => {
        button.addEventListener("click",() => renderPhotos(button.dataset.semester));
    });

    const filteredPhotos = semester === "all" ? photos : photos.filter(photo => photo.semester === semester);

    if (filteredPhotos.length === 0) {
        renderEmptyPhotos();
        return;
    }

    filteredPhotos.forEach(photo => {
        const card = document.createElement("article");
        card.className = "photo-card";
        card.innerHTML = `<img src="${photo.image}" alt="${photo.title || "Foto del curso"}"><div class="photo-card-overlay"><h3 class="photo-card-title">${photo.title || "Foto del curso"}</h3><span class="photo-card-semester">${photo.semester || ""}</span></div>`;
        card.addEventListener("click",() => openPhotoModal(photo));
        container.appendChild(card);
    });
}

/* FOTO VACÍA */
function renderEmptyPhotos() {
    const container = document.getElementById("photos-grid");
    if (!container) return;
    container.innerHTML = `<div class="photos-empty"><span class="photos-empty-icon">📸</span><h2>Aún no hay fotografías</h2><p>Las fotografías del curso aparecerán aquí.</p></div>`;
}

/* MODAL DE FOTOS */
function initializePhotoModal() {
    const modal = document.getElementById("photo-modal");
    const closeButton = document.getElementById("photo-modal-close");
    const backdrop = document.getElementById("photo-modal-backdrop");

    closeButton.addEventListener("click",closePhotoModal);
    backdrop.addEventListener("click",closePhotoModal);

    document.addEventListener("keydown",event => {
        if (event.key === "Escape" && modal.classList.contains("active")) {
            closePhotoModal();
        }
    });
}

/* ABRIR FOTO */
function openPhotoModal(photo) {
    const modal = document.getElementById("photo-modal");
    const image = document.getElementById("photo-modal-image");
    const semester = document.getElementById("photo-modal-semester");
    const title = document.getElementById("photo-modal-title");
    const description = document.getElementById("photo-modal-description");

    image.src = photo.image;
    image.alt = photo.title || "Foto del curso";
    semester.textContent = photo.semester || "";
    title.textContent = photo.title || "Foto del curso";
    description.textContent = photo.description || "";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

/* CERRAR FOTO */
function closePhotoModal() {
    const modal = document.getElementById("photo-modal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
}

/* NAVEGACIÓN */
function showView(viewName) {
    document.querySelectorAll(".view").forEach(view => view.classList.remove("active-view"));
    document.querySelectorAll(".nav-button").forEach(button => button.classList.remove("active"));
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.add("active-view");
    const activeButton = document.querySelector(`.nav-button[data-view="${viewName}"]`);
    if (activeButton) activeButton.classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
}

/* INICIALIZAR NAVEGACIÓN */
function initializeNavigation() {
    document.querySelectorAll(".nav-button").forEach(button => {
        button.addEventListener("click",() => showView(button.dataset.view));
    });

    const logo = document.getElementById("logo-button");
    if (logo) logo.addEventListener("click",() => showView("home"));

    const backButton = document.getElementById("back-to-games");
    if (backButton) backButton.addEventListener("click",() => showView("games"));
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded",() => {
    initializeNavigation();
    loadGames();
    loadPhotos();
});