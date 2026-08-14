/* =========================================================
   DISC GAMES HUB
========================================================= */

let games=[];
let photos=[];
let videos=[];
let currentGame=null;

/* CARGAR JUEGOS */
async function loadGames(){
    try{
        const response=await fetch("./data/games.json");
        if(!response.ok)throw new Error(`Error HTTP: ${response.status}`);
        const data=await response.json();
        games=data.projects||[];
        if(games.length===0)return;
        renderHomeGames();
        renderAllGames();
        initializeGotas();
        initializeFilters();
        selectGame(0);
    }catch(error){
        console.error("No se pudieron cargar los juegos:",error);
    }
}

/* CARGAR FOTOS */
async function loadPhotos(){
    try{
        const response=await fetch("./data/photos.json");
        if(!response.ok)throw new Error(`Error HTTP: ${response.status}`);
        const data=await response.json();
        photos=data.photos||[];
        renderPhotos();
        initializePhotoModal();
    }catch(error){
        console.error("No se pudieron cargar las fotos:",error);
        renderEmptyPhotos();
    }
}

/* CARGAR VIDEOS */
async function loadVideos(){
    try{
        const response=await fetch("./data/videos.json");
        if(!response.ok)throw new Error(`Error HTTP: ${response.status}`);
        const data=await response.json();
        videos=data.videos||[];
        renderVideos();
        initializeVideoModal();
    }catch(error){
        console.error("No se pudieron cargar los videos:",error);
        renderEmptyVideos();
    }
}

/* INICIO */
function renderHomeGames(){
    const container=document.getElementById("home-games-grid");
    const count=document.getElementById("home-game-count");
    container.innerHTML="";
    games.forEach((game,index)=>container.appendChild(createGameCard(game,index)));
    if(count)count.textContent=`${games.length} ${games.length===1?"juego":"juegos"}`;
}

/* TODOS LOS JUEGOS */
function renderAllGames(career="all",subject="all",platform="all"){
    const container=document.getElementById("all-games-grid");
    if(!container)return;
    const filteredGames=games.filter(game=>(career==="all"||game.career===career)&&(subject==="all"||game.subject===subject)&&(platform==="all"||game.platform===platform));
    container.innerHTML="";
    if(filteredGames.length===0){
        container.innerHTML=`<div class="empty-section"><span>🎮</span><h2>No hay juegos disponibles</h2><p>No encontramos juegos con los filtros seleccionados.</p></div>`;
        return;
    }
    filteredGames.forEach(game=>{
        const index=games.indexOf(game);
        container.appendChild(createGameCard(game,index));
    });
}

/* CREAR TARJETA */
function createGameCard(game,index){
    const card=document.createElement("article");
    card.className="game-card";
    const image=game.images&&game.images.length>0?game.images[0]:"";
    card.innerHTML=`<img class="game-card-image" src="${image}" alt="${game.name}"><div class="game-card-content"><h3 class="game-card-title">${game.name}</h3><p class="game-card-description">${game.description}</p><div class="game-card-meta"><span>${game.platform||"Plataforma"}</span><span>${game.engine||"Motor"}</span></div></div>`;
    card.addEventListener("click",()=>showGameDetail(index));
    return card;
}

/* SELECCIONAR JUEGO */
function selectGame(index){
    if(!games[index])return;
    currentGame=games[index];
    updateHero(currentGame);
}

/* HERO */
function updateHero(game){
    const background=document.getElementById("hero-background");
    const label=document.getElementById("hero-label");
    const title=document.getElementById("hero-title");
    const description=document.getElementById("hero-description");
    const meta=document.getElementById("hero-meta");
    const download=document.getElementById("hero-download");
    const image=game.images&&game.images.length>0?game.images[0]:"";
    background.style.backgroundImage=`url("${image}")`;
    label.textContent=game.gotas&&game.gotas.enabled?"🏆 G.O.T.A.S":"JUEGO DESTACADO";
    title.textContent=game.name;
    description.textContent=game.description;
    meta.innerHTML=`<span>${game.platform||"Plataforma"}</span><span>${game.engine||"Motor"}</span><span>${game.semester||"Semestre"}</span>`;
    if(game.link&&game.link.trim()!==""){
        download.href=game.link;
        download.classList.remove("disabled");
        download.textContent="Descargar juego";
    }else{
        download.href="#";
        download.classList.add("disabled");
        download.textContent="Descarga próximamente";
    }
}

