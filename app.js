/* =========================================================
   DISC GAMES HUB
========================================================= */

let games=[];
let photos=[];
let videos=[];
let arProjects=[];

let currentGame=null;
let currentPhotoAlbum=null;
let currentPhotoIndex=0;

/* CARGAR JUEGOS DESDE GOOGLE SHEETS */
async function loadGames(){
    const url="https://docs.google.com/spreadsheets/d/e/2PACX-1vTf7oacZeR0e_IOhGZsNrgmP-XjGB3Ns-zGRL-_XoA6bgQXJv6nJumqqBORcWBBawQnMRLe7sgfSzX5/pub?gid=0&single=true&output=csv";
    try{
        const response=await fetch(url);
        if(!response.ok)throw new Error(`Error HTTP: ${response.status}`);
        const csv=await response.text();
        games=parseCSV(csv).map(item=>({
            id:item.ID,
            name:item.Nombre,
            description:item.Descripción,
            subject:item.Asignatura,
            career:item.Carrera,
            category:item.Categoría,
            platform:item.Plataforma,
            engine:item.Motor,
            version:item.Versión,
            semester:item.Semestre,
            size:item.Tamaño,
            link:item.ID_Drive?`https://drive.google.com/uc?export=download&id=${item.ID_Drive}`:item.Descarga||"",
            images:item.Imágenes?item.Imágenes.split("|").map(value=>`assets/games/${item.ID}/${value.trim()}`).filter(Boolean):[],
            authors:item.Autores?item.Autores.split("|").map(value=>value.trim()).filter(Boolean):[],
            gotas:{enabled:String(item.GOTA).toLowerCase()==="true",semester:String(item.GOTA).toLowerCase()==="true"?item.Semestre:""}
        })).filter(game=>game.id);
        console.log("Juegos cargados desde Google Sheets:",games);
        renderHomeGames();
        renderAllGames();
        renderGotas();
        initializeFilters();
        initializeHeroGotas();
        if(games.length>0)selectGame(0);
    }catch(error){
        console.error("No se pudieron cargar los juegos desde Google Sheets:",error);
        renderGamesError();
    }
}

/* PARSER CSV */
function parseCSV(csv){
    const rows=[];let row=[],value="",insideQuotes=false;
    for(let i=0;i<csv.length;i++){
        const char=csv[i],next=csv[i+1];
        if(char==='"'&&insideQuotes&&next==='"'){value+='"';i++;}
        else if(char==='"')insideQuotes=!insideQuotes;
        else if(char===','&&!insideQuotes){row.push(value.trim());value="";}
        else if((char==='\n'||char==='\r')&&!insideQuotes){if(value||row.length){row.push(value.trim());rows.push(row);row=[];value="";}}
        else value+=char;
    }
    if(value||row.length){row.push(value.trim());rows.push(row);}
    const headers=rows.shift().map(header=>header.replace(/^\uFEFF/,"").replace(/^"|"$/g,"").trim());
    return rows.map(values=>Object.fromEntries(headers.map((header,index)=>[header,(values[index]||"").replace(/^"|"$/g,"").trim()])));
}

/* ERROR DE JUEGOS */
function renderGamesError(){
    const containers=[document.getElementById("home-games-grid"),document.getElementById("all-games-grid")];
    containers.forEach(container=>{
        if(container)container.innerHTML=`<div class="empty-section"><span>⚠️</span><h2>No se pudieron cargar los juegos</h2><p>Intenta actualizar la página nuevamente.</p></div>`;
    });
}

