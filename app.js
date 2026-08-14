async function loadGames() {

    try {

        const response = await fetch("data/games.json");

        if (!response.ok) {
            throw new Error("No se pudo cargar games.json");
        }

        const data = await response.json();

        const games = data.projects;

        const container = document.getElementById("games-container");

        games.forEach(game => {

            const card = document.createElement("article");

            card.innerHTML = `
                <img 
                    src="${game.images[0]}" 
                    alt="${game.name}"
                >

                <h3>${game.name}</h3>

                <p>${game.description}</p>

                <p>
                    <strong>Motor:</strong> ${game.engine}
                </p>

                <p>
                    <strong>Plataforma:</strong> ${game.platform}
                </p>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error("Error:", error);

    }

}

loadGames();