/* FILTROS INTELIGENTES */
function initializeFilters(){
    const careerFilter=document.getElementById("career-filter");
    const subjectFilter=document.getElementById("subject-filter");
    const platformFilter=document.getElementById("platform-filter");
    if(!careerFilter||!subjectFilter||!platformFilter)return;
    const populateFilter=(select,values,defaultText,currentValue="all")=>{
        select.innerHTML=`<option value="all">${defaultText}</option>`;
        [...new Set(values.filter(Boolean))].sort().forEach(value=>{
            const option=document.createElement("option");
            option.value=value;
            option.textContent=value;
            select.appendChild(option);
        });
        if([...select.options].some(option=>option.value===currentValue))select.value=currentValue;
        else select.value="all";
    };
    const updateFilters=()=>{
        const career=careerFilter.value;
        const subject=subjectFilter.value;
        const platform=platformFilter.value;
        let availableGames=games;
        if(career!=="all")availableGames=availableGames.filter(game=>game.career===career);
        if(subject!=="all")availableGames=availableGames.filter(game=>game.subject===subject);
        populateFilter(subjectFilter,availableGames.map(game=>game.subject),"Todas las asignaturas",subject);
        availableGames=games;
        if(career!=="all")availableGames=availableGames.filter(game=>game.career===career);
        if(subject!=="all")availableGames=availableGames.filter(game=>game.subject===subject);
        populateFilter(platformFilter,availableGames.map(game=>game.platform),"Todas las plataformas",platform);
        renderAllGames(career,subject,platform);
    };
    const careers=[...new Set(games.map(game=>game.career).filter(Boolean))].sort();
    populateFilter(careerFilter,careers,"Todas las carreras");
    populateFilter(subjectFilter,games.map(game=>game.subject),"Todas las asignaturas");
    populateFilter(platformFilter,games.map(game=>game.platform),"Todas las plataformas");
    careerFilter.addEventListener("change",()=>{
        subjectFilter.value="all";
        platformFilter.value="all";
        updateFilters();
    });
    subjectFilter.addEventListener("change",()=>{
        platformFilter.value="all";
        updateFilters();
    });
    platformFilter.addEventListener("change",updateFilters);
}

/* FICHA DEL JUEGO */
function showGameDetail(index){
    const game=games[index];
    if(!game)return;
    currentGame=game;
    document.getElementById("detail-title").textContent=game.name;
    document.getElementById("detail-description").textContent=game.description;
    document.getElementById("detail-engine").textContent=game.engine||"Por definir";
    document.getElementById("detail-platform").textContent=game.platform||"Por definir";
    document.getElementById("detail-version").textContent=game.version||"Por definir";
    document.getElementById("detail-semester").textContent=game.semester||"Por definir";
    document.getElementById("detail-size").textContent=game.size||"Por definir";
    renderGameGallery(game);
    renderGameAuthors(game);
    updateDownloadButton(game);
    showView("game-detail");
}

/* GALERÍA DEL JUEGO */
function renderGameGallery(game){
    const mainImage=document.getElementById("detail-main-image");
    const thumbnails=document.getElementById("gallery-thumbnails");
    thumbnails.innerHTML="";
    if(!game.images||game.images.length===0){
        mainImage.src="";
        mainImage.alt=game.name;
        return;
    }
    mainImage.src=game.images[0];
    mainImage.alt=game.name;
    game.images.forEach((image,index)=>{
        const thumbnail=document.createElement("img");
        thumbnail.src=image;
        thumbnail.alt=`${game.name} imagen ${index+1}`;
        thumbnail.className="gallery-thumbnail";
        if(index===0)thumbnail.classList.add("active");
        thumbnail.addEventListener("click",()=>{
            mainImage.src=image;
            document.querySelectorAll(".gallery-thumbnail").forEach(item=>item.classList.remove("active"));
            thumbnail.classList.add("active");
        });
        thumbnails.appendChild(thumbnail);
    });
}