/* CARGAR FOTOS DESDE GOOGLE SHEETS */
async function loadPhotos(){
    const url="https://docs.google.com/spreadsheets/d/e/2PACX-1vTf7oacZeR0e_IOhGZsNrgmP-XjGB3Ns-zGRL-_XoA6bgQXJv6nJumqqBORcWBBawQnMRLe7sgfSzX5/pub?gid=1287530204&single=true&output=csv";
    try{
        const response=await fetch(url);
        if(!response.ok)throw new Error(`Error HTTP: ${response.status}`);
        const csv=await response.text();
        const data=parseCSV(csv);
        const getValue=(item,name)=>{
            const key=Object.keys(item).find(key=>key.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase()===name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase());
            return key?item[key]:"";
        };
        photos=data.map(item=>({
            id:getValue(item,"ID"),
            title:getValue(item,"Título"),
            description:getValue(item,"Descripción"),
            semester:getValue(item,"Semestre"),
            date:getValue(item,"Fecha"),
            images:getValue(item,"Imágenes").split("|").map(value=>value.trim()).filter(Boolean).map(value=>value.startsWith("http")||value.startsWith("assets/")?value:`assets/photos/${getValue(item,"ID")}/${value}`)
        })).filter(photo=>photo.id);
        console.log("Fotos cargadas desde Google Sheets:",photos);
        console.log("Primera imagen:",photos[0]?.images);
        renderPhotos();
        initializePhotoModal();
    }catch(error){
        console.error("No se pudieron cargar las fotos desde Google Sheets:",error);
    }
}

/* CARGAR VIDEOS DESDE GOOGLE SHEETS */
async function loadVideos(){
    const url="https://docs.google.com/spreadsheets/d/e/2PACX-1vTf7oacZeR0e_IOhGZsNrgmP-XjGB3Ns-zGRL-_XoA6bgQXJv6nJumqqBORcWBBawQnMRLe7sgfSzX5/pub?gid=1639227823&single=true&output=csv";
    try{
        const response=await fetch(url);
        if(!response.ok)throw new Error(`Error HTTP: ${response.status}`);
        const csv=await response.text();
        const data=parseCSV(csv);
        const getValue=(item,name)=>{
            const key=Object.keys(item).find(key=>key.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase()===name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase());
            return key?item[key]:"";
        };
        videos=data.map(item=>({
            id:getValue(item,"ID"),
            title:getValue(item,"Título"),
            description:getValue(item,"Descripción"),
            semester:getValue(item,"Semestre"),
            thumbnail:getValue(item,"Miniatura").split("|")[0].trim(),
            url:getValue(item,"Video")
        })).filter(video=>video.id);
        videos.forEach(video=>{
            if(video.thumbnail&&!video.thumbnail.startsWith("http")&&!video.thumbnail.startsWith("assets/"))video.thumbnail=`assets/videos/${video.id}/${video.thumbnail}`;
        });
        console.log("Videos cargados desde Google Sheets:",videos);
        renderVideos();
        initializeVideoModal();
    }catch(error){
        console.error("No se pudieron cargar los videos desde Google Sheets:",error);
        renderEmptyVideos();
    }
}

/* =========================================================
   CARGAR REALIDAD AUMENTADA DESDE GOOGLE SHEETS
========================================================= */

async function loadAR(){

    /*
     * REEMPLAZAR ESTE GID POR EL GID DE LA PESTAÑA AR
     */
    const url="https://docs.google.com/spreadsheets/d/e/2PACX-1vTf7oacZeR0e_IOhGZsNrgmP-XjGB3Ns-zGRL-_XoA6bgQXJv6nJumqqBORcWBBawQnMRLe7sgfSzX5/pub?gid=393796093&single=true&output=csv";

    try{

        const response=await fetch(url);

        if(!response.ok){
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const csv=await response.text();

        const data=parseCSV(csv);

        /*
         * Permite encontrar encabezados aunque tengan
         * diferencias de mayúsculas o tildes.
         */
        const getValue=(item,name)=>{

            const key=Object.keys(item).find(key=>
                key
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g,"")
                    .trim()
                    .toLowerCase()
                ===
                name
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g,"")
                    .trim()
                    .toLowerCase()
            );

            return key ? item[key] : "";
        };

        arProjects=data.map(item=>{

            const id=getValue(item,"ID");

            const imageValues=getValue(item,"Imagen")
                .split("|")
                .map(value=>value.trim())
                .filter(Boolean);

            const images=imageValues.map(value=>{

                if(
                    value.startsWith("http") ||
                    value.startsWith("assets/")
                ){
                    return value;
                }

                return `assets/ar/${id}/${value}`;

            });

            return {

                id:id,

                title:getValue(item,"Título"),

                description:getValue(item,"Descripción"),

                semester:getValue(item,"Semestre"),

                date:getValue(item,"Fecha"),

                platform:getValue(item,"Plataforma"),

                engine:getValue(item,"Motor"),

                link:getValue(item,"Enlace"),

                images:images

            };

        }).filter(project=>project.id);

        console.log(
            "Proyectos AR cargados desde Google Sheets:",
            arProjects
        );

        renderAR();

    }catch(error){

        console.error(
            "No se pudieron cargar los proyectos AR desde Google Sheets:",
            error
        );

        renderEmptyAR();

    }

}