/* AUTORES */
function renderGameAuthors(game){
    const container=document.getElementById("detail-authors");
    container.innerHTML="";
    if(!game.authors||game.authors.length===0){
        container.innerHTML=`<span class="author">Información no disponible</span>`;
        return;
    }
    game.authors.forEach(author=>{
        const element=document.createElement("span");
        element.className="author";
        element.textContent=author;
        container.appendChild(element);
    });
}

/* DESCARGA */
function updateDownloadButton(game){
    const button=document.getElementById("detail-download-button");
    if(game.link&&game.link.trim()!==""){
        button.href=game.link;
        button.classList.remove("disabled");
        button.textContent="↓ Descargar juego";
    }else{
        button.href="#";
        button.classList.add("disabled");
        button.textContent="Descarga próximamente";
    }
}

/* G.O.T.A.S */
function initializeGotas(){
    const semesterSelect=document.getElementById("gotas-semester");
    if(!semesterSelect)return;
    const gotasGames=games.filter(game=>game.gotas&&game.gotas.enabled===true&&game.gotas.semester);
    semesterSelect.innerHTML="";
    if(gotasGames.length===0){
        renderEmptyGotas();
        return;
    }
    const semesters=[...new Set(gotasGames.map(game=>game.gotas.semester))];
    semesters.sort().reverse();
    semesters.forEach(semester=>{
        const option=document.createElement("option");
        option.value=semester;
        option.textContent=semester;
        semesterSelect.appendChild(option);
    });
    semesterSelect.addEventListener("change",()=>renderGotas(semesterSelect.value));
    renderGotas(semesters[0]);
}

/* MOSTRAR G.O.T.A.S */
function renderGotas(semester){
    const winner=games.find(game=>game.gotas&&game.gotas.enabled===true&&game.gotas.semester===semester);
    renderGotasWinner(winner,semester);
}

/* GANADOR G.O.T.A.S */
function renderGotasWinner(game,semester){
    const container=document.getElementById("gotas-winner");
    container.innerHTML="";
    if(!game){
        container.innerHTML=`<div class="gotas-empty"><span class="gotas-empty-icon">🏆</span><h2>Aún no hay ganador</h2><p>Este semestre todavía no tiene un G.O.T.A.S.</p></div>`;
        return;
    }
    const authors=game.authors&&game.authors.length>0?game.authors.map(author=>`<span class="gotas-author">${author}</span>`).join(" · "):"Autores no disponibles";
    const image=game.images&&game.images.length>0?game.images[0]:"";
    container.innerHTML=`<div class="gotas-winner-image"><img src="${image}" alt="${game.name}"></div><div class="gotas-winner-info"><span class="gotas-trophy">🏆</span><span class="gotas-position">GANADOR G.O.T.A.S</span><h2>${game.name}</h2><span class="gotas-semester-label">Semestre ${semester}</span><div class="gotas-authors">${authors}</div><button class="gotas-winner-button" id="gotas-view-game">Ver juego →</button></div>`;
    document.getElementById("gotas-view-game").addEventListener("click",()=>showGameDetail(games.indexOf(game)));
}

/* SIN G.O.T.A.S */
function renderEmptyGotas(){
    const container=document.getElementById("gotas-winner");
    container.innerHTML=`<div class="gotas-empty"><span class="gotas-empty-icon">🏆</span><h2>Aún no hay G.O.T.A.S</h2><p>Los reconocimientos aparecerán aquí cuando sean publicados.</p></div>`;
}