/* =========================================================
   RENDERIZAR REALIDAD AUMENTADA
========================================================= */

function renderAR(){

    const container=document.getElementById("ar-grid");

    if(!container)return;

    container.innerHTML="";

    if(arProjects.length===0){

        renderEmptyAR();

        return;

    }

    arProjects.forEach(project=>{

        const card=document.createElement("article");

        card.className="ar-card";

        const image=
            project.images &&
            project.images.length>0
            ?project.images[0]
            :"";

        card.innerHTML=`

            <div class="ar-card-image-container">

                <img
                    class="ar-card-image"
                    src="${image}"
                    alt="${project.title||"Proyecto de realidad aumentada"}"
                >

                <div class="ar-card-overlay">

                    <div>

                        <h3 class="ar-card-title">
                            ${project.title||"Proyecto AR"}
                        </h3>

                        <span class="ar-card-semester">
                            ${project.semester||""}
                        </span>

                    </div>

                </div>

            </div>

            <div class="ar-card-content">

                <p class="ar-card-description">
                    ${project.description||""}
                </p>

                <div class="ar-card-meta">

                    ${
                        project.platform
                        ?`<span>${project.platform}</span>`
                        :""
                    }

                    ${
                        project.engine
                        ?`<span>${project.engine}</span>`
                        :""
                    }

                </div>

                ${
                    project.link
                    ?`
                        <a
                            class="ar-card-button"
                            href="${project.link}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Ver proyecto →
                        </a>
                    `
                    :""
                }

            </div>
        `;

        container.appendChild(card);

    });

}

/* =========================================================
   AR VACÍO
========================================================= */

function renderEmptyAR(){

    const container=document.getElementById("ar-grid");

    if(!container)return;

    container.innerHTML=`

        <div class="ar-empty">

            <span class="ar-empty-icon">
                📱
            </span>

            <h2>
                Aún no hay proyectos de Realidad Aumentada
            </h2>

            <p>
                Los proyectos desarrollados por los estudiantes
                aparecerán aquí.
            </p>

        </div>

    `;

}



/* INICIO */
function renderHomeGames(){
    const container=document.getElementById("home-games-grid");
    const count=document.getElementById("home-game-count");
    container.innerHTML="";
    games.forEach((game,index)=>container.appendChild(createGameCard(game,index)));
    if(count)count.textContent=`${games.length} ${games.length===1?"juego":"juegos"}`;
}

/* RENDERIZAR JUEGOS FILTRADOS */
function renderAllGames(career="all",subject="all",category="all",platform="all"){
    const container=document.getElementById("all-games-grid");
    if(!container)return;
    const filteredGames=games.filter(game=>(career==="all"||game.career===career)&&(subject==="all"||game.subject===subject)&&(category==="all"||game.category===category)&&(platform==="all"||game.platform===platform));
    container.innerHTML="";
    if(filteredGames.length===0){
        container.innerHTML=`<div class="empty-section"><span>🎮</span><h2>No hay juegos disponibles</h2><p>No encontramos juegos con los filtros seleccionados.</p></div>`;
        return;
    }
    filteredGames.forEach(game=>container.appendChild(createGameCard(game,games.indexOf(game))));
}

/* CREAR TARJETA */
function createGameCard(game,index){
    const card=document.createElement("article");
    card.className="game-card";
    const image=game.images&&game.images.length>0?game.images[0]:"";
    card.innerHTML=`<img class="game-card-image" src="${image}" alt="${game.name}"><div class="game-card-content"><h3 class="game-card-title">${game.name}</h3><p class="game-card-description">${game.description}</p><div class="game-card-meta"><span>${game.category||"Categoría"}</span><span>${game.platform||"Plataforma"}</span><span>${game.engine||"Motor"}</span></div></div>`;
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
    const categoryFilter=document.getElementById("category-filter");
    const platformFilter=document.getElementById("platform-filter");
    if(!careerFilter||!subjectFilter||!categoryFilter||!platformFilter)return;
    const populateFilter=(select,values,defaultText,currentValue="all")=>{
        select.innerHTML=`<option value="all">${defaultText}</option>`;
        [...new Set(values.filter(Boolean))].sort().forEach(value=>{
            const option=document.createElement("option");
            option.value=value;
            option.textContent=value;
            select.appendChild(option);
        });
        select.value=[...select.options].some(option=>option.value===currentValue)?currentValue:"all";
    };
    const updateFilters=()=>{
        const career=careerFilter.value;
        const subject=subjectFilter.value;
        const category=categoryFilter.value;
        const platform=platformFilter.value;
        let availableGames=games;
        if(career!=="all")availableGames=availableGames.filter(game=>game.career===career);
        if(subject!=="all")availableGames=availableGames.filter(game=>game.subject===subject);
        populateFilter(category,availableGames.map(game=>game.category),"Todas las categorías",category);
        availableGames=games;
        if(career!=="all")availableGames=availableGames.filter(game=>game.career===career);
        if(subject!=="all")availableGames=availableGames.filter(game=>game.subject===subject);
        if(category!=="all")availableGames=availableGames.filter(game=>game.category===category);
        populateFilter(platform,availableGames.map(game=>game.platform),"Todas las plataformas",platform);
        renderAllGames(career,subject,category,platform);
    };
    populateFilter(careerFilter,games.map(game=>game.career),"Todas las carreras");
    populateFilter(subjectFilter,games.map(game=>game.subject),"Todas las asignaturas");
    populateFilter(categoryFilter,games.map(game=>game.category),"Todas las categorías");
    populateFilter(platformFilter,games.map(game=>game.platform),"Todas las plataformas");
    careerFilter.addEventListener("change",()=>{
        subjectFilter.value="all";
        categoryFilter.value="all";
        platformFilter.value="all";
        updateFilters();
    });
    subjectFilter.addEventListener("change",()=>{
        categoryFilter.value="all";
        platformFilter.value="all";
        updateFilters();
    });
    categoryFilter.addEventListener("change",()=>{
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

/* ROTADOR DE GOTA */
function initializeGotas(){
    const gotas=games.filter(game=>game.gotas&&game.gotas.enabled);
    if(gotas.length===0)return;
    let currentIndex=0;
    const renderGota=()=>{
        const game=gotas[currentIndex];
        const container=document.getElementById("gota-featured");
        if(!container)return;
        const image=game.images&&game.images.length>0?game.images[0]:"";
        container.innerHTML=`<div class="gota-featured-image"><img src="${image}" alt="${game.name}"></div><div class="gota-featured-content"><span class="gota-label">G.O.T.A</span><h2>${game.name}</h2><p>${game.description}</p><div class="gota-meta"><span>${game.category||"Categoría"}</span><span>${game.platform||"Plataforma"}</span><span>${game.engine||"Motor"}</span></div><button class="gota-button">Ver juego</button></div>`;
        container.querySelector(".gota-button").addEventListener("click",()=>showGameDetail(games.indexOf(game)));
    };
    renderGota();
    if(gotas.length>1)setInterval(()=>{currentIndex=(currentIndex+1)%gotas.length;renderGota();},10000);
}

/* ROTADOR GOTA EN INICIO */
function initializeHeroGotas(){
    const gotas=games.filter(game=>game.gotas&&game.gotas.enabled);
    if(!gotas.length)return;
    let currentIndex=Math.floor(Math.random()*gotas.length);
    const background=document.getElementById("hero-background");
    const label=document.getElementById("hero-label");
    const title=document.getElementById("hero-title");
    const description=document.getElementById("hero-description");
    const meta=document.getElementById("hero-meta");
    const download=document.getElementById("hero-download");
    const render=()=>{
        const game=gotas[currentIndex];
        const image=game.images&&game.images.length?game.images[0]:"";
        background.style.backgroundImage=image?`url("${image}")`:"";
        label.textContent=`G.O.T.A · ${game.semester||"GANADOR"}`;
        title.textContent=game.name;
        description.textContent=game.description;
        meta.innerHTML=`<span>${game.category||"Categoría"}</span><span>${game.platform||"Plataforma"}</span><span>${game.engine||"Motor"}</span>`;
        download.href=game.link||"#";
        download.style.display=game.link?"inline-flex":"none";
    };
    render();
    if(gotas.length>1)setInterval(()=>{currentIndex=(currentIndex+1)%gotas.length;render()},10000);
}


/* G.O.T.A.S HALL OF FAME */
function renderGotas(){
    const gotas=games.filter(game=>game.gotas&&game.gotas.enabled).sort((a,b)=>String(b.semester||"").localeCompare(String(a.semester||"")));
    const winnerContainer=document.getElementById("gotas-winner");
    const historyContainer=document.getElementById("gotas-history-grid");
    if(!winnerContainer||!historyContainer)return;
    winnerContainer.innerHTML="";
    historyContainer.innerHTML="";
    if(gotas.length===0){renderEmptyGotas();return;}
    renderGotasWinner(gotas[0]);
    gotas.slice(1).forEach(game=>renderGotaHistoryCard(game));
}

/* GANADOR ACTUAL */
function renderGotasWinner(game){
    const container=document.getElementById("gotas-winner");
    if(!game){renderEmptyGotas();return;}
    const authors=game.authors&&game.authors.length?game.authors.join(" · "):"Autores no disponibles";
    const image=game.images&&game.images.length?game.images[0]:"";
    container.innerHTML=`<div class="gotas-winner-card"><div class="gotas-winner-image"><img src="${image}" alt="${game.name}"></div><div class="gotas-winner-info"><span class="gotas-trophy">🏆</span><span class="gotas-position">GANADOR G.O.T.A</span><span class="gotas-winner-semester">${game.semester||""}</span><h2>${game.name}</h2><p>${game.description||""}</p><div class="gotas-authors">${authors}</div><div class="gotas-meta"><span>${game.category||"Categoría"}</span><span>${game.platform||"Plataforma"}</span><span>${game.engine||"Motor"}</span></div><button class="gotas-winner-button">Ver juego →</button></div></div>`;
    container.querySelector(".gotas-winner-button").addEventListener("click",()=>showGameDetail(games.indexOf(game)));
}

/* HISTORIAL */
function renderGotaHistoryCard(game){
    const container=document.getElementById("gotas-history-grid");
    const image=game.images&&game.images.length?game.images[0]:"";
    const card=document.createElement("article");
    card.className="gota-history-card";
    card.innerHTML=`<div class="gota-history-image"><img src="${image}" alt="${game.name}"><span class="gota-history-trophy">🏆</span></div><div class="gota-history-content"><span class="gota-history-semester">${game.semester||"Semestre"}</span><h3>${game.name}</h3><p>${game.category||"Proyecto"}</p><button>Ver juego →</button></div>`;
    card.addEventListener("click",()=>showGameDetail(games.indexOf(game)));
    container.appendChild(card);
}

/* SIN G.O.T.A.S */
function renderEmptyGotas(){
    const container=document.getElementById("gotas-winner");
    const history=document.getElementById("gotas-history-grid");
    if(container)container.innerHTML=`<div class="gotas-empty"><span class="gotas-empty-icon">🏆</span><h2>Aún no hay ganadores</h2><p>Los reconocimientos aparecerán aquí cuando sean publicados.</p></div>`;
    if(history)history.innerHTML="";
}

/* FOTOS */
function renderPhotos(semester="all"){
    const container=document.getElementById("photos-grid");
    const filters=document.getElementById("photo-filters");
    container.innerHTML="";
    filters.innerHTML="";
    if(photos.length===0){renderEmptyPhotos();return;}
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
    if(filteredPhotos.length===0){renderEmptyPhotos();return;}
    filteredPhotos.forEach(photo=>{
        if(!photo.images||photo.images.length===0)return;
        const card=document.createElement("article");
        card.className="photo-card";
        card.innerHTML=`<img src="${photo.images[0]}" alt="${photo.title||"Foto del curso"}"><div class="photo-card-overlay"><div><h3 class="photo-card-title">${photo.title||"Foto del curso"}</h3><span class="photo-card-semester">${photo.semester||""}</span></div><span class="photo-card-count">${photo.images.length} 📸</span></div>`;
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
    const prevButton=document.getElementById("photo-modal-prev");
    const nextButton=document.getElementById("photo-modal-next");
    if(closeButton)closeButton.addEventListener("click",closePhotoModal);
    if(backdrop)backdrop.addEventListener("click",closePhotoModal);
    if(prevButton)prevButton.addEventListener("click",()=>changePhoto(-1));
    if(nextButton)nextButton.addEventListener("click",()=>changePhoto(1));
    document.addEventListener("keydown",event=>{
        if(!document.getElementById("photo-modal").classList.contains("active"))return;
        if(event.key==="Escape")closePhotoModal();
        if(event.key==="ArrowLeft")changePhoto(-1);
        if(event.key==="ArrowRight")changePhoto(1);
    });
}

/* ABRIR ÁLBUM */
function openPhotoModal(photo){
    if(!photo.images||photo.images.length===0)return;
    currentPhotoAlbum=photo;
    currentPhotoIndex=0;
    updatePhotoModal();
    document.getElementById("photo-modal").classList.add("active");
    document.body.style.overflow="hidden";
}

/* ACTUALIZAR FOTO */
function updatePhotoModal(){
    if(!currentPhotoAlbum)return;
    const image=currentPhotoAlbum.images[currentPhotoIndex];
    const total=currentPhotoAlbum.images.length;
    document.getElementById("photo-modal-image").src=image;
    document.getElementById("photo-modal-image").alt=currentPhotoAlbum.title||"Foto del curso";
    document.getElementById("photo-modal-semester").textContent=currentPhotoAlbum.semester||"";
    document.getElementById("photo-modal-title").textContent=currentPhotoAlbum.title||"Foto del curso";
    document.getElementById("photo-modal-description").textContent=currentPhotoAlbum.description||"";
    document.getElementById("photo-modal-counter").textContent=`${currentPhotoIndex+1} / ${total}`;
    document.getElementById("photo-modal-prev").style.display=total>1?"flex":"none";
    document.getElementById("photo-modal-next").style.display=total>1?"flex":"none";
}

/* CAMBIAR FOTO */
function changePhoto(direction){
    if(!currentPhotoAlbum||currentPhotoAlbum.images.length<=1)return;
    const total=currentPhotoAlbum.images.length;
    currentPhotoIndex=(currentPhotoIndex+direction+total)%total;
    updatePhotoModal();
}

/* CERRAR FOTO */
function closePhotoModal(){
    const modal=document.getElementById("photo-modal");
    modal.classList.remove("active");
    document.getElementById("photo-modal-image").src="";
    currentPhotoAlbum=null;
    currentPhotoIndex=0;
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
    loadAR();
});