/* FOTOS */
function renderPhotos(semester="all"){
    const container=document.getElementById("photos-grid");
    const filters=document.getElementById("photo-filters");
    container.innerHTML="";
    filters.innerHTML="";
    if(photos.length===0){
        renderEmptyPhotos();
        return;
    }
    const semesters=[...new Set(photos.map(photo=>photo.semester).filter(Boolean))];
    const allButton=document.createElement("button");
    allButton.className=`photo-filter-button ${semester==="all"?"active":""}`;
    allButton.textContent="Todos";
    allButton.dataset.semester="all";
    filters.appendChild(allButton);
    semesters.sort().reverse().forEach(item=>{
        const button=document.createElement("button");
        button.className=`photo-filter-button ${semester===item?"active":""}`;
        button.textContent=item;
        button.dataset.semester=item;
        filters.appendChild(button);
    });
    filters.querySelectorAll(".photo-filter-button").forEach(button=>button.addEventListener("click",()=>renderPhotos(button.dataset.semester)));
    const filteredPhotos=semester==="all"?photos:photos.filter(photo=>photo.semester===semester);
    if(filteredPhotos.length===0){
        renderEmptyPhotos();
        return;
    }
    filteredPhotos.forEach(photo=>{
        const card=document.createElement("article");
        card.className="photo-card";
        card.innerHTML=`<img src="${photo.image}" alt="${photo.title||"Foto del curso"}"><div class="photo-card-overlay"><h3 class="photo-card-title">${photo.title||"Foto del curso"}</h3><span class="photo-card-semester">${photo.semester||""}</span></div>`;
        card.addEventListener("click",()=>openPhotoModal(photo));
        container.appendChild(card);
    });
}

/* FOTO VACÍA */
function renderEmptyPhotos(){
    const container=document.getElementById("photos-grid");
    if(!container)return;
    container.innerHTML=`<div class="photos-empty"><span class="photos-empty-icon">📸</span><h2>Aún no hay fotografías</h2><p>Las fotografías del curso aparecerán aquí.</p></div>`;
}

/* MODAL DE FOTOS */
function initializePhotoModal(){
    const closeButton=document.getElementById("photo-modal-close");
    const backdrop=document.getElementById("photo-modal-backdrop");
    if(closeButton)closeButton.addEventListener("click",closePhotoModal);
    if(backdrop)backdrop.addEventListener("click",closePhotoModal);
}

/* ABRIR FOTO */
function openPhotoModal(photo){
    const modal=document.getElementById("photo-modal");
    document.getElementById("photo-modal-image").src=photo.image;
    document.getElementById("photo-modal-image").alt=photo.title||"Foto del curso";
    document.getElementById("photo-modal-semester").textContent=photo.semester||"";
    document.getElementById("photo-modal-title").textContent=photo.title||"Foto del curso";
    document.getElementById("photo-modal-description").textContent=photo.description||"";
    modal.classList.add("active");
    document.body.style.overflow="hidden";
}

/* CERRAR FOTO */
function closePhotoModal(){
    const modal=document.getElementById("photo-modal");
    modal.classList.remove("active");
    document.body.style.overflow="";
}

/* VIDEOS */
function renderVideos(semester="all"){
    const container=document.getElementById("videos-grid");
    const filters=document.getElementById("video-filters");
    container.innerHTML="";
    filters.innerHTML="";
    if(videos.length===0){
        renderEmptyVideos();
        return;
    }
    const semesters=[...new Set(videos.map(video=>video.semester).filter(Boolean))];
    const allButton=document.createElement("button");
    allButton.className=`video-filter-button ${semester==="all"?"active":""}`;
    allButton.textContent="Todos";
    allButton.dataset.semester="all";
    filters.appendChild(allButton);
    semesters.sort().reverse().forEach(item=>{
        const button=document.createElement("button");
        button.className=`video-filter-button ${semester===item?"active":""}`;
        button.textContent=item;
        button.dataset.semester=item;
        filters.appendChild(button);
    });
    filters.querySelectorAll(".video-filter-button").forEach(button=>button.addEventListener("click",()=>renderVideos(button.dataset.semester)));
    const filteredVideos=semester==="all"?videos:videos.filter(video=>video.semester===semester);
    if(filteredVideos.length===0){
        renderEmptyVideos();
        return;
    }
    filteredVideos.forEach(video=>{
        const card=document.createElement("article");
        card.className="video-card";
        card.innerHTML=`<div class="video-card-thumbnail"><img src="${video.thumbnail}" alt="${video.title||"Video del curso"}"><span class="video-play-icon">▶</span></div><div class="video-card-content"><h3 class="video-card-title">${video.title||"Video del curso"}</h3><p class="video-card-description">${video.description||""}</p><div class="video-card-meta"><span>${video.semester||"Sin semestre"}</span></div></div>`;
        card.addEventListener("click",()=>openVideoModal(video));
        container.appendChild(card);
    });
}

/* VIDEOS VACÍOS */
function renderEmptyVideos(){
    const container=document.getElementById("videos-grid");
    if(!container)return;
    container.innerHTML=`<div class="videos-empty"><span class="videos-empty-icon">🎬</span><h2>Aún no hay videos</h2><p>Los videos de la asignatura aparecerán aquí.</p></div>`;
}

/* MODAL DE VIDEOS */
function initializeVideoModal(){
    const closeButton=document.getElementById("video-modal-close");
    const backdrop=document.getElementById("video-modal-backdrop");
    if(closeButton)closeButton.addEventListener("click",closeVideoModal);
    if(backdrop)backdrop.addEventListener("click",closeVideoModal);
}

/* ABRIR VIDEO */
function openVideoModal(video){
    const modal=document.getElementById("video-modal");
    const player=document.getElementById("video-player-container");
    const url=video.url||"";
    player.innerHTML=getVideoEmbed(url);
    document.getElementById("video-modal-semester").textContent=video.semester||"";
    document.getElementById("video-modal-title").textContent=video.title||"Video del curso";
    document.getElementById("video-modal-description").textContent=video.description||"";
    modal.classList.add("active");
    document.body.style.overflow="hidden";
}

/* GENERAR REPRODUCTOR */
function getVideoEmbed(url){
    if(!url)return `<div class="videos-empty"><span class="videos-empty-icon">🎬</span><h2>Video no disponible</h2><p>No se ha configurado un enlace para este video.</p></div>`;
    if(url.includes("youtube.com/watch?v=")){
        const id=url.split("v=")[1].split("&")[0];
        return `<iframe src="https://www.youtube.com/embed/${id}" title="Video del curso" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share" allowfullscreen></iframe>`;
    }
    if(url.includes("youtu.be/")){
        const id=url.split("youtu.be/")[1].split("?")[0];
        return `<iframe src="https://www.youtube.com/embed/${id}" title="Video del curso" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share" allowfullscreen></iframe>`;
    }
    if(url.includes("drive.google.com")){
        const match=url.match(/\/d\/([^/]+)/);
        if(match)return `<iframe src="https://drive.google.com/file/d/${match[1]}/preview" title="Video del curso" allow="autoplay"></iframe>`;
    }
    return `<video controls src="${url}"></video>`;
}

/* CERRAR VIDEO */
function closeVideoModal(){
    const modal=document.getElementById("video-modal");
    const player=document.getElementById("video-player-container");
    modal.classList.remove("active");
    player.innerHTML="";
    document.body.style.overflow="";
}

/* NAVEGACIÓN */
function showView(viewName){
    document.querySelectorAll(".view").forEach(view=>view.classList.remove("active-view"));
    document.querySelectorAll(".nav-button").forEach(button=>button.classList.remove("active"));
    const targetView=document.getElementById(`view-${viewName}`);
    if(targetView)targetView.classList.add("active-view");
    const activeButton=document.querySelector(`.nav-button[data-view="${viewName}"]`);
    if(activeButton)activeButton.classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
}

/* INICIALIZAR NAVEGACIÓN */
function initializeNavigation(){
    document.querySelectorAll(".nav-button").forEach(button=>button.addEventListener("click",()=>showView(button.dataset.view)));
    const logo=document.getElementById("logo-button");
    if(logo)logo.addEventListener("click",()=>showView("home"));
    const backButton=document.getElementById("back-to-games");
    if(backButton)backButton.addEventListener("click",()=>showView("games"));
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded",()=>{
    initializeNavigation();
    loadGames();
    loadPhotos();
    loadVideos();
});